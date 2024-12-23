from bson import ObjectId
from fastapi import APIRouter, HTTPException, Path
from dtos import UserDto
from config import configUser

# Initialize Router
router = APIRouter()
userCollection = configUser()

#masterlist
#get masterlist by userName or Role
@router.get("/", tags=["users"])
async def get_user(userName: str = None, userRole: int = None):
    # Build query based on the provided parameters
    query = {}
    if userName is not None:
        query["userName"] = userName
    if userRole is not None:
        query["userRole"] = userRole
    
    print(query)

    # Fetch matching users
    users = userCollection.find(query)

    # Format the response and remove passwords
    result = [
        {**user, "_id": str(user["_id"])} for user in users
    ]
    for user in result:
        user.pop("password", None)  # Remove password field if present

    if not result:
        raise HTTPException(status_code=404, detail="No users found matching the criteria")

    return result

@router.post("/", tags=["users"], status_code=201)
async def add_user(user: UserDto):
    # Validate password length
    if (user.userRole != 0 and (len(user.password) < 8 or len(user.password) > 16)):
        raise HTTPException(status_code=400, detail="Password must be between 8 and 16 characters")
    elif (user.userRole == 0):
        user.password = ""

    # Check if username already exists
    existing_user = userCollection.find_one({"userName": user.userName})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")

    result = userCollection.insert_one(user.model_dump())
    return {"_id": str(result.inserted_id)}

#update masterlist
@router.put("/{userName}", tags=["users"])
async def update_user(userName: str, user: UserDto):
    user_data = user.model_dump(exclude_unset=True)
    result = userCollection.update_one({"userName": userName}, {"$set": user_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    user_data.pop("password", None)  # Remove password field if present
    return {"message": "User updated successfully", "updatedFields": user_data}

#delete masterlist
@router.delete("/{userName}", tags=["users"])
async def delete_user(userName: str):
    result = userCollection.delete_one({"userName": userName})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}
