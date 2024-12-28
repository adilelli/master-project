from typing import Any, Tuple
from fastapi import APIRouter, Depends, HTTPException, Path, Query
from bson.objectid import ObjectId
from services.auth_services import get_current_user
from dtos import evaluationDto, Response
from config import configEvaluation, configUser

# Initialize Router
router = APIRouter()
evalCollection = configEvaluation()
userCollection = configUser()

@router.post("/", tags=["evaluation"], status_code=201)
async def add_evaluation(evaluation: evaluationDto, current_user: Tuple[str, Any] = Depends(get_current_user)):
    username, role = current_user
    if(role != 1):
        raise HTTPException(status_code=403, detail = "Only Office Assistant can add evaluation")
    
    result = evalCollection.insert_one(evaluation.model_dump(exclude_none=True))
    return {"_id": str(result.inserted_id), "evaluation": evaluation}

@router.put("/examiner/{evaluationId}", response_model=Response, tags=["evaluation"])
async def update_examiner(evaluationId: str, evaluation: evaluationDto, current_user: Tuple[str, Any] = Depends(get_current_user)):

    username, role = current_user

    if role != 1 or role != 3 or role != 4: #besides OA or Professor
        raise HTTPException(status_code=403, detail="You do not have the permission to add examiner")
    
    if not ObjectId.is_valid(evaluationId):
        raise HTTPException(status_code=400, detail="Invalid evaluation ID format")
    
    evaluation_data = evaluation.model_dump()
    if(evaluation.supervisorId):
        supervisorId = userCollection.find_one({"userName": evaluation.supervisorId})
        supervisorRole = supervisorId.get("userRole")
    if(evaluation.coSupervisorId):
        coSupervisorId = userCollection.find_one({"userName": evaluation.coSupervisorId})
        coSupervisorRole = coSupervisorId.get("userRole")
    if(evaluation.examinerId1):
        examinerId1 = userCollection.find_one({"userName": evaluation.examinerId1})
        examiner1Role = examinerId1.get("userRole")

    if(examiner1Role is not None and examiner1Role < 3):
        raise HTTPException(status_code=400, detail="Examiner 1 must be at least an associate professor")
    if(supervisorRole is not None and examiner1Role < supervisorRole):
        raise HTTPException(status_code=400, detail="Examiner 1 must be a professor")

    if(coSupervisorRole is not None and examiner1Role < coSupervisorRole):
        raise HTTPException(status_code=400, detail="Examiner 1 must be a professor")


    result = evalCollection.update_one({"_id": ObjectId(evaluationId)}, {"$set": evaluation_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    return Response(response="Evaluation updated successfully", viewModel = evaluation, status=True)

@router.put("/chairperson/{evaluationId}", response_model=Response, tags=["evaluation"])
async def update_chairperson(evaluationId: str, evaluation: evaluationDto, current_user: Tuple[str, Any] = Depends(get_current_user)):
    # Validate evaluation ID format
    if not ObjectId.is_valid(evaluationId):
        raise HTTPException(status_code=400, detail="Invalid evaluation ID format")
    
    evaluation_data = evaluation.model_dump()

    username, role = current_user

    # Build query to check chairperson session limits
    query = {}
    if evaluation.semester:
        query["semester"] = evaluation.semester
    if evaluation.chairpersonId:
        query["chairpersonId"] = evaluation.chairpersonId

    # Check if chairperson exceeds session limit
    evaluation_count = evalCollection.count_documents(query)

    if role != 2 :
        raise HTTPException(status_code=403, detail="Only chairperson can assign chairperson")
    if evaluation_count > 4:
        raise HTTPException(status_code=400, detail="Chairperson cannot chair more than 4 sessions per semester")
    
    # Fetch existing evaluation data
    evaluationDb = evalCollection.find_one({"_id": ObjectId(evaluationId)})
    if not evaluationDb:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    
    # Supervisor and co-supervisor roles validation
    supervisorRole, coSupervisorRole, chairpersonRole = None, None, None

    if evaluationDb.get("supervisorId"):
        supervisor = userCollection.find_one({"userName": evaluationDb.get("supervisorId")})
        if not supervisor:
            raise HTTPException(status_code=400, detail="Invalid supervisor ID")
        supervisorRole = supervisor.get("userRole")

    if evaluationDb.get("coSupervisorId"):
        coSupervisor = userCollection.find_one({"userName": evaluationDb.get("coSupervisorId")})
        if not coSupervisor:
            raise HTTPException(status_code=400, detail="Invalid co-supervisor ID")
        coSupervisorRole = coSupervisor.get("userRole")

    if evaluation.chairpersonId:
        chairperson = userCollection.find_one({"userName": evaluation.chairpersonId})
        if not chairperson:
            raise HTTPException(status_code=400, detail="Invalid chairperson ID")
        chairpersonRole = chairperson.get("userRole")

    # Role validation
    if chairpersonRole is not None and chairpersonRole < 3:
        raise HTTPException(status_code=400, detail="Chairperson must be at least an associate professor")
    
    if coSupervisorRole is not None and chairpersonRole < coSupervisorRole:
        raise HTTPException(status_code=400, detail="Chairperson must be a professor")
    
    if supervisorRole is not None and chairpersonRole < supervisorRole:
        raise HTTPException(status_code=400, detail="Chairperson must be a professor")

    # Update evaluation
    result = evalCollection.update_one({"_id": ObjectId(evaluationId)}, {"$set": evaluation_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    
    return Response(response="Evaluation updated successfully", viewModel=evaluation, status=True)


@router.delete("/{evaluationId}", tags=["evaluation"])
async def delete_evaluation(evaluationId: str, current_user: Any = Depends(get_current_user)):
    result = evalCollection.delete_one({"_id": ObjectId(evaluationId)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    return {"message": "Evaluation deleted successfully"}


@router.get("/", tags=["evaluation"])
async def get_evaluations(
    studentId: str = Query(None),  # Optional query parameter
    supervisorId: str = Query(None),
    coSupervisorId: int = Query(None),
    programType: str = Query(None),
    evaluationType: str = Query(None),
    semester: str = Query(None),
    postponeStatus: int = Query(None),
    examinerId1: str = Query(None),
    examinerId2: str = Query(None),
    examinerId3: str = Query(None),
    researchTitle: str = Query(None),
    chairpersonId: str = Query(None)
):
    # Construct query based on the provided parameters
    query = {}

    if studentId is not None:
        query["studentId"] = studentId
    if supervisorId is not None:
        query["supervisorId"] = supervisorId
    if coSupervisorId is not None:
        query["coSupervisorId"] = coSupervisorId
    if programType is not None:
        query["programType"] = programType
    if evaluationType is not None:
        query["evaluationType"] = evaluationType
    if semester is not None:
        query["semester"] = semester
    if postponeStatus is not None:
        query["postponeStatus"] = postponeStatus
    if examinerId1 is not None:
        query["examinerId1"] = examinerId1
    if examinerId2 is not None:
        query["examinerId2"] = examinerId2
    if examinerId3 is not None:
        query["examinerId3"] = examinerId3
    if researchTitle is not None:
        query["researchTitle"] = researchTitle
    if chairpersonId is not None:
        query["chairpersonId"] = chairpersonId

    # Query the database using the constructed filter
    evaluations = evalCollection.find(query)
    
    # Return the results, converting _id to string
    result = [{**evaluation, "_id": str(evaluation["_id"])} for evaluation in evaluations]
    
    return result



