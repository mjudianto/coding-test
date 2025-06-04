from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse
from app.services.chatbot_service import generate_ai_answer
from app.services.sales_service import get_user_by_id, get_all_clients_list
from app.model.chatbot_model import ChatbotRequest

router = APIRouter()

@router.post("/ai")
async def ask_ai(request: ChatbotRequest):
    try:
        body = await request.json()
        question = body.get("question", "")
        
        if not question:
            return JSONResponse(
                status_code=400,
                content={
                    "success": False,
                    "data": None,
                    "message": "Question is required."
                }
            )

        answer = generate_ai_answer(question)
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "data": {"answer": answer},
                "message": "Answer generated successfully."
            }
        )

    except ValueError:
        return JSONResponse(
            status_code=400,
            content={
                "success": False,
                "data": None,
                "message": "Invalid JSON input."
            }
        )
    except Exception as e:
        print(f"Error: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "data": None,
                "message": f"Internal server error: {str(e)}"
            }
        )

