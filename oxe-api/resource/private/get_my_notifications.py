from flask_apispec import MethodResource
from flask_apispec import doc
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_restful import Resource

from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request


class GetMyNotifications(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @doc(tags=['private'],
         description='Get the number of active requests from the user authenticated by the token '
                     'with status "NEW" or "IN PROCESS". '
                     'The request counts are splitted according to the entity the request are related to',
         responses={
             "200": {},
         })
    @jwt_required
    @catch_exception
    def get(self):

        params = {
            "user_id": int(get_jwt_identity()),
            "status": ['NEW', 'IN PROCESS']
        }

        requests = self.db.get(self.db.tables["UserRequest"], params)

        entity_ids = list({r.entity_id for r in requests if r.entity_id is not None})

        data = {
            "global_requests": len([r for r in requests if r.entity_id is None]),
            "entity_requests": {
                id: len([r for r in requests if r.entity_id == id])  # pylint: disable=comparison-with-callable
                for id in entity_ids
            }
        }

        return data, "200 "
