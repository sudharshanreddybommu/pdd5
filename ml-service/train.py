import os
import sys
import glob
import json
import time
import argparse
from pathlib import Path

# Fix Windows console UTF-8 output
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

import numpy as np
from PIL import Image, ImageStat
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
import joblib

try:
    from xgboost import XGBClassifier
    HAS_XGBOOST = True
except ImportError:
    HAS_XGBOOST = False

def extract_comprehensive_features(image_path_or_bytes):
    """
    Extracts high-dimensional oral lesion clinical visual features:
    - RGB, HSV, Lab color channel statistics (mean, std, skewness)
    - Redness index (Erythema / Erythroplakia indicator)
    - Whiteness / Keratinization index (Leukoplakia indicator)
    - Texture contrast, local gradient variance, and heterogeneity
    """
    try:
        if isinstance(image_path_or_bytes, (str, Path)):
            img = Image.open(image_path_or_bytes).convert('RGB')
        else:
            import io
            img = Image.open(io.BytesIO(image_path_or_bytes)).convert('RGB')
        
        img_resized = img.resize((224, 224))
        arr_rgb = np.array(img_resized, dtype=np.float32) / 255.0
        
        # RGB moments
        r, g, b = arr_rgb[:, :, 0], arr_rgb[:, :, 1], arr_rgb[:, :, 2]
        r_mean, g_mean, b_mean = np.mean(r), np.mean(g), np.mean(b)
        r_std, g_std, b_std = np.std(r), np.std(g), np.std(b)
        
        # HSV conversion for clinical colorimetry
        img_hsv = img_resized.convert('HSV')
        arr_hsv = np.array(img_hsv, dtype=np.float32) / 255.0
        h, s, v = arr_hsv[:, :, 0], arr_hsv[:, :, 1], arr_hsv[:, :, 2]
        h_mean, s_mean, v_mean = np.mean(h), np.mean(s), np.mean(v)
        h_std, s_std, v_std = np.std(h), np.std(s), np.std(v)
        
        # Clinical Indices:
        # 1. Redness index: Erythroplakia / mucosal hypervascularity
        redness_index = (r_mean - g_mean) / (r_mean + g_mean + 1e-5)
        # 2. Whiteness index: Leukoplakia / hyperkeratinization
        whiteness_index = (r_mean + g_mean + b_mean) / 3.0
        # 3. Vascular Contrast: (R - B) contrast
        vascular_contrast = np.std(r - b)
        # 4. Color Asymmetry / Heterogeneity
        color_heterogeneity = float(np.std(r) * 0.5 + np.std(g) * 0.3 + np.std(b) * 0.2)
        # 5. Grayscale gradient variance (Texture / Ulcer edge roughness)
        gray = np.array(img_resized.convert('L'), dtype=np.float32)
        gy, gx = np.gradient(gray)
        edge_density = float(np.mean(np.sqrt(gx**2 + gy**2)))
        texture_roughness = float(np.std(np.sqrt(gx**2 + gy**2)))
        
        # Quadrant color asymmetry
        h_mid, w_mid = 112, 112
        q1_red = np.mean(r[:h_mid, :w_mid])
        q2_red = np.mean(r[:h_mid, w_mid:])
        q3_red = np.mean(r[h_mid:, :w_mid])
        q4_red = np.mean(r[h_mid:, w_mid:])
        quadrant_asymmetry = float(np.std([q1_red, q2_red, q3_red, q4_red]))

        features = np.array([
            r_mean, g_mean, b_mean,
            r_std, g_std, b_std,
            h_mean, s_mean, v_mean,
            h_std, s_std, v_std,
            redness_index, whiteness_index,
            vascular_contrast, color_heterogeneity,
            edge_density, texture_roughness,
            quadrant_asymmetry
        ], dtype=np.float32)
        
        return features
    except Exception as e:
        return np.zeros(19, dtype=np.float32)

def find_dataset_directories(base_path=None):
    """
    Auto-detects dataset folder path from candidate locations.
    """
    candidates = [
        base_path,
        "C:/Users/pille/Downloads/archive/Oral Images Dataset",
        "C:/Users/pille/Downloads/archive",
        "./archive/Oral Images Dataset",
        "./archive",
        "../archive",
        "./ml-service/data/archive",
        "./data/archive"
    ]
    
    for cand in candidates:
        if cand and os.path.exists(cand):
            # Check if it has oral dataset subfolders
            subdirs = [d for d in os.listdir(cand) if os.path.isdir(os.path.join(cand, d))]
            if any("data" in d.lower() or "benign" in d.lower() or "oral" in d.lower() for d in subdirs):
                return os.path.abspath(cand)
            # Check recursive
            found = glob.glob(os.path.join(cand, "**/*benign*"), recursive=True)
            if found:
                return os.path.abspath(cand)
    return None

def load_dataset_from_directory(root_dir):
    """
    Recursively scans and parses benign (label=0) and malignant/OPMD (label=1) images.
    """
    image_paths = []
    labels = []
    class_names = ["Benign / Low Risk", "Malignant / Premalignant (OPMD)"]
    
    image_extensions = ("*.jpg", "*.jpeg", "*.png", "*.bmp", "*.webp")
    all_files = []
    for ext in image_extensions:
        all_files.extend(glob.glob(os.path.join(root_dir, "**", ext), recursive=True))
        all_files.extend(glob.glob(os.path.join(root_dir, "**", ext.upper()), recursive=True))
    
    all_files = list(set(all_files))
    
    for f in all_files:
        f_lower = f.lower()
        if "malignant" in f_lower or "cancer" in f_lower or "opmd" in f_lower or "leukoplakia" in f_lower or "erythroplakia" in f_lower or "osmf" in f_lower:
            image_paths.append(f)
            labels.append(1) # Malignant / Pre-cancerous
        elif "benign" in f_lower or "normal" in f_lower or "healthy" in f_lower:
            image_paths.append(f)
            labels.append(0) # Benign / Normal
    
    return image_paths, np.array(labels), class_names

def train_oral_model(data_dir=None, output_dir=None):
    print("=" * 70, flush=True)
    print("🦷 OPMD Care – Oral Lesion Machine Learning Model Training Pipeline", flush=True)
    print("=" * 70, flush=True)
    
    dataset_path = find_dataset_directories(data_dir)
    if not dataset_path:
        print(f"❌ Error: Dataset directory not found.", flush=True)
        print("Please place your 'archive' folder in your project directory or in Downloads.", flush=True)
        return False
    
    print(f"📂 Dataset Path Found: {dataset_path}", flush=True)
    print("🔍 Scanning images...", flush=True)
    
    image_paths, labels, class_names = load_dataset_from_directory(dataset_path)
    total_samples = len(image_paths)
    
    if total_samples == 0:
        print("❌ No images with valid labels found in dataset.", flush=True)
        return False
    
    benign_count = int(np.sum(labels == 0))
    malignant_count = int(np.sum(labels == 1))
    
    print(f"📊 Dataset Summary:", flush=True)
    print(f"   • Total Images: {total_samples}", flush=True)
    print(f"   • Benign / Low Risk: {benign_count}", flush=True)
    print(f"   • Malignant / High Risk OPMD: {malignant_count}", flush=True)
    
    # Feature Extraction
    print("\n⚙️ Extracting Clinical Morphological & Colorimetric Features (19 dimensions)...", flush=True)
    start_time = time.time()
    X = []
    valid_y = []
    
    for i, path in enumerate(image_paths):
        if (i + 1) % 250 == 0 or (i + 1) == total_samples:
            print(f"   Processed {i + 1}/{total_samples} images...", flush=True)
        feats = extract_comprehensive_features(path)
        if np.any(feats):
            X.append(feats)
            valid_y.append(labels[i])
            
    X = np.array(X, dtype=np.float32)
    y = np.array(valid_y, dtype=np.int64)
    elapsed = round(time.time() - start_time, 2)
    print(f"✅ Extracted features for {len(X)} images in {elapsed}s.", flush=True)
    
    # Split Train/Test
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    
    print(f"\n🧠 Training Ensemble Model (XGBoost + GradientBoosting)...", flush=True)
    if HAS_XGBOOST:
        model = XGBClassifier(
            n_estimators=150,
            max_depth=5,
            learning_rate=0.08,
            subsample=0.85,
            colsample_bytree=0.85,
            eval_metric='logloss',
            random_state=42
        )
    else:
        model = GradientBoostingClassifier(
            n_estimators=150,
            max_depth=5,
            learning_rate=0.08,
            subsample=0.85,
            random_state=42
        )
        
    model.fit(X_train, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]
    
    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred, zero_division=0))
    rec = float(recall_score(y_test, y_pred, zero_division=0))
    f1 = float(f1_score(y_test, y_pred, zero_division=0))
    auc = float(roc_auc_score(y_test, y_prob))
    cm = confusion_matrix(y_test, y_pred).tolist()
    
    print("\n" + "=" * 50, flush=True)
    print("📈 Model Performance Metrics:", flush=True)
    print("=" * 50, flush=True)
    print(f"   • Accuracy:  {acc * 100:.2f}%", flush=True)
    print(f"   • Precision: {prec * 100:.2f}%", flush=True)
    print(f"   • Recall:    {rec * 100:.2f}%", flush=True)
    print(f"   • F1 Score:  {f1 * 100:.2f}%", flush=True)
    print(f"   • ROC-AUC:   {auc * 100:.2f}%", flush=True)
    print(f"   • Confusion Matrix: {cm}", flush=True)
    
    # Save Model
    if output_dir is None:
        output_dir = os.path.join(os.path.dirname(__file__), "app", "models", "saved")
    os.makedirs(output_dir, exist_ok=True)
    
    model_file = os.path.join(output_dir, "oral_lesion_model.joblib")
    meta_file = os.path.join(output_dir, "model_metadata.json")
    
    joblib.dump(model, model_file)
    
    metadata = {
        "model_name": "OPMD-Oral-Ensemble-Classifier",
        "version": "v2.0.0-trained",
        "trained_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "dataset_source": dataset_path,
        "total_samples": total_samples,
        "metrics": {
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1": round(f1, 4),
            "auc": round(auc, 4)
        },
        "classes": class_names,
        "feature_count": 19
    }
    
    with open(meta_file, "w") as f:
        json.dump(metadata, f, indent=2)
        
    print(f"\n💾 Model Artifacts Saved:", flush=True)
    print(f"   • Model Weights: {model_file}", flush=True)
    print(f"   • Metadata & Metrics: {meta_file}", flush=True)
    print("=" * 70, flush=True)
    print("🎉 Dataset Training Completed Successfully!", flush=True)
    print("=" * 70, flush=True)
    return True

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train OPMD oral lesion model on dataset images")
    parser.add_argument("--data", type=str, default=None, help="Path to archive dataset directory")
    parser.add_argument("--output", type=str, default=None, help="Path to save trained model")
    args = parser.parse_args()
    
    train_oral_model(data_dir=args.data, output_dir=args.output)
