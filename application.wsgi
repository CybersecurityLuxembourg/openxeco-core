import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'venv', 'lib', 'python3.8', 'site-packages'))

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