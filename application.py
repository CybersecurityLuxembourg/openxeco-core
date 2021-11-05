import sys

from flask import Flask
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from flask_restful import Api
from sqlalchemy.engine.url import URL
from apispec import APISpec
from apispec.ext.marshmallow import MarshmallowPlugin
from flask_apispec.extension import FlaskApiSpec

try:
    from config import config
except ImportError:
    print("Please copy config.py.sample to config.py")
    sys.exit(1)

from db.db import DB


# Manage DB connection
db_uri = URL(**config.DB_CONFIG)

# Init Flask and set config
application = Flask(__name__, template_folder="template")
application.config['SQLALCHEMY_DATABASE_URI'] = db_uri
application.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
application.config["ERROR_404_HELP"] = False

application.config["JWT_SECRET_KEY"] = config.JWT_SECRET_KEY
application.config["JWT_TOKEN_LOCATION"] = ['headers', 'cookies']
application.config["JWT_COOKIE_SECURE"] = config.ENVIRONMENT != "dev"
application.config['JWT_COOKIE_CSRF_PROTECT'] = False

application.config['CORS_HEADERS'] = 'Content-Type'
application.config["CORS_SUPPORTS_CREDENTIALS"] = True
application.config["CORS_ORIGINS"] = config.CORS_ORIGINS if config.CORS_ORIGINS else []

application.config['MAIL_SERVER'] = config.MAIL_SERVER
application.config['MAIL_PORT'] = config.MAIL_PORT
application.config['MAIL_USERNAME'] = config.MAIL_USERNAME
application.config['MAIL_PASSWORD'] = config.MAIL_PASSWORD
application.config['MAIL_USE_TLS'] = config.MAIL_USE_TLS == "True"
application.config['MAIL_USE_SSL'] = config.MAIL_USE_SSL == "True"
application.config['MAIL_DEFAULT_SENDER'] = config.MAIL_DEFAULT_SENDER

application.config['PROPAGATE_EXCEPTIONS'] = True

application.config['SCHEDULER_API_ENABLED'] = False

application.config['APISPEC_SWAGGER_URL'] = '/doc/json'
application.config['APISPEC_SWAGGER_UI_URL'] = '/doc/'
application.config['APISPEC_SPEC'] = APISpec(
    title='CYBERLUX API',
    version='v1.6',
    plugins=[MarshmallowPlugin()],
    openapi_version='2.0.0'
)

# Create DB instance
db = DB(application)

# Add additional plugins
cors = CORS(application)
bcrypt = Bcrypt(application)
jwt = JWTManager(application)
mail = Mail(application)
docs = FlaskApiSpec(application)

# Init and set the resources for Flask
api = Api(application)


@application.route('/<generic>')
def undefined_route(_):
    return '', 404


if __name__ == 'application':
    from routes import set_routes
    set_routes({"api": api, "db": db, "mail": mail, "docs": docs})

if __name__ == '__main__':
    from routes import set_routes
    set_routes({"api": api, "db": db, "mail": mail, "docs": docs})

    application.debug = config.ENVIRONMENT == "dev"
    application.run()
