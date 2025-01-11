from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from config import configUser
from services.auth_services import hash_password, verify_password, create_access_token  # type: ignore


router = APIRouter()
userCollection = configUser()
# Mock database for users
fake_users_db = {
    "test_user": {"username": "test_user", "hashed_password": hash_password("test_password")}
}

class Token(BaseModel):
    access_token: str
    token_type: str

class LoginDto(BaseModel):
    userName: str
    password: str

@router.post("/login", response_model=Token)
async def login(user: LoginDto):
    user_data = userCollection.find_one({"userName": user.userName})
    # user_data = fake_users_db.get(user.username)

    if not user_data:
        raise HTTPException(status_code=401, detail = "Invalid username or password")
    
    if user_data["attempt"] is not None and user_data["attempt"] > 3:
        raise HTTPException(status_code=403, detail = "You have reached maximum attempts of 3")
    
    if user.password != user_data["password"]:
        attempt = user_data["attempt"]
        user_data["attempt"] = attempt + 1
        result = userCollection.update_one({"userName": user.userName}, {"$set": user_data})
        raise HTTPException(status_code=401, detail = "Invalid username or password")
        
    
    if(user_data["userRole"] == 0):
        raise HTTPException(status_code=400, detail = "Only Office Assistant, Associate Professor and Professor can Login")

    access_token = create_access_token(data={"sub": user.userName, "role": user_data["userRole"]})
    user_data["attempt"] = 0
    result = userCollection.update_one({"userName": user.userName}, {"$set": user_data})
    return {"access_token": access_token, "token_type": "bearer"}
