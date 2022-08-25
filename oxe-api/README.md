# Outlines

All the versions mentioned are the recommended ones.

# Setup development environment

## Create and run the MariaDB container

```
# Change 3306 to 3307 if another local MariaDB is installed. Make sure to adapt config files.
$ docker run -d \
    --network openxeco \
    --network-alias mariadb \
    -p 3306:3306 \
    -e MARIADB_ROOT_PASSWORD=E4syPass \
    mariadb:10.7.3
```

## Edit the environment variables

The project is using the python-dotenv package so you can copy and adjust the local file *openxeco-core/oxe-api/.env.example* with such content:

.env.example
```
ENVIRONMENT=dev

JWT_SECRET_KEY=my_secret_developer_key

DB_HOSTNAME=127.0.0.1
DB_PORT=3306
DB_NAME=OPENXECO
DB_USERNAME=root
DB_PASSWORD=E4syPass

MAIL_SERVER=127.0.0.1
MAIL_PORT=1025
MAIL_USE_TLS=False
MAIL_USE_SSL=False
MAIL_DEFAULT_SENDER=my-default-sender@example.org

IMAGE_FOLDER=/var/lib/oxe-api/image_folder
DOCUMENT_FOLDER=/var/lib/oxe-api/document_folder

INITIAL_ADMIN_EMAIL=my-default-admin@example.org
```

## Install Python 3.8.6

[Python 3.8.6](https://www.python.org/downloads/release/python-386/)

## Create Python virtual environment and install dependencies

For Linux:

```bash
$ git clone https://github.com/CybersecurityLuxembourg/openxeco-core.git
$ cd openxeco-core/oxe-api
$ cp .env.example .env # Edit accordingly
$ sudo apt install python3-venv -y
$ python3 -m venv venv
$ source ./venv/bin/activate
$ pip install -U pip setuptools
$ pip install -U -r requirements.txt
```

For Windows

```
> cd %USERPROFILE%\openxeco-core\oxe-api
> python -m venv venv
> .\venv\Scripts\activate
> pip install -U pip setuptools
> pip install -U -r requirements.txt
```

## Run the project

You have to make sure that the python environment is active, to double check:

```
$ echo ${VIRTUAL_ENV}
/home/luser/openxeco-core/oxe-api/venv
```

If not, repeat the steps above.

### Copy the config and run the app

```
$ python app.py
```

## Mock SMTP server

Some resources of the API requires a SMTP server, you can simulate in local environment with the following command:

```
$ python -m smtpd -n -c DebuggingServer localhost:1025
```

### Optional

Alternatively you can use a docker container for the fake SMTP server.

```
$ docker run -d \
  --network openxeco \
  --network-alias smtp \
  -p 1025:1025 \
  -p 1080:1080 \
  reachfive/fake-smtp-server
```

The mails are retrievable via [http://localhost:1080](http://localhost:1080).

# Test and audit the code

## Run the unittests

To run a single test

```
$ python -m unittest test/resource/entity/test_get_entity.py
```

To run the whole set use the command below.
(Here --buffer or -b is used to discard the output on a successful test run.)

```
$ python -m unittest --buffer
```

Run the test coverage report (with the venv activated).

```
$ coverage run --source=resource,utils,db,decorator -m unittest discover && coverage report
```

Run the test coverage report (with the venv activated) for a specific package.

```
$ coverage run --source=resource/user -m unittest discover test/resource/user/ && coverage report
```

Run the test coverage report and generate in HTML (with the venv activated).

```
$ coverage run --source=resource,utils,db,decorator -m unittest discover && coverage html
```

## Run the code analysers

npm is required

```
$ sudo apt install npm -y
```

To run the PyCQA/prospector use the command below.

```
$ npm install prospector
$ prospector -i venv/ --no-autodetect
```

To run the PyCQA/bandit use the command below.

```
$ sudo apt install bandit
$ bandit -r . -x ./test/,./venv/
```

# Manage the database structure

The database structure is automatically created/upgraded when starting the API. 

For further information about the structure management, please see the [documentation of Flask-Migrate](https://flask-migrate.readthedocs.io/en/latest/).
