from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request


class GetMyNotifications(Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @jwt_required
    @catch_exception
    def get(self):

        params = {
            "user_id": int(get_jwt_identity()),
            "status": ['NEW', 'IN PROCESS']
        }

        requests = self.db.get(self.db.tables["UserRequest"], params)

        company_ids = list({r.company_id for r in requests if r.company_id is not None})

        data = {
            "global_requests": len([r for r in requests if r.company_id is None]),
            "entity_requests": {
                id: len([r for r in requests if r.company_id == id])  # pylint: disable=comparison-with-callable
                for id in company_ids
            }
        }

        return data, "200 "
