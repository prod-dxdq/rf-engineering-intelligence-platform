import unittest

from fastapi.testclient import TestClient

from app.main import app


class CascadeAnalyzeTests(unittest.TestCase):
    def setUp(self) -> None:
        self.client = TestClient(app)

    def test_analyze_returns_extended_metrics(self) -> None:
        payload = {
            "stages": [
                {
                    "name": "LNA",
                    "gain_dB": 18.5,
                    "noise_figure_dB": 0.8,
                    "ip3_dBm": 22.0,
                },
                {
                    "name": "Mixer",
                    "gain_dB": -6.5,
                    "noise_figure_dB": 8.2,
                    "ip3_dBm": 15.0,
                },
                {
                    "name": "IF Amp",
                    "gain_dB": 25.0,
                    "noise_figure_dB": 3.5,
                    "ip3_dBm": 28.0,
                },
            ]
        }

        response = self.client.post("/cascade/analyze", json=payload)

        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertEqual(body.get("status"), "success")

        results = body.get("results", {})
        expected_keys = {
            "total_gain_dB",
            "total_noise_figure_dB",
            "input_ip3_dBm",
            "output_ip3_dBm",
            "dynamic_range_estimate_dB",
            "receiver_sensitivity_dBm",
            "stage_analysis",
            "spectrum_data",
        }

        self.assertTrue(expected_keys.issubset(results.keys()))
        self.assertIsNotNone(results["receiver_sensitivity_dBm"])
        self.assertIsInstance(results["stage_analysis"], list)
        self.assertIsInstance(results["spectrum_data"], list)
        self.assertGreater(len(results["spectrum_data"]), 0)


if __name__ == "__main__":
    unittest.main()
