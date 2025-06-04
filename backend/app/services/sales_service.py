import json
import requests
from app.utils.load_data import load_sales_data

def get_user_by_id(user_id):
    data = load_sales_data()
    for user in data.get("salesReps", []):
        if user.get("id") == user_id:
            return user
    return None

def get_all_clients_list():
    clients = []
    data = load_sales_data()
    for user in data.get("salesReps", []):
        for client in user.get("clients", []):
            clients.append({
                **client,
                "salesRepId": user["id"],
                "salesRepName": user["name"]
            })
    return clients

def get_clients():
    clients = []
    data = load_sales_data()
    return data