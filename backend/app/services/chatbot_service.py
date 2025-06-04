import json
import requests
from app.utils.load_data import load_sales_data

GEMINI_API_KEY = "AIzaSyC6fH-iuDs89yT4v1U0Amlj4rQF-UhWmq4"
chat_sessions = {}  # In-memory store for session history

def generate_ai_answer(question, session_id="default"):
    # Load sales data
    data = load_sales_data()

    # Initialize session if it doesn't exist
    if session_id not in chat_sessions:
        chat_sessions[session_id] = []

    # Add user's question to session history
    chat_sessions[session_id].append({"role": "user", "text": question})

    # Format conversation history
    conversation = ""
    for msg in chat_sessions[session_id]:
        role = "User" if msg["role"] == "user" else "Assistant"
        conversation += f"{role}: {msg['text']}\n"

    # Build prompt with history and sales data
    prompt = f"""
Here is some sales data:
{json.dumps(data)}

Conversation history:
{conversation}

Please answer the latest question from the user.
"""

    # Gemini API call
    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
    payload = {
        "contents": [{"parts": [{"text": prompt}]}]
    }
    headers = {"Content-Type": "application/json"}
    params = {"key": GEMINI_API_KEY}

    response = requests.post(url, json=payload, headers=headers, params=params)

    if response.status_code != 200:
        raise Exception("AI API request failed.")

    response_json = response.json()
    answer = response_json.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "No response.")

    # Add assistant's response to session history
    chat_sessions[session_id].append({"role": "assistant", "text": answer})

    return answer
