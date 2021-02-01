import unittest
from application import application
from db.db import DB
import functools
import json
from flask_bcrypt import generate_password_hash


class BaseCase(unittest.TestCase):

    email = "test@cybersecurity.lu"
    password = "12345678"
    db = None

    def setUp(self):
        self.application = application.test_client()
        application.config['SQLALCHEMY_DATABASE_URI'].database = "CYBERLUX_TEST"
        self.db = DB(application)

        self._truncate_database()

        self.db.insert({"email": self.email, "password": generate_password_hash(self.password)}, self.db.tables["User"])

    def tearDown(self):
        self._truncate_database()

    def login(f):
        @functools.wraps(f)
        def wrapper(self, *args, **kwargs):
            user_payload = {
                "email": getattr(self, "email"),
                "password": getattr(self, "password")
            }

            r = getattr(self, "application")\
                .post('/account/login', headers={"Content-Type": "application/json"}, data=json.dumps(user_payload))

            f(self, token=r.json['token'], *args, **kwargs)

        return wrapper

    def _truncate_database(self):
        self.db.session.execute(f'SET FOREIGN_KEY_CHECKS = 0;')
        for table in self.db.base.metadata.sorted_tables:
            self.db.session.execute(f"TRUNCATE TABLE {table.name}")
        self.db.session.execute(f'SET FOREIGN_KEY_CHECKS = 1;')

    @staticmethod
    def get_standard_header(token):
        return {"Content-Type": "application/json", "Authorization": f"Bearer {token}"}

    @staticmethod
    def get_standard_post_header(token):
        return {"Authorization": f"Bearer {token}"}
