import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

activate_this = '/var/www/bo-api/venv/bin/activate_this.py'
with open(activate_this) as file_:
    exec(file_.read(), dict(__file__=activate_this))

os.environ["ENVIRONMENT"] = "test"
os.environ["JWT_SECRET_KEY"] = "set_a_true_jwt_secret_key"
os.environ["DB_USERNAME"] = "cyberlux"
os.environ["DB_PASSWORD"] = "sb_password"
os.environ["DB_HOSTNAME"] = "localhost"
os.environ["DB_PORT"] = "3306"
os.environ["DB_NAME"] = "CYBERLUX"
os.environ["MAIL_SERVER"] = "127.0.0.1"
os.environ["MAIL_PORT"] = "25"
os.environ["MAIL_USERNAME"] = "alexis.prunier@securitymadein.lu"
os.environ["MAIL_DEFAULT_SENDER"] = "alexis.prunier@securitymadein.lu"
os.environ["IMAGE_FOLDER"] = "/cydb_image_folder"

from application import application