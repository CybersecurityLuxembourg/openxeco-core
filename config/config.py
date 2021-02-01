import os

ENVIRONMENT = os.getenv('ENVIRONMENT', 'dev')

JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', "my_secret_developer_key")

DB_CONFIG = {
    'drivername': 'mysql+pymysql',
    'username': os.getenv('DB_USERNAME', 'root'),
    'password': os.getenv('DB_PASSWORD', 'DBDevSMILE20'),
    'host': os.getenv('DB_HOSTNAME', 'localhost'),
    'port': os.getenv('DB_PORT', 3306),
    'database': os.getenv('DB_NAME', 'CYBERLUX'),
}

MAIL_SERVER = os.getenv('MAIL_SERVER', "localhost")
MAIL_PORT = os.getenv('MAIL_PORT', "1025")
MAIL_USERNAME = os.getenv('MAIL_USERNAME', "alexis.prunier@securitymadein.lu")
MAIL_PASSWORD = os.getenv('MAIL_PASSWORD', None)
MAIL_USE_TLS = os.getenv('MAIL_USE_TLS', "False")
MAIL_USE_SSL = os.getenv('MAIL_USE_SSL', "False")
MAIL_DEFAULT_SENDER = os.getenv('MAIL_DEFAULT_SENDER', "alexis.prunier@securitymadein.lu")

IMAGE_FOLDER = os.getenv('IMAGE_FOLDER', "C:/image_folder")

FRONTEND_URL = {
    'dev': 'localhost:3000',
    'test': 'https://test-db.cy.lu',
    'production': 'https://db.cy.lu'
}[ENVIRONMENT]

