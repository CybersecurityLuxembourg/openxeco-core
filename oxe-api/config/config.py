"""
This file not meant to be modified to configure a local nor a production instance.
To configure the instance, please consider:
    - editing a ".env" file at the root of the "oxe-api" directory
    - passing the environment variables via "-e" flag if you use a docker container
"""
import os
from dotenv import load_dotenv


load_dotenv()


def _getenv(key, default=None, mandatory=True):
    if mandatory:
        if key in os.environ or default is not None:
            return os.getenv(key, default)
        raise KeyError("environment variable '%s' not set" % key)
    return os.getenv(key, default)


ENVIRONMENT         = _getenv('ENVIRONMENT',    default='dev')
PORT                = _getenv('PORT',           default='5000')

JWT_SECRET_KEY      = _getenv('JWT_SECRET_KEY', mandatory=True)

DB_CONFIG = {
    'drivername':   _getenv('DB_DRIVER',    default='mysql+pymysql'),
    'host':         _getenv('DB_HOSTNAME',  default='localhost'),
    'port':         _getenv('DB_PORT',      default='3306'),
    'database':     _getenv('DB_NAME',      default='OPENXECO'),
    'username':     _getenv('DB_USERNAME',  default='openxeco'),
    'password':     _getenv('DB_PASSWORD',  mandatory=True),
    'query':        {'charset': _getenv('DB_CHARSET', default='utf8mb4')},
}

MAIL_SERVER         = _getenv('MAIL_SERVER',     mandatory=False)
MAIL_PORT           = _getenv('MAIL_PORT',       mandatory=False)
MAIL_USERNAME       = _getenv('MAIL_USERNAME',   mandatory=False)
MAIL_PASSWORD       = _getenv('MAIL_PASSWORD',   mandatory=False)
MAIL_USE_TLS        = _getenv('MAIL_USE_TLS',    default="True")
MAIL_USE_SSL        = _getenv('MAIL_USE_SSL',    default="True")
MAIL_DEFAULT_SENDER = _getenv('MAIL_DEFAULT_SENDER', mandatory=True)
MAIL_REPLY_TO       = _getenv('MAIL_REPLY_TO',   mandatory=False)

HTTP_PROXY          = _getenv('HTTP_PROXY', mandatory=False)

INITIAL_ADMIN_EMAIL =       _getenv('INITIAL_ADMIN_EMAIL',      mandatory=False)
INITIAL_ADMIN_PASSWORD =    _getenv('INITIAL_ADMIN_PASSWORD',   default="Passw0rd!")

IMAGE_FOLDER        = _getenv('IMAGE_FOLDER',    default="/openxeco_image")
DOCUMENT_FOLDER     = _getenv('DOCUMENT_FOLDER', default="/openxeco_document")

CORS_DOMAINS        = _getenv('CORS_DOMAINS',    mandatory=ENVIRONMENT != "dev",
                              default="localhost:\\d*" if ENVIRONMENT == "dev" else None)

# remove extra spaces, remove empty items
domains = filter(len, map(str.strip, CORS_DOMAINS.split(",")))
# pylint: disable=unnecessary-lambda
CORS_ORIGINS = list(map(lambda d: r'((http|https)://)?(.*\.)?{}'.format(d), domains))
