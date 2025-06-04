from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import chatbot_route, sales_route

app = FastAPI(
    Title="Sales AI Chatbot",
    description="A FastAPI application that provides an AI-powered chatbot for sales data inquiries.",
    version="1.0.0",
    docs_url="/docs",
    openapi_tags=[
        {
            "name": "chatbot",
            "description": "Endpoints for interacting with the AI chatbot."
        },
        {
            "name": "sales",
            "description": "Endpoints for sales data management."
        }
    ]
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(chatbot_route.router, prefix="/api/chatbot", tags=["chatbot"])
app.include_router(sales_route.router, prefix="/api/sales", tags=["sales"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="localhost", port=8000, reload=True)
