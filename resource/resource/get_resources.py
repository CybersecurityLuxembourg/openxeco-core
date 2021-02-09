from flask_restful import Resource
from flask_jwt_extended import jwt_required
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access


class GetResources(Resource):

    def __init__(self, db, api):
        self.api = api
        self.db = db

    @log_request
    @catch_exception
    @jwt_required
    @verify_admin_access
    def get(self):

        routes = []

        for route in self.api.app.url_map.iter_rules():
            if "/get_" not in str(route) and str(route) not in ["/static/<path:filename>", "/<generic>",
                                                                "/account/forgot_password"]:
                routes.append('%s' % route)

        return routes, "200 "
