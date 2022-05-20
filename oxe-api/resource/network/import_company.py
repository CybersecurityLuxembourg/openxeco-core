from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import jwt_required
from flask_restful import Resource
from webargs import fields
import json
import traceback
import base64

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access
from exception.object_not_found import ObjectNotFound
from utils import request
from urllib.error import HTTPError
from resource.media.add_image import AddImage


class ImportCompany(MethodResource, Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['network'],
         description='Import a company from a network node',
         responses={
             "200": {},
             "422.a": {"description": "Object not found: Network node"},
             "500": {"description": "Error while fetching the network node company"},
         })
    @use_kwargs({
        'network_node_id': fields.Int(),
        'company_id': fields.Int(),
        'sync_global': fields.Bool(required=False, missing=False),
        'sync_address': fields.Bool(required=False, missing=False),
    })
    @jwt_required
    @verify_admin_access
    @catch_exception
    def post(self, **kwargs):

        # Fetch the node information

        try:
            node = self.db.get_by_id(kwargs["network_node_id"], self.db.tables["NetworkNode"])
        except Exception:
            raise ObjectNotFound("Network node")

        # Fetch the company data from the node

        company_image = None

        try:
            company = request.get_request(f"{node.api_endpoint}/public/get_public_company/{kwargs['company_id']}")
            company = json.loads(company)

            if company["image"] is not None:
                company_image = request \
                    .get_request(f"{node.api_endpoint}/public/get_public_image/{company['image']}")

            company_addresses = request \
                .get_request(f"{node.api_endpoint}/public/get_public_company_addresses/{kwargs['company_id']}")
            company_addresses = json.loads(company_addresses)
        except Exception:
            traceback.print_exc()
            return "", "500 Error while fetching the network node company"

        # Create the company locally

        if company_image is not None:
            company_image_response = self.create_image(company_image)

            if str(company_image_response[1]).startswith("200"):
                company_image = company_image_response[0]
            else:
                return company_image_response
        company = self.create_company(company, company_image, **kwargs)
        self.create_company_addresses(company_addresses, company)

        # Terminate the import

        self.db.session.commit()

        return "", "200 "

    def create_image(self, image):
        add_image = AddImage(self.db)
        return add_image.add_image(image=base64.b64encode(image).decode('utf-8'))

    def create_company(self, company, company_image, **kwargs):

        del company["id"]
        company = {
            **company,
            **{
                "sync_node": kwargs["network_node_id"],
                "sync_id": kwargs["company_id"],
                "sync_global": kwargs["sync_global"],
                "sync_address": kwargs["sync_address"],
                "sync_status": "OK",
                "image": company_image["id"] if company_image is not None else None,
            },
        }

        return self.db.insert(company, self.db.tables["Company"], commit=False, flush=True)

    def create_company_addresses(self, company_addresses, company):

        addresses = list()

        for address in company_addresses:
            del address["id"]
            addresses.append({
                **address,
                **{
                    "company_id": company.id,
                }
            })

        if len(addresses) > 0:
            self.db.insert(addresses, self.db.tables["Company_Address"], commit=False, flush=True)
