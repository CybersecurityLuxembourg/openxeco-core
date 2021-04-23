import sys

from flask import Flask
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from flask_restful import Api
from sqlalchemy.engine.url import URL

try:
    from config import config
except ImportError:
    print("Please copy config.py.sample to config.py")
    sys.exit(1)

from db.db import DB
from routes import set_routes


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

# Create DB instance
db = DB(application)

# Add additional plugins
cors = CORS(application)
bcrypt = Bcrypt(application)
jwt = JWTManager(application)
mail = Mail(application)

# Init and set the resources for Flask
api = Api(application)
set_routes(api, db, mail)


@application.route('/<generic>')
def undefined_route(_):
    return '', 404


if __name__ == '__main__':
    application.debug = config.ENVIRONMENT == "dev"
    application.run()
