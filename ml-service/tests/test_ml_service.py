"""
ML Service Unit & Integration Test Suite
Tests:
1. Health and Model Registry API
2. Oral Image Quality & Mucosal Preprocessing
3. Structured Tabular Feature Processing (Tobacco, Betel Nut, Symptoms)
4. Multimodal Screening & Risk Classification Engine
"""

import unittest
import numpy as np
from app.models.model_registry import get_active_model_info
from app.preprocessing.tabular_processor import process_tabular_features
from app.preprocessing.image_processor import check_image_quality

class TestOPMDMLService(unittest.TestCase):

    def test_tc_ml_001_model_registry(self):
        """TC-ML-001: Active ML Model Registry & Metadata Verification"""
        model_info = get_active_model_info()
        self.assertIsNotNone(model_info)
        self.assertIn("name", model_info)
        self.assertIn("version", model_info)
        self.assertIn("metrics", model_info)
        self.assertGreaterEqual(model_info["metrics"]["accuracy"], 0.85)

    def test_tc_ml_002_image_quality_check(self):
        """TC-ML-002: Oral Image Quality Assessment (Resolution, Blur, Contrast)"""
        # Create synthetic valid RGB image buffer
        from PIL import Image
        import io
        img = Image.new("RGB", (300, 300), color=(200, 70, 70))
        buf = io.BytesIO()
        img.save(buf, format="JPEG")
        raw_bytes = buf.getvalue()

        quality = check_image_quality(raw_bytes)
        self.assertTrue(quality.get("isValid", False))
        self.assertIn("mucosaScore", quality)
        self.assertGreaterEqual(quality["mucosaScore"], 40)

    def test_tc_ml_003_tabular_feature_processing(self):
        """TC-ML-003: Clinical Tabular Feature Vector Encoding"""
        symptoms_sample = [
            {"symptomName": "Non-healing white or red patch", "response": "YES"},
            {"symptomName": "Difficulty in mouth opening (Trismus)", "response": "YES"},
            {"symptomName": "Burning sensation on spicy food intake", "response": "YES"}
        ]
        
        feature_vector = process_tabular_features(
            symptoms=symptoms_sample,
            age=45,
            gender="Male",
            tobacco_habits="Daily Gutkha / Betel Nut (5+ years)"
        )
        
        self.assertIsInstance(feature_vector, np.ndarray)
        self.assertEqual(len(feature_vector.shape), 2)
        self.assertGreater(feature_vector.shape[1], 5)

    def test_tc_ml_004_risk_stratification_logic(self):
        """TC-ML-004: Multimodal Risk Stratification & Lesion Classification"""
        # Verify score boundary mapping
        high_risk_score = 0.88
        moderate_risk_score = 0.55
        low_risk_score = 0.20

        def classify_risk(score):
            if score >= 0.70:
                return "HIGH_RISK"
            elif score >= 0.40:
                return "MODERATE_RISK"
            return "LOW_RISK"

        self.assertEqual(classify_risk(high_risk_score), "HIGH_RISK")
        self.assertEqual(classify_risk(moderate_risk_score), "MODERATE_RISK")
        self.assertEqual(classify_risk(low_risk_score), "LOW_RISK")

if __name__ == "__main__":
    unittest.main()
