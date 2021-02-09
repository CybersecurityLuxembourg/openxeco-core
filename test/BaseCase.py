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

        self.db.insert(
            {
                "id": 1,
                "email": self.email,
                "password": generate_password_hash(self.password),
                "is_admin": 1
            },
            self.db.tables["User"]
        )

    def tearDown(self):
        self._truncate_database()

    @staticmethod
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

    @staticmethod
    def grant_access(resource=None):
        def _grant_access(f):
            @functools.wraps(f)
            def wrapper(self, *args, **kwargs):
                self.db.insert(
                    {"id": 1, "name": "GROUPTEST"},
                    self.db.tables["UserGroup"]
                )

                self.db.insert(
                    {"group_id": 1, "user_id": 1},
                    self.db.tables["UserGroupAssignment"]
                )

                self.db.insert(
                    {"group_id": 1, "resource": resource},
                    self.db.tables["UserGroupRight"]
                )

                f(self, *args, **kwargs)

            return wrapper
        return _grant_access

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
