from dtos import RequestResetDto, ResetPasswordDto, ResponseDto
from config import configUser
from services.auth_services import create_reset_token, hash_password, send_email, verify_password, create_access_token, verify_reset_token  # type: ignore
from fastapi import APIRouter, HTTPException, Depends, Body, Query
from pydantic import BaseModel, EmailStr
from typing import Optional
from jose import JWTError, jwt
from datetime import datetime, timedelta
from passlib.context import CryptContext

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

@router.post("/login", response_model = ResponseDto)
async def login(user: LoginDto):
    user_data = userCollection.find_one({"userName": user.userName})
    # user_data = fake_users_db.get(user.username)

    if not user_data:
        raise HTTPException(status_code=401, detail = "Invalid username or password")
    
    if user_data["attempt"] is not None and user_data["attempt"] >= 3:
        raise HTTPException(status_code=403, detail = "You have reached maximum attempts of 3. Please Contact Admin.")
    
    if user.password != user_data["password"]:
        attempt = user_data.get("attempt")
        user_data["attempt"] = attempt + 1
        result = userCollection.update_one({"userName": user.userName}, {"$set": user_data})
        raise HTTPException(status_code=401, detail = "Invalid username or password")
        
    
    if(user_data["userRole"] == 0):
        raise HTTPException(status_code=400, detail = "Only Office Assistant, Associate Professor and Professor can Login")

    access_token = create_access_token(data={"sub": user.userName, "role": user_data["userRole"]})
    user_data["attempt"] = 0
    result = userCollection.update_one({"userName": user.userName}, {"$set": user_data})

    token = {"access_token": access_token, "token_type": "bearer"}
    return ResponseDto(response="User updated successfully", viewModel = token, status=True)

@router.post("/email/{email}")
async def send_email_endpoint(email: str):
    await send_email(
        to_email=email,
        subject="Password Reset Request",
        body="Click here to reset your password: https://github.com/adilelli/master-project"
    )
    return {"message": "Email sent if the address exists."}


# Mock database
users_db = {
    "user@example.com": {
        "email": "user@example.com",
        "password_hash": "$2b$12$examplehash...",
        "reset_token": None,
        "reset_token_expiry": None,
    }
}

# Security settings
SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"
RESET_TOKEN_EXPIRE_MINUTES = 15


@router.post("/reset-password/request")
async def request_password_reset(body: RequestResetDto):
    email = body.email
    user = userCollection.find_one({"email": email})

    if not user:
        raise HTTPException(status_code=400, detail="Email not registered")

    # Generate reset token
    expiry = datetime.utcnow() + timedelta(minutes=RESET_TOKEN_EXPIRE_MINUTES)
    reset_token = jwt.encode({"sub": email, "exp": expiry}, SECRET_KEY, algorithm=ALGORITHM)
    user['reset_token'] = reset_token
    user['reset_token_expiry'] = expiry
    result = userCollection.update_one({"email": body.email}, {"$set": user})

    # Simulate sending an email
    print(f"Reset link: https://example.com/reset-password?token={reset_token}")

    return {"message": reset_token}


@router.get("/reset-password/verify")
async def verify_password_reset_token(token: str = Query(...)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")

        if not email:
            raise HTTPException(status_code=400, detail="Invalid token")

        user = userCollection.find_one({"email": email})
        if not user or user['reset_token'] != token or datetime.utcnow() > user['reset_token_expiry']:
            raise HTTPException(status_code=400, detail="Invalid or expired token")

        return {"message": "Token is valid", "email": email}
    except JWTError:
        raise HTTPException(status_code=400, detail="Invalid or expired token")


@router.post("/reset-password")
async def reset_password(body: ResetPasswordDto):
    try:
        payload = jwt.decode(body.token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")

        if not email:
            raise HTTPException(status_code=400, detail="Invalid token")

        user = userCollection.find_one({"email": email})
        if not user or user.get('reset_token') != body.token or datetime.utcnow() > user.get('reset_token_expiry'):
            raise HTTPException(status_code=400, detail="Invalid or expired token")

        # Update password and reset token
        user['password'] = body.new_password
        user['reset_token'] = None
        user['reset_token_expiry'] = None
        result = userCollection.update_one({"email": email}, {"$set": user})

        return {"message": "Password has been reset successfully."}
    except JWTError:
        raise HTTPException(status_code=400, detail="Invalid or expired token")