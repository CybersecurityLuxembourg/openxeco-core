import os

ENVIRONMENT = os.getenv('ENVIRONMENT', 'dev')

JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', "my_secret_developer_key")

DB_CONFIG = {
    'drivername': 'mysql+pymysql',
    'username': os.getenv('DB_USERNAME', 'root'),
    'password': os.getenv('DB_PASSWORD', 'DBDevSMILE20'),
    'host': os.getenv('DB_HOSTNAME', 'localhost'),
    'port': os.getenv('DB_PORT', '3306'),
    'database': os.getenv('DB_NAME', 'CYBERLUX'),
}

MAIL_SERVER = os.getenv('MAIL_SERVER', "localhost")
MAIL_PORT = os.getenv('MAIL_PORT', "1025")
MAIL_USERNAME = os.getenv('MAIL_USERNAME', "cyberlux-app@securitymadein.lu")
MAIL_PASSWORD = os.getenv('MAIL_PASSWORD', None)
MAIL_USE_TLS = os.getenv('MAIL_USE_TLS', "False")
MAIL_USE_SSL = os.getenv('MAIL_USE_SSL', "False")
MAIL_DEFAULT_SENDER = os.getenv('MAIL_DEFAULT_SENDER', "cyberlux-app@securitymadein.lu")

IMAGE_FOLDER = os.getenv('IMAGE_FOLDER', "C:/image_folder")

JOBADDER_CLIENT_ID = "See JobAdder account"
JOBADDER_CLIENT_SECRET = "See JobAdder account"
JOBADDER_REFRESH_TOKEN = os.getenv('JOBADDER_REFRESH_TOKEN', None)
JOBADDER_ACCESS_TOKEN = os.getenv('JOBADDER_ACCESS_TOKEN', None)

FRONTEND_URL = {
    'dev': ['http://localhost:3000'],
    'test': ['https://test-db.cy.lu'],
    'production': ['https://db.cy.lu']
}[ENVIRONMENT]

PUBLIC_FRONTEND_URL = {
    'dev': ['http://localhost:3002'],
    'test': ['https://test-secin.cy.lu'],
    'production': ['https://cy.lu', 'https://cybersecurity-luxembourg.com'],
}[ENVIRONMENT]

PUBLIC_ECOSYSTEM_FRONTEND_URL = {
    'dev': ['http://localhost:3003'],
    'test': ['https://ecosystem.cybersecurity-luxembourg.com', 'https://test-eco.cy.lu'],
    'production': ['https://ecosystem.cybersecurity-luxembourg.com', 'https://eco.cy.lu'],
}[ENVIRONMENT]
