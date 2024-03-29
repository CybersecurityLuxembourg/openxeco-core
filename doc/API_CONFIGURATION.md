
# Documentation of the functional settings of the API

The functional settings is to configure at the environment level. They can be defined via:
- a dotenv (.env) file defined in the oxe-api directory
- the system environment variable of the host machine
- Docker with an "environment" value in a Compose file (for example, see: [docker-compose.yml](../docker-compose.yml))
- Docker with "-e" argument in a container creation via "docker run" (for example, see: [doc/INSTALL_SERVER.yml](INSTALL_SERVER.md))

More details via the Python configuration loader at the API level:

[oxe-api/config/config.py](../oxe-api/config/config.py)

In this file, you can retrieve additional information regarding a setting:
- Mandatoryness: note that the API won't start if a mandatory setting is missing
- Default value: value given to the setting if no environment value is provided

You can find deeper information of the usage of these settings by:
- analyzing the [oxe-api/app.py](../oxe-api/app.py) file
- Doing a research of the setting name in the whole oxe-api folder

## Environment variable: "ENVIRONMENT"

Use "dev" value if the instance is deployed in a local development envivonment. Any other value can be used in a server environment.

A non-"dev" environment will have these additional features:
- Force usage of secured cookies
- Disable debug mode of the API
- Consider CORS_ORIGINS provided env variable instead of allowing localhost web apps only.

## Environment variable: "PORT"

The port serving of the API. The default value being "5000".

## ENV VAR: "JWT_SECRET_KEY"

This value is used by the "flask-jwt-extended" library in order to encode and decode JWTs. JWTs are used by the API to respond the authentication and authorization requirements.

You can find the original documentation [here](https://flask-jwt-extended.readthedocs.io/en/stable/options/#JWT_SECRET_KEY)

## Database settings

These values are used by the "SQLAlchemy" library in order to connect to a DBMS such as MariaDB or MySQL.

```
DB_DRIVER
DB_HOSTNAME
DB_PORT
DB_NAME
DB_USERNAME
DB_PASSWORD
```

You can find the original documentation [here](https://docs.sqlalchemy.org/en/20/core/engines.html).

## Email configuration

These values are used by the "flask-mail" library in order to connect to a SMTP server to send emails.

```
MAIL_SERVER
MAIL_PORT
MAIL_USERNAME
MAIL_PASSWORD
MAIL_USE_TLS
MAIL_USE_SSL
MAIL_DEFAULT_SENDER
MAIL_REPLY_TO
```

You can find the original documentation [here](https://pythonhosted.org/Flask-Mail/).

## Environment variable: "HTTP_PROXY"

There is a possibiity to configure a proxy for the GET request that are executed by the API.

Here is an non exhaustive list of the API GET request scenarii:
- Import an article, an entity or a taxonomy from another openXeco instance via the Network page of the admin portal
- Check if the websites of entities or alive via the schedule task functionality of the admin portal

## Project initiation configuration

An admin user is created when the API starts if the database does not have any user. This is used to have an initial access available when an instance is initiated. The credential of this admin user is defined by these two settings:

```
INITIAL_ADMIN_EMAIL
INITIAL_ADMIN_PASSWORD
```

It is recommended to change the password after the automatic creation of this user.

## Data persistence configuration

Alongside the database persistence, images and documents can be manaed via the library fonctionality available on the admin portal. These files are stored on folders defined by the paths from these two settings:

```
IMAGE_FOLDER
DOCUMENT_FOLDER
```

## BASE_DOMAIN

In production environment, this setting is set to define the base domain that is used by the openXeco instance.

Example of value:

```
openxeco.org
```

This value is used within the API to build URLs referring to the admin and the community portals, mainly used in the automatic emailing.

With the example above, the built links will look as such:

- admin portal url: https://admin.openxeco.org
- community portal url: https://community.openxeco.org

## CORS_DOMAINS

This setting is to define the domains that are allowed by the used browser to request the API.

In case of several domain, they have to be separated by a comma (","). All subdomains of the specified domains will be allowed by the browser.

Example of value

```
example.org,app.openxeco.org
```

With such value, here are the domains that will be allowed:

```
example.org
sub.example.org
sub1.sub.example.org
app.openxeco.org
sub.app.openxeco.org
sub1.sub.app.openxeco.org
```

Here are a non-exhaustive domains that wouldn't be allowed by the used browser:

```
example.org2
example2.org
openxeco.org
sub.openxeco.org
```

You can find the original documentation [here](https://flask-cors.readthedocs.io/en/latest/).