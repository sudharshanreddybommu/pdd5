import io
import numpy as np
from PIL import Image, ImageStat

def check_image_quality(image_bytes: bytes) -> dict:
    """
    Evaluates image blur, brightness, contrast, and resolution.
    """
    try:
        img = Image.open(io.BytesIO(image_bytes))
        width, height = img.size
        
        # Convert to grayscale for statistical analysis
        gray = img.convert('L')
        stat = ImageStat.Stat(gray)
        
        # Brightness (0-255)
        brightness = stat.mean[0]
        # Contrast / standard deviation (variance)
        contrast = stat.stddev[0]
        
        # Resolution check
        min_dim = min(width, height)
        is_resolution_ok = min_dim >= 200
        
        # Brightness check (avoid pitch dark < 30 or completely washed out > 235)
        is_brightness_ok = 30 <= brightness <= 235
        
        # Contrast / detail check (variance < 15 usually indicates extreme blur or blank frame)
        blur_score = float(contrast)
        is_blur_ok = blur_score >= 12.0
        
        passed = is_resolution_ok and is_brightness_ok and is_blur_ok
        
        return {
            "passed": bool(passed),
            "width": width,
            "height": height,
            "brightness": round(float(brightness), 2),
            "blur_score": round(float(blur_score), 2),
            "is_brightness_ok": bool(is_brightness_ok),
            "is_blur_ok": bool(is_blur_ok),
            "is_resolution_ok": bool(is_resolution_ok),
            "resolution": f"{width}x{height}",
            "message": "Valid oral image" if passed else "Image quality is insufficient. Please retake the image in good lighting."
        }
    except Exception as e:
        return {
            "passed": False,
            "width": 0,
            "height": 0,
            "brightness": 0.0,
            "blur_score": 0.0,
            "is_brightness_ok": False,
            "is_blur_ok": False,
            "is_resolution_ok": False,
            "resolution": "0x0",
            "message": f"Invalid image format: {str(e)}"
        }

def extract_image_features(image_bytes: bytes) -> np.ndarray:
    """
    Extracts 19-dimensional clinical visual features:
    - RGB, HSV color channel statistics (mean, std)
    - Redness index (Erythroplakia / mucosal erythema)
    - Whiteness index (Leukoplakia / hyperkeratinization)
    - Vascular contrast, color heterogeneity, edge density, texture roughness, quadrant asymmetry
    """
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        img_resized = img.resize((224, 224))
        arr_rgb = np.array(img_resized, dtype=np.float32) / 255.0
        
        r, g, b = arr_rgb[:, :, 0], arr_rgb[:, :, 1], arr_rgb[:, :, 2]
        r_mean, g_mean, b_mean = float(np.mean(r)), float(np.mean(g)), float(np.mean(b))
        r_std, g_std, b_std = float(np.std(r)), float(np.std(g)), float(np.std(b))
        
        img_hsv = img_resized.convert('HSV')
        arr_hsv = np.array(img_hsv, dtype=np.float32) / 255.0
        h, s, v = arr_hsv[:, :, 0], arr_hsv[:, :, 1], arr_hsv[:, :, 2]
        h_mean, s_mean, v_mean = float(np.mean(h)), float(np.mean(s)), float(np.mean(v))
        h_std, s_std, v_std = float(np.std(h)), float(np.std(g)), float(np.std(b))
        
        redness_index = float((r_mean - g_mean) / (r_mean + g_mean + 1e-5))
        whiteness_index = float((r_mean + g_mean + b_mean) / 3.0)
        vascular_contrast = float(np.std(r - b))
        color_heterogeneity = float(np.std(r) * 0.5 + np.std(g) * 0.3 + np.std(b) * 0.2)
        
        gray = np.array(img_resized.convert('L'), dtype=np.float32)
        gy, gx = np.gradient(gray)
        edge_density = float(np.mean(np.sqrt(gx**2 + gy**2)))
        texture_roughness = float(np.std(np.sqrt(gx**2 + gy**2)))
        
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
    except Exception:
        return np.zeros(19, dtype=np.float32)
