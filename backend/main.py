from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import uvicorn
import json
import os
import google.genai
import requests  

app = FastAPI()

GEMINI_API_KEY = "AIzaSyC6fH-iuDs89yT4v1U0Amlj4rQF-UhWmq4" 

# Allow requests from your frontend (localhost:3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # or ["*"] for all origins (less secure)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load dummy data with error handling
DUMMY_DATA = None
try:
    with open("dummyData.json", "r") as f:
        DUMMY_DATA = json.load(f)
except FileNotFoundError:
    print("Error: 'dummyData.json' file not found.")
except json.JSONDecodeError:
    print("Error: Failed to decode 'dummyData.json'. Please ensure the file contains valid JSON.")
except Exception as e:
    print(f"Error: {e}")

if DUMMY_DATA is None:
    DUMMY_DATA = {"salesReps": []}  # Default to an empty structure if loading fails

@app.get("/api/data")
def get_data():
    """
    Returns dummy data (e.g., list of users).
    """
    if DUMMY_DATA is None:
        raise HTTPException(status_code=500, detail="Failed to load data.")
    return DUMMY_DATA

@app.post("/api/ai")
async def ai_endpoint(request: Request):
    """
    Accepts a user question and returns an AI response using Google Gemini API with data from 'dummyData.json'.
    """
    try:
        # Extract the user's question from the request body
        body = await request.json()
        user_question = body.get("question", "")
        
        if not user_question:
            raise HTTPException(status_code=400, detail="Question is required.")
        
        # Load the dummy data from the file
        data = DUMMY_DATA
        
        # Prepare the payload for the Google Gemini API
        prompt = f"""
        Here is some sales data:

        {json.dumps(data)}

        Based on this data, please answer the following question:

        {user_question}
        """

        # Prepare the payload for the Google Gemini API
        payload = {
            "contents": [{
                "parts": [{
                    "text": prompt  # Use the user's question and data in the prompt
                }]
            }]
        }

        # Send the request to Google's Gemini API
        url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
        params = {"key": GEMINI_API_KEY}  # Replace with your actual API key
        headers = {"Content-Type": "application/json"}

        response = requests.post(url, json=payload, params=params, headers=headers)

        # Check if the request was successful
        if response.status_code != 200:
            # Log the error and response content for debugging
            print(f"Error response from Gemini API: {response.status_code} - {response.text}")
            raise HTTPException(status_code=500, detail=f"API request failed: {response.text}")

        # Get the response from the Gemini API
        ai_response = response.json()
        ai_answer = ai_response.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "No response from AI.")

        # Return the AI response
        return {"answer": ai_answer}

    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid JSON input.")
    except Exception as e:
        # Log the exception message for debugging
        print(f"An error occurred: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
    """
    Accepts a user question and returns an AI response using Google Gemini API.
    """
    try:
        # Extract the user's question from the request body
        body = await request.json()
        user_question = body.get("question", "")
        
        if not user_question:
            raise HTTPException(status_code=400, detail="Question is required.")
        
        # Prepare the payload for the Google Gemini API
        payload = {
            "contents": [{
                "parts": [{
                    "text": user_question  # Use the user's question in the API payload
                }]
            }]
        }

        # Send the request to Google's Gemini API
        url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
        params = {"key": "AIzaSyC6fH-iuDs89yT4v1U0Amlj4rQF-UhWmq4"}  # Replace with your actual API key
        headers = {"Content-Type": "application/json"}

        response = requests.post(url, json=payload, params=params, headers=headers)

        # Check if the request was successful
        if response.status_code != 200:
            # Log the error and response content for debugging
            print(f"Error response from Gemini API: {response.status_code} - {response.text}")
            raise HTTPException(status_code=500, detail=f"API request failed: {response.text}")

        # Extract the answer from the response
        data = response.json()

        # Access the text from the first candidate's content parts
        text_response = data.get("candidates", [])[0].get("content", {}).get("parts", [{}])[0].get("text", "")

        # Return the extracted text
        return {"answer": text_response}

    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid JSON input.")
    except Exception as e:
        # Log the exception message for debugging
        print(f"An error occurred: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@app.get("/api/user/{user_id}")
def get_user(user_id: int):
    """
    Returns detailed info for a single user by ID.
    """
    if DUMMY_DATA is None:
        raise HTTPException(status_code=500, detail="Failed to load data.")
    
    for user in DUMMY_DATA.get("salesReps", []):
        if user["id"] == user_id:
            return user

    raise HTTPException(status_code=404, detail=f"User with ID {user_id} not found.")

@app.get("/api/clients")
def get_all_clients():
    """
    Returns a combined list of all clients across all users.
    """
    if DUMMY_DATA is None:
        raise HTTPException(status_code=500, detail="Failed to load data.")
    
    clients = []
    for user in DUMMY_DATA.get("salesReps", []):
        for client in user.get("clients", []):
            clients.append({
                **client,
                "salesRepId": user["id"],
                "salesRepName": user["name"]
            })

    return {"clients": clients}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
