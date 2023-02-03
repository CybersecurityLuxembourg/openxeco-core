from flask_apispec import MethodResource
from flask_apispec import doc
from flask_restful import Resource
from flask_jwt_extended import fresh_jwt_required
from sqlalchemy import func
from datetime import datetime, timedelta

from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access


class GetEcosystemActivity(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @doc(tags=['analytics'],
         description='Get the analytics of the ecosystem activity based on the logs',
         responses={
             "200": {},
         })
    @fresh_jwt_required
    @verify_admin_access
    @catch_exception
    def get(self):

        log = self.db.tables["Log"]
        usr = self.db.tables["User"]
        art = self.db.tables["Article"]

        non_admin_user_ids = [u[0] for u in self.db.get(usr, {"is_admin": False}, ["id"])]

        data = {
            "news_publication":
                {str(o[0]): o[1] for o in self.db.session.query(art)
                    .with_entities(func.DATE(art.publication_date), func.count(art.id))
                    .filter(art.type == "NEWS")
                    .filter(art.status == "PUBLIC")
                    .filter(art.is_created_by_admin.is_(False))
                    .filter(art.publication_date > datetime.today() - timedelta(days=365))
                    .group_by(art.publication_date)
                    .all()},
            "event_publication":
                {str(o[0]): o[1] for o in self.db.session.query(art)
                    .with_entities(func.DATE(art.publication_date), func.count(art.id))
                    .filter(art.type == "EVENT")
                    .filter(art.status == "PUBLIC")
                    .filter(art.is_created_by_admin.is_(False))
                    .filter(art.publication_date > datetime.today() - timedelta(days=365))
                    .group_by(art.publication_date)
                    .all()},
            "job_offer_publication":
                {str(o[0]): o[1] for o in self.db.session.query(art)
                    .with_entities(func.DATE(art.publication_date), func.count(art.id))
                    .filter(art.type == "JOB OFFER")
                    .filter(art.status == "PUBLIC")
                    .filter(art.is_created_by_admin.is_(False))
                    .filter(art.publication_date > datetime.today() - timedelta(days=365))
                    .group_by(art.publication_date)
                    .all()},
            "service_publication":
                {str(o[0]): o[1] for o in self.db.session.query(art)
                    .with_entities(func.DATE(art.publication_date), func.count(art.id))
                    .filter(art.type == "SERVICE")
                    .filter(art.status == "PUBLIC")
                    .filter(art.is_created_by_admin.is_(False))
                    .filter(art.publication_date > datetime.today() - timedelta(days=365))
                    .group_by(art.publication_date)
                    .all()},
            "tool_publication":
                {str(o[0]): o[1] for o in self.db.session.query(art)
                    .with_entities(func.DATE(art.publication_date), func.count(art.id))
                    .filter(art.type == "TOOL")
                    .filter(art.status == "PUBLIC")
                    .filter(art.is_created_by_admin.is_(False))
                    .filter(art.publication_date > datetime.today() - timedelta(days=365))
                    .group_by(art.publication_date)
                    .all()},
            "resource_publication":
                {str(o[0]): o[1] for o in self.db.session.query(art)
                    .with_entities(func.DATE(art.publication_date), func.count(art.id))
                    .filter(art.type == "RESOURCE")
                    .filter(art.status == "PUBLIC")
                    .filter(art.is_created_by_admin.is_(False))
                    .filter(art.publication_date > datetime.today() - timedelta(days=365))
                    .group_by(art.publication_date)
                    .all()},

            "account_creation":
                {str(o[0]): o[1] for o in self.db.session.query(usr)
                    .with_entities(func.DATE(usr.sys_date), func.count(usr.id))
                    .filter(usr.is_admin.is_(False))
                    .filter(usr.sys_date > datetime.today() - timedelta(days=365))
                    .group_by(func.DATE(usr.sys_date))
                    .all()},
            "action":
                {str(o[0]): o[1] for o in self.db.session.query(log)
                    .with_entities(func.DATE(log.sys_date), func.count(log.id))
                    .filter(log.user_id.in_(non_admin_user_ids))
                    .filter(log.status_code == 200)
                    .filter(log.request_method == "POST")
                    .filter(log.sys_date > datetime.today() - timedelta(days=365))
                    .group_by(func.DATE(log.sys_date))
                    .all()},
        }

        return data, "200 "
