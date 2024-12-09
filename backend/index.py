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

load_dotenv()
def configDb():
    MONGO_URI = os.environ.get("MONGO_URI")
    client = MongoClient(MONGO_URI)
    db = client['buildings']
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