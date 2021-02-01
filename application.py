from flask import Flask
from flask_cors import CORS
from flask_restful import Api
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from flask_mail import Mail
from config import config
from sqlalchemy.engine.url import URL
from db.db import DB
from routes import set_routes
import logging

# Manage DB connection
db_uri = URL(**config.DB_CONFIG)

# Init Flask and set config
application = Flask(__name__, template_folder="template")
application.config['SQLALCHEMY_DATABASE_URI'] = db_uri
application.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
application.config["ERROR_404_HELP"] = False
application.config["JWT_SECRET_KEY"] = config.JWT_SECRET_KEY
application.config['MAIL_SERVER'] = config.MAIL_SERVER
application.config['MAIL_PORT'] = config.MAIL_PORT
application.config['MAIL_USERNAME'] = config.MAIL_USERNAME
application.config['MAIL_PASSWORD'] = config.MAIL_PASSWORD
application.config['MAIL_DEFAULT_SENDER'] = config.MAIL_DEFAULT_SENDER

# Create DB instance
db = DB(application)

# Add additional plugins
cors = CORS(application, resources={r"/*": {"origins": "*"}})
bcrypt = Bcrypt(application)
jwt = JWTManager(application)
mail = Mail(application)

# Init and set the resources for Flask
api = Api(application)
set_routes(api, db, mail)

# Manage login handler
logger = logging.getLogger()
logging.basicConfig(level=logging.INFO, format='%(name)s|%(levelname)s|%(asctime)s|%(message)s')

'''
if config.ENVIRONMENT != "dev":
    handler = logging.handlers.RotatingFileHandler('./.application.log', maxBytes=1024000, backupCount=5)
    formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.warning("__name__ : %s", __name__)
else:
    pass
'''

@application.route('/<generic>')
def undefined_route(_):
    return '', 404


if __name__ == '__main__':
    application.run()
