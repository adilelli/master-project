from datetime import datetime, timedelta, timezone
from bson import ObjectId
from fastapi import HTTPException, Security
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from jose import JWTError, jwt
from passlib.context import CryptContext
import os
import asyncio
from email.mime.text import MIMEText
from aiosmtplib import SMTP

from config import configUser

# Secret key and algorithm
SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
userCollection = configUser()

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Hash password
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

# Verify password
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# Create JWT token
def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc).replace(tzinfo=None) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# Verify JWT token
def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_current_user(token: str = Security(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        role: str = payload.get("role")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        # evaluation = userCollection.find_one({"_id": ObjectId(username)})
        return username, role
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Email Configuration
SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 587
EMAIL_USER = "adil.elli09@gmail.com"
EMAIL_PASS = "Ad1lell1."

async def send_email(to_email: str, subject: str, body: str):
    # Create email
    message = MIMEText(body)
    message["From"] = EMAIL_USER
    message["To"] = to_email
    message["Subject"] = subject

    # Send email
    try:
        async with SMTP(hostname=SMTP_HOST, port=SMTP_PORT) as smtp:
            await smtp.connect()
            await smtp.starttls()  # Secure the connection
            await smtp.login(EMAIL_USER, EMAIL_PASS)
            await smtp.send_message(message)
            print(f"Email sent to {to_email}")
    except Exception as e:
        print(f"Failed to send email: {e}")


# Security settings
SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"
RESET_TOKEN_EXPIRE_MINUTES = 15

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_reset_token(email: str):
    expiry = datetime.utcnow() + timedelta(minutes=RESET_TOKEN_EXPIRE_MINUTES)
    to_encode = {"sub": email, "exp": expiry}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def verify_reset_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=400, detail="Invalid token")
        return email
    except JWTError:
        raise HTTPException(status_code=400, detail="Invalid or expired token")


def hash_password(password: str):
    return pwd_context.hash(password)