import json
import requests

GEMINI_API_KEY = "AIzaSyC6fH-iuDs89yT4v1U0Amlj4rQF-UhWmq4"

def generate_ai_answer(question):
    data = load_sales_data()
    prompt = f"""
    Here is some sales data:
    {json.dumps(data)}

    Based on this data, please answer the following question:
    {question}
    """

    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
    payload = {
        "contents": [{"parts": [{"text": prompt}]}]
    }
    headers = {"Content-Type": "application/json"}
    params = {"key": GEMINI_API_KEY}

    response = requests.post(url, json=payload, headers=headers, params=params)

    if response.status_code != 200:
        print(f"Gemini API error: {response.status_code} - {response.text}")
        raise Exception("AI API request failed.")

    response_json = response.json()
    return response_json.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "No response.")
