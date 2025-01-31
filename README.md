# master-project

### Starting the app
The app is written in FastAPI for backend and react for frontend. You need to start BOTH backend and FRONTEND

#### Cloning the app into local device
````
cd /path/to/your/project

git clone https://github.com/adilelli/master-project.git
cd master-project
````
##### DB Connection
You need MONGO_URI inside your environment file. Register with MongoDB Atlas to get the Mongo DB URI or alternatively you can use compass.

#### Backend

You need to create a Virtual Environment:

````
cd backend
python3 -m venv utm
````

This will create a utm directory in your project folder.
Activate the Virtual Environment (Mac and Linux):

````
source utm/bin/activate
````

Activate the Virtual Environment (Windows):

````
utm\Scripts\activate
````

After activation, you should see (venv) at the beginning of your terminal prompt, indicating that the virtual environment is active.
Install Packages (Optional): You can now install Python packages specific to this environment using pip:
````

pip install -r requirements.txt
````

Start the backend
````
uvicorn index:app --reload
````

#### Frontend

Ensure that you're at master project directory in another terminal

````
cd frontend
````

Install npm 

````
npm i
````

Starting the frontend

````
npm start
````




### To push to Github

```
git add .

git commit -m "YOUR_COMMIT"

git checkout -b "YOUR_BRANCH"

git push origin "YOUR_BRANCH"

```

After that, you create a pull request to merge your changes into DEVELOP branch (not MAIN branch)

Assign adil to review. Most likely I'll ask you to bump version number.

### Diagram:
https://app.diagrams.net/#G1NLD_a5MVfA68jXr7IznYoMmJxi9wCBN6#%7B%22pageId%22%3A%22_pt5iccv_ON5JaFcto0D%22%7D

### Tables and chart:
https://docs.google.com/spreadsheets/d/1RFjPAWf8vHNomkk3C8EVcOm0lKikBEK_pZzqP5uT-w8/edit?gid=0#gid=0

### Configuration
#### Identification methods 

The numbering scheme for the components for the PG project use the following method:

System identification:
	FSES-SG

Where
	FSES		- System name
	SG		- Company name

Document and article of the Developmental Configuration for the PG project are:

DOCNAME: REF XXX-FSES-SG-VX.XX

Where
		XXX		- Abbreviation for document name
		FSES		- Product name
		SG - Company abbreviation
  VX.XX	- Revision number (e.g. V1.00, V1.12, V2.00, …)
  
```
Documentation
 SDP: REF SDP-FSES-SG-VX.XX
	SPMP: REF SPMP-FSES-SG-VX.XX
	SRS: REF SRS-FSES-SG-VX.XX
	SDD: REF SDD-FSES-SG-VX.XX
	STD: REF STD-FSES-SG-VX.XX
	STR: REF STR-FSES-SG-VX.XX

Source Code
	Front End: REF FE-FSES-SG-VX.XX
	Back End: REF BE-FSES-SG-VX.XX

```

#### Source Code Configuration Control

![Screenshot 2024-12-08 at 19 54 10](https://github.com/user-attachments/assets/6152d754-cd6f-4ba4-aec2-4e801646e3eb)





# master_software_project_2024_semester3
