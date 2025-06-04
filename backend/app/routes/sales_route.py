from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse
from app.services.sales_service import get_user_by_id, get_all_clients_list, get_clients

router = APIRouter()

@router.get("/api/data")
def get_data():
    try:
        data = get_clients()
        if not data:
            return JSONResponse(
                status_code=200,
                content={
                    "success": False,
                    "data": data,
                    "message": f"User Data not found."
                }
            )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "data": None,
                "message": f"Internal server error: {str(e)}"
            }
        )

@router.get("/user/{user_id}")
def get_user(user_id: int):
    try:
        user = get_user_by_id(user_id)
        if not user:
            return JSONResponse(
                status_code=404,
                content={
                    "success": False,
                    "data": None,
                    "message": f"User with ID {user_id} not found."
                }
            )
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "data": user,
                "message": "User retrieved successfully."
            }
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "data": None,
                "message": f"Internal server error: {str(e)}"
            }
        )

@router.get("/clients")
def get_clients():
    try:
        clients = get_all_clients_list()
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "data": {"clients": clients},
                "message": "Clients list retrieved successfully."
            }
        )
    except Exception as e:
        print(e)
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "data": None,
                "message": f"Internal server error: {str(e)}"
            }
        )