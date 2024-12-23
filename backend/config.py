import os
from dotenv import load_dotenv
from pymongo import MongoClient


load_dotenv()
def configUser():
    MONGO_URI = os.environ.get("MONGO_URI")
    client = MongoClient(MONGO_URI)
    db = client['fses']
    user = db['users']
    return user

def configEvaluation():
    MONGO_URI = os.environ.get("MONGO_URI")
    client = MongoClient(MONGO_URI)
    db = client['fses']
    evaluation = db['evaluation']
    return evaluation