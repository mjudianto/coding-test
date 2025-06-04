import json

DUMMY_DATA_PATH = "./dummyData.json"
_dummy_data_cache = None

def load_sales_data():
    global _dummy_data_cache

    if _dummy_data_cache is not None:
        return _dummy_data_cache

    try:
        with open(DUMMY_DATA_PATH, "r") as f:
            _dummy_data_cache = json.load(f)
    except FileNotFoundError:
        print(f"Error: '{DUMMY_DATA_PATH}' file not found.")
        _dummy_data_cache = {"salesReps": []}
    except json.JSONDecodeError:
        print(f"Error: Invalid JSON in '{DUMMY_DATA_PATH}'")
        _dummy_data_cache = {"salesReps": []}
    except Exception as e:
        print(f"Unexpected error: {e}")
        _dummy_data_cache = {"salesReps": []}

    return _dummy_data_cache
