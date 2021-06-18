from flask_jwt_extended import jwt_required
from flask_restful import Resource
from flask_apispec import MethodResource
from db.db import DB
from flask_apispec import doc, marshal_with
from decorator.catch_exception import catch_exception
from decorator.verify_admin_access import verify_admin_access
from utils.serializer import Serializer
from decorator.log_request import log_request


class GetGlobalAnalytics(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @doc(tags=['analytic'],
         description='Get information about actors, workforces, users, last created users, '
                     'last created companies and the whole taxonomy',
         responses={
             "200": {},
         })
    @jwt_required
    @verify_admin_access
    @catch_exception
    def get(self):
        u = self.db.tables["User"]
        c = self.db.tables["Company"]
        tc = self.db.tables["TaxonomyCategory"]
        tch = self.db.tables["TaxonomyCategoryHierarchy"]
        ta = self.db.tables["TaxonomyAssignment"]
        tvh = self.db.tables["TaxonomyValueHierarchy"]
        tv = self.db.tables["TaxonomyValue"]

        data = {
            "actors": [o._asdict() for o in self.db.get_filtered_companies(
                    {"ecosystem_role": "ACTOR"},
                    [c.id, c.is_startup, c.is_cybersecurity_core_business, c.creation_date]
                )
            ],

            "workforces": Serializer.serialize(self.db.get_latest_workforce(), self.db.tables["Workforce"]),

            "total_users": self.db.get_count(self.db.tables["User"]),
            "last_companies": [o._asdict() for o in self.db.session.query(c)
                                .with_entities(c.id, c.name)
                                .order_by(c.id.desc()).limit(5)
                                .all()],
            "last_users": [o._asdict() for o in self.db.session.query(u)
                           .with_entities(u.id, u.email)
                           .order_by(u.id.desc()).limit(5)
                           .all()],

            "taxonomy_categories": Serializer.serialize(self.db.get(tc), tc),
            "taxonomy_category_hierarchy": Serializer.serialize(self.db.get(tch), tch),
            "taxonomy_values": Serializer.serialize(self.db.get(tv), tv),
            "taxonomy_value_hierarchy": Serializer.serialize(self.db.get(tvh), tvh),
            "taxonomy_assignments": Serializer.serialize(self.db.get(ta), ta),
        }

        for r in data["actors"]:
            r["creation_date"] = None if r["creation_date"] is None else str(r["creation_date"])

        return data, "200 "
