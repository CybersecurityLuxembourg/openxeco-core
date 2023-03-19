import csv
from io import BytesIO, StringIO
from flask import stream_with_context
from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import jwt_required
from flask_restful import Resource
from sqlalchemy import func
from webargs import fields, validate

from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access
from flask import Response

class GetAcceptedUsersExport(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @doc(tags=['user'],
         description='Get users. The request returns a restricted amount of information '
                     '(id, email, is_admin, is_active, accept_communication)',
         responses={
             "200": {},
         })
    @use_kwargs({
        'date_from': fields.DateTime(format="%Y-%m-%d %H:%M:%S", required=False),
        'date_to': fields.DateTime(format="%Y-%m-%d %H:%M:%S", required=False),
    }, location="query")
    @jwt_required
    @verify_admin_access
    @catch_exception
    # @stream_with_context
    def get(self, **kwargs):
        request_query = self.db.session.query(self.db.tables["UserRequest"])
        request_query = request_query.filter(self.db.tables["UserRequest"].status == "ACCEPTED")
        request_query = request_query.filter(self.db.tables["UserRequest"].type == "NEW INDIVIDUAL ACCOUNT")

        # date filter
        if "date_from" in kwargs:
            request_query = request_query.filter(self.db.tables["UserRequest"].submission_date >= kwargs["date_from"])

        if "date_to" in kwargs:
            request_query = request_query.filter(self.db.tables["UserRequest"].submission_date <= kwargs['date_to'])

        requests = request_query.all()
        user_ids = {
            request.user_id
            for request in requests
        }

        query = self.db.session.query(
            self.db.tables["UserProfile"]
        ).join(
            self.db.tables["User"],
            self.db.tables["Country"],
            self.db.tables["Profession"],
            self.db.tables["Industry"],
            self.db.tables["Expertise"],
            self.db.tables["UserRequest"],
        ).filter(
            self.db.tables["UserProfile"].user_id.in_(user_ids),
            self.db.tables["UserRequest"].type == "NEW INDIVIDUAL ACCOUNT",
            self.db.tables["UserRequest"].status == "ACCEPTED",
        )

        db_users = query.with_entities(
            self.db.tables["User"],
            self.db.tables["UserProfile"],
            self.db.tables["Country"],
            self.db.tables["Profession"],
            self.db.tables["Industry"],
            self.db.tables["Expertise"],
            self.db.tables["UserRequest"],
        ).all()
        users = [
            {
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "telephone": user.telephone,
                "accept_communication": "Yes" if user.accept_communication == 1 else "No",
                "gender": user_profile.gender,
                "sector": user_profile.sector,
                "residency": user_profile.residency,
                "mobile": user_profile.mobile,
                "experience": user_profile.experience,
                "domains_of_interest": user_profile.domains_of_interest,
                "how_heard": user_profile.how_heard,
                "public": "Yes" if user_profile.public == 1 else "No",
                "profession": profession.name,
                "industry": industry.name,
                "nationality": country.name,
                "expertise": expertise.name,
                "submission_date": request.submission_date.strftime("%Y-%m-%d %H:%M:%S"),
            }
            for (user, user_profile, country, profession, industry, expertise, request) in db_users
        ]

        keys = list(users[0].keys())

        def generate():
            data = StringIO()
            w = csv.writer(data)

            # write header
            w.writerow(keys)
            yield data.getvalue()
            data.seek(0)
            data.truncate(0)

            # write each log item
            for user in users:
                w.writerow(list(user.values()))
                yield data.getvalue()
                data.seek(0)
                data.truncate(0)

        # stream the response as the data is generated
        response = Response(stream_with_context(generate()), mimetype='text/csv')
        # add a filename
        response.headers.set("Content-Disposition", "attachment", filename="users.csv")
        return response
