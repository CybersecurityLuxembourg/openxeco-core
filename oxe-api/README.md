
# Outlines

All the versions mentioned are the recommended ones.

# Setup development environment

## Create and run MariaDB container

```
$ docker run --name mariadbtest -e MYSQL_ROOT_PASSWORD=E4syPass -p 3306:3306 -d mariadb:10.7.3
```

## Edit environment variables

The project is using the python-dotenv package so you can create a local file ~/project/openxeco-core/oxe-api/.env with such content:

```
ENVIRONMENT=dev

JWT_SECRET_KEY=my_secret_developer_key

DB_HOSTNAME=127.0.0.1
DB_PORT=3306
DB_NAME=MY_DATABASE
DB_USERNAME=root
DB_PASSWORD=E4syPass

MAIL_SERVER=127.0.0.1
MAIL_PORT=1025
MAIL_USE_TLS=False
MAIL_USE_SSL=False
MAIL_DEFAULT_SENDER=my-default-sender@default-domain.com

IMAGE_FOLDER=/var/lib/oxe-api/image_folder
DOCUMENT_FOLDER=/var/lib/oxe-api/document_folder

INITIAL_ADMIN_EMAIL=my-default-admin@default-domain.com
```

## Install Python 3.8.6

https://www.python.org/downloads/release/python-386/

## Create Python virtual environment and install dependencies

For Linux:
```
$ cd ~/project/openxeco-core/oxe-api
$ python3 -m venv venv
$ source venv/bin/activate
$ pip install -U pip setuptools
$ pip install -r requirements.txt
```

For Windows
```
> cd %USERPROFILE%\openxeco-core\oxe-api
> python -m venv venv
> .\venv\Scripts\activate
> pip install -U pip setuptools
> pip install -r requirements.txt
```

## Activate the python env and run the project

You have to make sure that the python environment is active
If not:
```
> cd %USERPROFILE%\project\openxeco-core/oxe-api
> python -m venv venv
> .\venv\Scripts\activate
```

Then:
```
# Copy and edit sample config
$ cp config/config.py.sample config/config.py
$ python app.py
```

## Mock SMTP server

Some resources of the API requires a SMTP server, you can simulate in local environment with this following command:
```
> python -m smtpd -n -c DebuggingServer localhost:1025
```

You can also use a docker container to mock the SMTP server. The mail body is retrievable in the STDOUT of the container
```
$ docker pull b2ck/fake-smtpd
$ docker run -p 1025:25 b2ck/fake-smtpd
```

# Test and audit the code

## Run the unittests

To run a single test
```
> python -m unittest test/resource/company/test_get_company.py
```

To run the whole set
Here --buffer or -b is used to discard the output on a successful test run
```
> python -m unittest --buffer
```

Run the test coverage report (with the venv activated)
```
> coverage run --source=resource,utils,db,decorator -m unittest discover && coverage report
```

Run the test coverage report (with the venv activated) for a specific package
```
> coverage run --source=resource/user -m unittest discover test/resource/user/ && coverage report
```

Run the test coverage report and generate in HTML (with the venv activated)
```
> coverage run --source=resource,utils,db,decorator -m unittest discover && coverage html
```

## Run the code analysers

npm is required

```
$ sudo apt install npm -y
```

To run the PyCQA/prospector 
```
> npm install prospector
> prospector -i venv/ --no-autodetect
```

To run the PyCQA/bandit 
```
> sudo apt install bandit
> bandit -r . -x ./test/,./venv/
```

# Manage the database structure

The database structure is automatically created/upgraded when starting the API. 

For further information about the structure management, please see the documentation of Flask-Migrate:

https://flask-migrate.readthedocs.io/en/latest/