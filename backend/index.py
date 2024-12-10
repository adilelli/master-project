#db with mongodb
from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from pymongo import MongoClient
from bson.objectid import ObjectId
from datetime import datetime
from pymongo import MongoClient
import os
from dotenv import load_dotenv

from backend.dtos import BuildingDto, ShopDto

load_dotenv()
def configDb():
    MONGO_URI = os.environ.get("MONGO_URI")
    client = MongoClient(MONGO_URI)
    db = client['fse']
    collection = db['buildings']
    print("Connected to MongoDB!")
    print("Sample document:", list(collection.find()))
    return collection

# FastAPI app instance
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# MongoDB configuration
collection = configDb()


# Routes

@app.get("/", tags=["Root"])
async def root():
    return {"ok": "cool"}


# 1. Fetch all buildings
@app.get("/buildings", tags=["Buildings"])
async def get_all_buildings():
    buildings = collection.find()
    result = [
        {**building, "_id": str(building["_id"])} for building in buildings
    ]
    return result

# 3. Add a new building
@app.post("/buildings", tags=["Buildings"], status_code=201)
async def create_building(building: BuildingDto):
    print(building)
    result = collection.insert_one(dict(building))
    
    return {"_id": str(result.inserted_id)}

# 4. Update or add shops to a building
@app.put("/buildings/{building_id}/shops", tags=["Buildings"])
async def update_building_shops(building_id: str, request: Request):
    body = await request.json()
    if "shops" not in body:
        raise HTTPException(status_code=400, detail="Invalid data: 'shops' missing")

    shops = [ShopDto(**shop).dict() for shop in body["shops"]]

    result = collection.update_one(
        {"_id": ObjectId(building_id)},
        {"$set": {"shops": shops}}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Building not found")

    return {"message": "Shops updated successfully"}