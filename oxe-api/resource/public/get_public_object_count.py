import collections

from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_restful import Resource
from webargs import fields
from sqlalchemy import func

from db.db import DB
from decorator.catch_exception import catch_exception
from utils.response import build_no_cors_response


class GetPublicObjectCount(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @doc(tags=['public'],
         description='Get the counts for miscellaneous objects.<br/><br/>' +
                     'The count values can be distributed through entities, articles, ' +
                     'articles by types, taxonomy values (see "include_*" params).<br/><br/>' +
                     'The count values can be filtered with taxonomy values ' +
                     '(see "taxonomy_values" and "taxonomy_value_operator" params).',
         responses={
             "200": {},
         })
    @use_kwargs({
        'name': fields.Str(required=False),
        'taxonomy_values': fields.DelimitedList(fields.Int(), required=False),
        'taxonomy_value_operator': fields.Str(required=False, validate=lambda x: x in ["AND", "OR"], missing="AND"),

        'include_entities': fields.Bool(required=False, missing=True),
        'include_articles': fields.Bool(required=False, missing=True),
        'include_article_types': fields.Bool(required=False, missing=True),
        'include_taxonomy_categories': fields.DelimitedList(fields.Str(), required=False, missing=[]),
    }, location="query")
    @catch_exception
    def get(self, **kwargs):

        ta = self.db.tables["TaxonomyAssignment"]
        tv = self.db.tables["TaxonomyValue"]
        att = self.db.tables["ArticleTaxonomyTag"]

        data = {
            "entity": {},
            "article": {},
            "taxonomy": {},
        }

        # Manage entities

        cols = self.db.tables["Entity"].id,
        entities = self.db.get_filtered_entities({
            "name": kwargs["name"],
            "status": ["ACTIVE"]
        }, cols)

        if kwargs["include_entities"]:
            data["entity"]["total"] = entities.count()

        # Manage articles

        cols = self.db.tables["Article"].id, self.db.tables["Article"].type,
        articles = self.db.get_filtered_article_query({
            "title": kwargs["name"],
            "status": ["PUBLIC"],
        }, entities=cols).all()

        if kwargs["include_articles"]:
            data["article"]["total"] = len(articles)

        if kwargs["include_article_types"]:
            for t in self.db.tables["Article"].__table__.columns["type"].type.enums:
                data["article"][t.lower()] = len([a for a in articles if a[1] == t])

        # Manage taxonomy

        if kwargs["include_taxonomy_categories"]:
            # Fetch and sort taxonomy values

            values = self.db.get(tv, {"category": kwargs["include_taxonomy_categories"]})
            values_per_category = collections.defaultdict(list)

            for v in values:
                k = v.category
                values_per_category[k].append(v)

            # Fetch and count entity assignments for sorted taxonomy values

            assignments = self.db.session \
                .query(ta.taxonomy_value_id, func.count(ta.taxonomy_value_id)) \
                .join(self.db.tables["Entity"],
                      self.db.tables["Entity"].id == ta.entity_id) \
                .filter(self.db.tables["Entity"].status == "PUBLIC") \
                .filter(ta.taxonomy_value_id.in_([v.id for v in values])) \
                .group_by(ta.taxonomy_value_id)

            for k, vs in values_per_category.items():
                if k not in data["taxonomy"]:
                    data["taxonomy"][k] = dict()

                for v in vs:
                    filtered_assignments = [a for a in assignments if a[0] == v.id]
                    data["taxonomy"][k][v.name] = filtered_assignments.pop()[1] if len(filtered_assignments) > 0 else 0

            # Fetch and count article assignments for sorted taxonomy values

            assignments = self.db.session \
                .query(att.taxonomy_value_id, func.count(att.taxonomy_value_id)) \
                .join(self.db.tables["Article"],
                      self.db.tables["Article"].id == att.article_id) \
                .filter(self.db.tables["Article"].status == "PUBLIC") \
                .filter(att.taxonomy_value_id.in_([v.id for v in values])) \
                .group_by(att.taxonomy_value_id)

            for k, vs in values_per_category.items():
                if k not in data["taxonomy"]:
                    data["taxonomy"][k] = dict()

                for v in vs:
                    filtered_assignments = [a for a in assignments if a[0] == v.id]

                    if v in data["taxonomy"][k]:
                        data["taxonomy"][k][v.name] += filtered_assignments.pop()[1]\
                            if len(filtered_assignments) > 0 else 0
                    else:
                        data["taxonomy"][k][v.name] = filtered_assignments.pop()[1]\
                            if len(filtered_assignments) > 0 else 0

        return build_no_cors_response(data)
