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
from resource.media.add_image import AddImage


class ImportEntity(MethodResource, Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['network'],
         description='Import a entity from a network node',
         responses={
             "200": {},
             "422.a": {"description": "Object not found: Network node"},
             "500": {"description": "Error while fetching the network node entity"},
         })
    @use_kwargs({
        'network_node_id': fields.Int(),
        'entity_id': fields.Int(),
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

        # Fetch the entity data from the node

        entity_image = None

        try:
            entity = request.get_request(f"{node.api_endpoint}/public/get_public_entity/{kwargs['entity_id']}")
            entity = json.loads(entity)

            if entity["image"] is not None:
                entity_image = request \
                    .get_request(f"{node.api_endpoint}/public/get_public_image/{entity['image']}")

            entity_addresses = request \
                .get_request(f"{node.api_endpoint}/public/get_public_entity_addresses/{kwargs['entity_id']}")
            entity_addresses = json.loads(entity_addresses)
        except Exception:
            traceback.print_exc()
            return "", "500 Error while fetching the network node entity"

        # Create the entity locally

        if entity_image is not None:
            entity_image_response = self.create_image(entity_image)

            if str(entity_image_response[1]).startswith("200"):
                entity_image = entity_image_response[0]
            else:
                return entity_image_response

        entity = self.create_entity(entity, entity_image, **kwargs)
        self.create_entity_addresses(entity_addresses, entity)

        # Terminate the import

        self.db.session.commit()

        return "", "200 "

    def create_image(self, image):
        add_image = AddImage(self.db)
        return add_image.add_image(image=base64.b64encode(image).decode('utf-8'))

    def create_entity(self, entity, entity_image, **kwargs):

        del entity["id"]
        entity = {
            **entity,
            **{
                "sync_node": kwargs["network_node_id"],
                "sync_id": kwargs["entity_id"],
                "sync_global": kwargs["sync_global"],
                "sync_address": kwargs["sync_address"],
                "sync_status": "OK",
                "image": entity_image["id"] if entity_image is not None else None,
            },
        }

        return self.db.insert(entity, self.db.tables["Entity"], commit=False, flush=True)

    def create_entity_addresses(self, entity_addresses, entity):

        addresses = list()

        for address in entity_addresses:
            del address["id"]
            addresses.append({
                **address,
                **{
                    "entity_id": entity.id,
                }
            })

        if len(addresses) > 0:
            self.db.insert(addresses, self.db.tables["EntityAddress"], commit=False, flush=True)
