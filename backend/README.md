
# Backend

## In FastAPI


REQUIREMENT


DESIGN


CONFIGURATION


API DOCUMENTATION


#### Steps to Start a Virtual Environment:
Navigate to Your Project Directory:
````

cd /path/to/your/project
````

Create a Virtual Environment:
````

python3 -m venv utm
````

This will create a venv directory in your project folder.
Activate the Virtual Environment:
````

source utm/bin/activate
````

After activation, you should see (venv) at the beginning of your terminal prompt, indicating that the virtual environment is active.
Install Packages (Optional): You can now install Python packages specific to this environment using pip:
```

pip install fastapi
pip install uvicorn[standard]
````

Deactivate the Virtual Environment: To deactivate and return to the system's default Python, run:
````

deactivate
````



#### Running the fast API app

````
uvicorn main:app --reload
````









