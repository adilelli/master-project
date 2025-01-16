from typing import Any, Tuple
from fastapi import APIRouter, Depends, HTTPException, Path, Query
from bson.objectid import ObjectId
from services.auth_services import get_current_user
from dtos import chairpersonDto, evaluationDb, ResponseDto, evaluationDto, examinerDto, supervisorDto, map_evaluation
from config import configEvaluation, configUser

# Initialize Router
router = APIRouter()
evalCollection = configEvaluation()
userCollection = configUser()

# +PrepareEvaluation()/
# +ViewEvaluation()/
# +UpdateSupervisor() 
# +ViewPostponedEvaluation()/
# +viewExaminer()/
# +AddExaminer()/
# +UpdateExaminer()/
# +AddChairPerson()/
# +viewChairPerson()/

@router.post("/", tags=["evaluation"], status_code=201)
async def PrepareEvaluation(evaluationdto: evaluationDto, current_user: Tuple[str, Any] = Depends(get_current_user)):
    username, role = current_user
    if(role != 1):
        raise HTTPException(status_code=403, detail = "Only Office Assistant can add evaluation")
    
    evaluation = map_evaluation(evaluationdto)
    result = evalCollection.insert_one(evaluation.model_dump(exclude_none=True))
    return {"_id": str(result.inserted_id), "evaluation": evaluation}

@router.put("/supervisor/{evaluationId}", response_model=ResponseDto, tags=["evaluation"])
async def add_update_supervisor(
    evaluationId: str,
    supervisordto: supervisorDto,
    current_user: Tuple[str, Any] = Depends(get_current_user)
):
    username, role = current_user
 
    if role != 1:  # Check if the user has permission
        raise HTTPException(status_code=403, detail="You do not have the permission to add or update examiners.")

    if not ObjectId.is_valid(evaluationId):  # Validate evaluation ID format
        raise HTTPException(status_code=400, detail="Invalid evaluation ID format.")

    eval = evalCollection.find_one({"_id": ObjectId(evaluationId)})
    if not eval:
        raise HTTPException(status_code=404, detail="Evaluation not found.")

    if eval.get('lockStatus') == True: # Check if nomination is locked
        raise HTTPException(status_code=403, detail="Evaluation has been locked")

    # Validate supervisor and co-supervisor IDs
    if supervisordto.supervisorId:
        supervisor = userCollection.find_one({"userName": supervisordto.supervisorId})
        if not supervisor:
            raise HTTPException(status_code=400, detail="Invalid supervisor ID.")

    if supervisordto.coSupervisorId:
        co_supervisor = userCollection.find_one({"userName": supervisordto.coSupervisorId})
        if not co_supervisor:
            raise HTTPException(status_code=400, detail="Invalid co-supervisor ID.")

    # Update the evaluation
    eval["supervisorId"] = supervisordto.supervisorId
    eval["coSupervisorId"] = supervisordto.coSupervisorId

    result = evalCollection.update_one({"_id": ObjectId(evaluationId)}, {"$set": eval})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Failed to update evaluation.")

    return ResponseDto(response="Evaluation updated successfully", viewModel = eval, status=True)

@router.put("/examiner/{evaluationId}", response_model=ResponseDto, tags=["evaluation"])
async def AddUpdateExaminer(evaluationId: str, examinerdto: examinerDto, current_user: Tuple[str, Any] = Depends(get_current_user)):

    username, role = current_user

    if role != 1 or role != 3 or role != 4: #besides OA or Professor
        raise HTTPException(status_code=403, detail="You do not have the permission to add examiner")
    
    if not ObjectId.is_valid(evaluationId):
        raise HTTPException(status_code=400, detail="Invalid evaluation ID format")
    
    eval = evalCollection.find_one({"_id": ObjectId(evaluationId)})
    if not eval:
        raise HTTPException(status_code=404, detail="Evaluation not found.")
    
    if eval.get('lockStatus') == True: # Check if nomination is locked
        raise HTTPException(status_code=403, detail="Evaluation has been locked")
        

    if(eval.get('supervisorId')):
        supervisorId = userCollection.find_one({"userName": eval.get('supervisorId')})
        supervisorRole = supervisorId.get("userRole")

    if(eval.get('coSupervisorId')):
        coSupervisorId = userCollection.find_one({"userName": eval.get('coSupervisorId')})
        coSupervisorRole = coSupervisorId.get("userRole")

    if(examinerdto.examinerId1):
        examinerId1 = userCollection.find_one({"userName": examinerdto.examinerId1})
        examiner1Role = examinerId1.get("userRole")

    if(examiner1Role is not None and examiner1Role < 3):
        raise HTTPException(status_code=400, detail="Examiner 1 must be at least an associate professor")
    if(supervisorRole is not None and examiner1Role < supervisorRole):
        raise HTTPException(status_code=400, detail="Examiner 1 must be a professor")

    if(coSupervisorRole is not None and examiner1Role < coSupervisorRole):
        raise HTTPException(status_code=400, detail="Examiner 1 must be a professor")

    eval['examinerId1'] = examinerdto.examinerId1
    eval['examinerId2'] = examinerdto.examinerId2
    eval['examinerId3'] = examinerdto.examinerId3

    result = evalCollection.update_one({"_id": ObjectId(evaluationId)}, {"$set": eval})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    return ResponseDto(response="Evaluation updated successfully", viewModel = eval, status=True)

@router.put("/chairperson/{evaluationId}", response_model=ResponseDto, tags=["evaluation"])
async def AddChairPerson(evaluationId: str, chairpersondto: chairpersonDto, current_user: Tuple[str, Any] = Depends(get_current_user)):

    username, role = current_user

    # Validate evaluation ID format
    if not ObjectId.is_valid(evaluationId):
        raise HTTPException(status_code=400, detail="Invalid evaluation ID format")
    
    # Fetch existing evaluation data
    eval = evalCollection.find_one({"_id": ObjectId(evaluationId)})
    if not eval:
        raise HTTPException(status_code=404, detail="Evaluation not found")

    if eval.get('lockStatus') == True:  # Check if nomination is locked
        raise HTTPException(status_code=403, detail="Evaluation has been locked")

    # Build query to check chairperson session limits
    query = {}
    if chairpersondto.semester:
        query["semester"] = chairpersondto.semester
    if chairpersondto.chairpersonId:
        query["chairpersonId"] = chairpersondto.chairpersonId

    # Check if chairperson exceeds session limit
    evaluation_count = evalCollection.count_documents(query)

    if role != 2 :
        raise HTTPException(status_code=403, detail="Only coordinator can assign chairperson")
    if evaluation_count > 4:
        raise HTTPException(status_code=400, detail="Chairperson cannot chair more than 4 sessions per semester")
    
    # Supervisor and co-supervisor roles validation
    supervisorRole, coSupervisorRole, chairpersonRole = None, None, None

    if eval.get("supervisorId"):
        supervisor = userCollection.find_one({"userName": eval.get("supervisorId")})
        if not supervisor:
            raise HTTPException(status_code=400, detail="Invalid supervisor ID")
        supervisorRole = supervisor.get("userRole")

    if eval.get("coSupervisorId"):
        coSupervisor = userCollection.find_one({"userName": eval.get("coSupervisorId")})
        if not coSupervisor:
            raise HTTPException(status_code=400, detail="Invalid co-supervisor ID")
        coSupervisorRole = coSupervisor.get("userRole")

    if chairpersondto.chairpersonId:
        chairperson = userCollection.find_one({"userName": chairpersondto.chairpersonId})
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
    
    eval['chairpersonId'] = chairpersondto.chairpersonId

    # Update evaluation
    result = evalCollection.update_one({"_id": ObjectId(evaluationId)}, {"$set": eval})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    
    return ResponseDto(response="Evaluation updated successfully", viewModel=eval, status=True)


@router.delete("/{evaluationId}", tags=["evaluation"])
async def delete_evaluation(evaluationId: str, current_user: Any = Depends(get_current_user)):

    lockStatus = evalCollection.find_one({"_id": ObjectId(evaluationId)})

    if lockStatus.get('lockStatus') == True:  # Check if nomination is locked
        raise HTTPException(status_code=403, detail="Evaluation has been locked")
    
    result = evalCollection.delete_one({"_id": ObjectId(evaluationId)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    
    return ResponseDto(response="Evaluation deleted successfully", viewModel=None, status=True)


@router.get("/", tags=["evaluation"])
async def ViewEvaluation(
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


@router.put("/lock", response_model=ResponseDto, tags=["evaluation"])
async def lock_nomination(
    evaluationId: str,
    lock: bool,
    current_user: Tuple[str, Any] = Depends(get_current_user)
):
    username, role = current_user
 
    if role != 2:  # Check if the user has permission
        raise HTTPException(status_code=403, detail="You do not have the permission to lock nominations.")

    if not ObjectId.is_valid(evaluationId):  # Validate evaluation ID format
        raise HTTPException(status_code=400, detail="Invalid evaluation ID format.")

    eval = evalCollection.find_one({"_id": ObjectId(evaluationId)})
    if not eval:
        raise HTTPException(status_code=404, detail="Evaluation not found.")


    # Update the evaluation
    eval["lockStatus"] = lock

    result = evalCollection.update_one({"_id": ObjectId(evaluationId)}, {"$set": eval})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Failed to update evaluation.")

    return ResponseDto(response="Evaluation updated successfully", viewModel = eval, status=True)
