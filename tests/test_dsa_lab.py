import random
import unittest

from app import app
from dsa.search_sort import binary_search, insertion_sort, merge_sort


class AlgorithmTests(unittest.TestCase):
    def test_sort_results_and_snapshots(self):
        generator = random.Random(42)
        cases = [[], [5], [4, 4, -2, 0], list(range(20)), list(range(20, 0, -1))]
        cases.extend([generator.choices(range(-10, 11), k=20) for _ in range(20)])
        for algorithm in (merge_sort, insertion_sort):
            for values in cases:
                with self.subTest(algorithm=algorithm.__name__, values=values):
                    original = values[:]
                    result = algorithm(values)
                    self.assertEqual(result["items"], sorted(values))
                    self.assertEqual(result["steps"][-1]["items"], sorted(values))
                    self.assertEqual(values, original)
                    for step in result["steps"]:
                        self.assertEqual(len(step["items"]), len(values))
                        self.assertTrue(all(0 <= index < len(values) for index in step["active"]))

    def test_binary_search_bounds_and_results(self):
        for values in ([], [4], [7, -2, 4, 4, 0]):
            for target in (-3, -2, 0, 4, 7, 99):
                with self.subTest(values=values, target=target):
                    result = binary_search(values, target)
                    self.assertEqual(result["found"], target in values)
                    self.assertEqual(result["items"], sorted(values))
                    if result["found"]:
                        self.assertEqual(result["items"][result["index"]], target)
                    else:
                        self.assertEqual(result["index"], -1)
                    previous_size = len(values) + 1
                    for step in result["steps"]:
                        self.assertLessEqual(step["low"], step["middle"])
                        self.assertLessEqual(step["middle"], step["high"])
                        size = step["high"] - step["low"] + 1
                        self.assertLess(size, previous_size)
                        previous_size = size


class ApiTests(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    def heap(self, action, **values):
        return self.client.post("/api/dsa/heap", json={"action": action, **values})

    def assert_heap_order(self, items):
        for index in range(1, len(items)):
            self.assertLessEqual(items[(index - 1) // 2], items[index])

    def test_numeric_routes_and_invalid_inputs(self):
        for algorithm in ("merge-sort", "insertion-sort", "binary-search"):
            endpoint = "/api/dsa/" + algorithm
            result = self.client.post(endpoint, json={"items": [3, -1, 3], "target": 3})
            self.assertEqual(result.status_code, 200)
            self.assertEqual(result.json["items"], [-1, 3, 3])
            for invalid in (None, "1,2", [True], [1.5], [1000], list(range(21))):
                self.assertEqual(self.client.post(endpoint, json={"items": invalid}).status_code, 400)
            self.assertEqual(self.client.post(endpoint, json=["invalid"]).status_code, 400)
        for target in (None, True, 1.5, "3", 1000):
            response = self.client.post("/api/dsa/binary-search", json={"items": [3], "target": target})
            self.assertEqual(response.status_code, 400)

    def test_empty_and_custom_linear_search(self):
        response = self.client.post("/api/dsa/linear-search", json={"items": [], "target": "Yoga"})
        self.assertFalse(response.json["found"])
        self.assertEqual(response.json["steps"], [])
        response = self.client.post("/api/dsa/linear-search", json={"items": ["Running", "Rowing", "Yoga"], "target": " rowing "})
        self.assertEqual(response.json["index"], 1)

    def test_heap_priority_ties_and_snapshots(self):
        for name, priority in (("First", 3), ("Urgent", 1), ("Second", 3), ("Middle", 2)):
            response = self.heap("insert", value=name, priority=priority)
            self.assertEqual(response.status_code, 200)
            self.assert_heap_order(response.json["items"])
        before = self.heap("view").json["items"]
        self.assertEqual(self.heap("peek").json["items"], before)
        result = self.heap("process-all").json
        self.assertEqual([item[2] for item in result["processed"]], ["Urgent", "Middle", "First", "Second"])
        self.assertEqual(result["items"], [])
        self.assertEqual(len(result["steps"]), 8)
        self.assertEqual(len(result["steps"][0]["items"]), 4)
        for step in result["steps"]:
            self.assert_heap_order(step["items"])
        self.assertEqual(self.heap("process").status_code, 400)

    def test_heap_capacity_validation_and_single_processing(self):
        for index in range(15):
            self.assertEqual(self.heap("insert", value=f"Workout {index}", priority=15-index).status_code, 200)
        self.assertEqual(self.heap("insert", value="Overflow", priority=1).status_code, 400)
        result = self.heap("process").json
        self.assertEqual(len(result["items"]), 14)
        self.assertEqual(result["processed"][0][0], 1)
        self.assert_heap_order(result["items"])
        for priority in (0, 100, True, "1", 1.5):
            self.assertEqual(self.heap("insert", value="Invalid", priority=priority).status_code, 400)
        self.assertEqual(self.heap("insert", value="", priority=1).status_code, 400)
        self.assertEqual(self.heap("insert", value="a" * 41, priority=1).status_code, 400)
        self.assertEqual(self.client.post("/api/dsa/heap", json=["invalid"]).status_code, 400)
        self.assertEqual(self.heap("clear").json["items"], [])

    def test_template_sections(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        for section in ("merge", "insertion", "binary", "heap"):
            self.assertIn(f'id="{section}"', response.get_data(as_text=True))


if __name__ == "__main__":
    unittest.main()