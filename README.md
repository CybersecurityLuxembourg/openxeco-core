![logo](./doc/ecosystem-logo.jpg?raw=true "EcoSystem CYBERSECLUX")

<table>
<tr>
  <td>Bandit Workflow</td>
  <td><a href="https://github.com/CybersecLux/bo-api/actions/workflows/pycqa-bandit.yml"><img src="https://github.com/CybersecLux/bo-api/actions/workflows/pycqa-bandit.yml/badge.svg" /></a></td>
</tr>
<tr>
  <td>Prospector Workflow</td>
  <td><a href="https://github.com/CybersecLux/bo-api/actions/workflows/pycqa-prospector.yml"><img src="https://github.com/CybersecLux/bo-api/actions/workflows/pycqa-prospector.yml/badge.svg" /></a></td>
</tr>
<tr>
  <td>Unittest Workflow</td>
  <td><a href="https://github.com/CybersecLux/bo-api/actions/workflows/unittest.yml"><img src="https://github.com/CybersecLux/bo-api/actions/workflows/unittest.yml/badge.svg" /></a></td>
</tr>
<tr>
  <td>Twitter</td>
  <td><a href="https://twitter.com/CybersecLux"><img src="https://img.shields.io/twitter/follow/CybersecLux.svg?style=social&label=Follow" /></a></td>
</tr>
</table>

# Outlines

All the versions mentioned are the recommended ones.

# Install local mySQL server

Version 8.0.22
https://dev.mysql.com/downloads/installer/

For Windows, MySQL requires those dependencies:
- Visual Studio 2019: https://visualstudio.microsoft.com/downloads/
- MySQL for Visual Studio 1.2.9: https://dev.mysql.com/downloads/windows/visualstudio/
- MySQL Connector .NET 8.0.22: https://dev.mysql.com/downloads/connector/net/

MySQL configuration:
- For a local environment, you will require a root user with the following password: DBDevSMILE20. You can also change and define an account and a password that you will need to report to config/config.py
- For Windows only, set the lower_case_table_names=2 on the my.ini (Right value by default on Linux distribs)

Then, you can run the SQL script with the DB structure in db/structure/001_init.sql

Hint: You can use PHPMyAdmin or MySQL Workbench to administrate your server.

# Install Python 3.8.6

https://www.python.org/downloads/release/python-386/

# Create Python virtual environment and install dependencies

For Linux:
```
$ sudo apt install mysql-server python3-venv -y
$ cd ~/project/bo-api
$ python3 -m venv venv
$ source venv/bin/activate
$ pip install -U pip setuptools
$ pip install -r requirements.txt
```

For Windows
```
> cd %USERPROFILE%\project\bo-api
> python -m venv venv
> .\venv\Scripts\activate
> pip install -U pip setuptools
> pip install -r requirements.txt
```

# Import the database structure

```
$ cd ~/project/bo-api
$ mysql -u root -p < ./db/sql/cyberlux_structure.sql
```

# Run environment

You have to make sure that the python environment is active
If not:
```
> cd %USERPROFILE%\project\bo-api
> python -m venv venv
> .\venv\Scripts\activate
```

Then:
```
# Copy and edit sample config
$ cp config/config.py.sample config/config.py
$ python application.py
```

# Simulate SMTP server

Some resources of the API requires a SMTP server, you can simulate in local environment with this following command:
```
> python -m smtpd -n -c DebuggingServer localhost:1025
```

# Run the unittests

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

Run the test coverage report and generate in HTML (with the venv activated)
```
> coverage run --source=resource,utils,db,decorator -m unittest discover && coverage html
```

# Run the code analysers

## npm is needed

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
> bandit -r .
```
