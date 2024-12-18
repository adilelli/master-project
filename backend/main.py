import os
from fastapi import FastAPI
from pydantic import BaseModel
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": url}

# Define a model for POST requests
class Item(BaseModel):
    name: str
    description: str

@app.get("/items")
async def get_items():
    """Fetch all items from Supabase"""
    response = supabase.table("countries").select("*").execute()

    return response.data

@app.post("/items")
async def create_item(item: Item):
    print(item.name, item.description)
    try:
        response = supabase.table("items").insert({"name": item.name, "description": item.description}).execute()
        print(response)  # Debug response
        # return {"id": response.data[0]['id'], "name": item.name, "description": item.description}
    except Exception as e:
        print(e)
        return {"error": str(e)}

