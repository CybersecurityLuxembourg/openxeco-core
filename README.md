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
$ cd ~/project/bo-api
$ python -m venv venv
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
> python application.py
```

# Simulate SMTP server

Some resources of the API requires a SMTP server, you can simulate in local environment with this following command:
```
> python -m smtpd -n -c DebuggingServer localhost:1025
```

# Run the unittests

To run a single test
```
> python -m unittest test/get_company.py
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

Tun the test coverage report and generate in HTML ( with the venv activated)
```
> coverage run --source=resource,utils,db,decorator -m unittest discover && coverage html
```

# Run the code analysers

To run the PyCQA/prospector 
```
> npm install prospector
> prospector -i venv/ --no-autodetect
```

To run the PyCQA/bandit 
```
> npm install bandit
> bandit -r ./
```