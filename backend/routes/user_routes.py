from typing import Any, Tuple
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Path, Query
from services.auth_services import create_access_token, get_current_user
from dtos import LoginDto, ResponseDto, TokenDto, UserDb, UserDto
from config import configUser
from typing import List

# Initialize Router
router = APIRouter()
userCollection = configUser()

#masterlist
# +CreateUser()/
# +Login()/
# +Delete()/
# +ViewMasterlist()/
# +UpdateUser()/

#get masterlist by userName or Role
@router.get("/", tags=["users"])
async def ViewMasterlist(userName: str = None, userRole: int = None, current_user: Tuple[str, Any] = Depends(get_current_user)):
    # username, role = current_user
    # Build query based on the provided parameters
    query = {}
    if userName is not None:
        query["userName"] = userName
    if userRole is not None:
        if userRole == 3:
            query["userRole"] = {"$gte": 3}
        else:
            query["userRole"] = userRole
    
    print(query)

    # Fetch matching users
    users = userCollection.find(query)

    # Format the response and remove passwords
    result = [
        {**user, "_id": str(user["_id"])} for user in users
    ]
    # for user in result:
    #     user.pop("password", None)  # Remove password field if present

    if not result:
        raise HTTPException(status_code=404, detail="No users found matching the criteria")

    return result

@router.post("/", tags=["users"], status_code=201)
async def CreateUser(user: UserDb, current_user: Tuple[str, Any] = Depends(get_current_user)):
    username, role = current_user
    if(role == 2):
        raise HTTPException(status_code=403, detail = "Program Coordintor cannot create staff")
    # Validate password length
    if (user.userRole != 0 and (len(user.password) < 8 or len(user.password) > 16)):
        raise HTTPException(status_code=400, detail="Password must be between 8 and 16 characters")
    user.firstTimer = True
    # Check if username already exists
    existing_user = userCollection.find_one({"userName": user.userName})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    # Check if email already exists
    existing_email = userCollection.find_one({"email": user.email})
    if existing_email:
        raise HTTPException(status_code=400, detail="Username already exists")

    result = userCollection.insert_one(user.model_dump())
    user_dict = user.model_dump()
    user_dict.pop("password", None)  # Remove password field if present
    return ResponseDto(response="User created successfully", viewModel = user_dict, status=True)

# Create multiple users
@router.post("/list", tags=["users"], status_code=201)
async def CreateUsers(users: List[UserDb], current_user: Tuple[str, Any] = Depends(get_current_user)):
    username, role = current_user
    if role != 1:
        raise HTTPException(status_code=403, detail="Only Office Assistant can create users")
    
    viewModel = []
    errors = []

    for user in users:
        try:
            # Validate password length
            if user.userRole != 0 and (len(user.password) < 8 or len(user.password) > 16):
                raise HTTPException(status_code=400, detail=f"Password must be between 8 and 16 characters for user {user.userName}")
            
            user.firstTimer = True

            # Check if username already exists
            existing_user = userCollection.find_one({"userName": user.userName})
            if existing_user:
                raise HTTPException(status_code=400, detail=f"Username {user.userName} already exists")
            
            # Check if email already exists
            existing_email = userCollection.find_one({"email": user.email})
            if existing_email:
                raise HTTPException(status_code=400, detail=f"Email {user.email} already exists")

            # Insert user into the collection
            result = userCollection.insert_one(user.model_dump())
            user_dict = user.model_dump()
            user_dict.pop("password", None)  # Remove password field
            viewModel.append(user_dict)

        except HTTPException as e:
            # Collect errors for each user that fails validation or insertion
            errors.append({"userName": user.userName, "error": e.detail})
    
    # Return results with created users and any errors encountered
    return {"viewModel": viewModel, "errors": errors}

#update masterlist
@router.put("/", tags=["users"])
async def UpdateUser(userdto: UserDto, current_user: Tuple[str, Any] = Depends(get_current_user)):
    username, role = current_user

    if ( username != userdto.userName and role != 1):
        raise HTTPException(status_code=403, detail="Only account owner can update their profile")
        
    existing_user = userCollection.find_one({"userName": userdto.userName})
    if not existing_user:
        raise HTTPException(status_code=400, detail="Invalid existing user")
    if(userdto.userName):
        existing_user['userName'] = userdto.userName
    if(userdto.password):
        if userdto.password.isdigit():
            raise HTTPException(status_code=400, detail="Password cannot consist of only numbers.")
        if userdto.password.isalpha():
            raise HTTPException(status_code=400, detail="Password cannot consist of only letters.")
        existing_user['password'] = userdto.password
    if userdto.userRole is not None:  # Check if userRole is provided (it can be 0 or a valid number)
        existing_user['userRole'] = userdto.userRole
    if userdto.email is not None:  # Check if userRole is provided (it can be 0 or a valid number)
        existing_user['email'] = userdto.email

    existing_user['firstTimer'] = False

    result = userCollection.update_one({"userName": userdto.userName}, {"$set": existing_user})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    # Remove sensitive information before returning
    userdto_dict = userdto.model_dump()  # Convert the Pydantic model to a dictionary
    userdto_dict.pop("password", None)  # Remove the 'password' field if it exists

    return ResponseDto(response="User updated successfully", viewModel = userdto_dict, status=True)

#delete masterlist
@router.delete("/{userName}", tags=["users"])
async def Delete(userName: str):
    result = userCollection.delete_one({"userName": userName})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return ResponseDto(response="User deleted successfully", viewModel = None, status=True)