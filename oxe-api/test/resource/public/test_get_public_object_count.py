from test.BaseCase import BaseCase


class TestGetPublicObjectCount(BaseCase):

    @BaseCase.login
    def test_ok_empty(self, token):
        response = self.application.get('/public/get_public_object_count',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual(response.json, {})

    @BaseCase.login
    def test_ok_empty_and_disabled_article_types(self, token):
        response = self.application.get('/public/get_public_object_count?include_entities=true&include_articles=true',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual(response.json, {
            'entity': {
                'total': 0
            },
            'article': {
                'total': 0
            },
        })

    @BaseCase.login
    def test_ok_empty_and_disabled_articles(self, token):
        response = self.application.get('/public/get_public_object_count?include_entities=true'
                                        '&include_article_types=EVENT,JOB OFFER,NEWS,RESOURCE,SERVICE,TOOL',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual(response.json, {
            'entity': {
                'total': 0
            },
            'article': {
                'event': 0,
                'job offer': 0,
                'news': 0,
                'resource': 0,
                'service': 0,
                'tool': 0,
            },
        })

    @BaseCase.login
    def test_ok_empty_and_disabled_entity(self, token):
        response = self.application.get('/public/get_public_object_count?include_articles=true'
                                        '&include_article_types=EVENT,JOB OFFER,NEWS,RESOURCE,SERVICE,TOOL',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual(response.json, {
            'article': {
                'event': 0,
                'job offer': 0,
                'news': 0,
                'resource': 0,
                'service': 0,
                'tool': 0,
                'total': 0
            },
        })

    @BaseCase.login
    def test_ok_with_entities_and_taxonomy(self, token):
        self.db.insert({
            "id": 1,
            "name": "My entity",
            "creation_date": "2020-06-06",
        }, self.db.tables["Entity"])
        self.db.insert({
            "id": 2,
            "name": "My entity 2",
            "creation_date": None,
        }, self.db.tables["Entity"])
        self.db.insert({
            "id": 3,
            "name": "My entity 3",
            "creation_date": None,
        }, self.db.tables["Entity"])
        self.db.insert({
            "id": 4,
            "name": "My inactive entity",
            "status": "INACTIVE",
            "creation_date": None,
        }, self.db.tables["Entity"])

        self.db.insert({
            "name": "ENTITY TYPE",
        }, self.db.tables["TaxonomyCategory"])
        self.db.insert({
            "id": 1,
            "category": "ENTITY TYPE",
            "name": "Association",
        }, self.db.tables["TaxonomyValue"])
        self.db.insert({
            "id": 2,
            "category": "ENTITY TYPE",
            "name": "Private company",
        }, self.db.tables["TaxonomyValue"])
        self.db.insert({
            "id": 3,
            "category": "ENTITY TYPE",
            "name": "Other",
        }, self.db.tables["TaxonomyValue"])

        self.db.insert({
            "taxonomy_value_id": 1,
            "entity_id": 1,
        }, self.db.tables["TaxonomyAssignment"])
        self.db.insert({
            "taxonomy_value_id": 1,
            "entity_id": 2,
        }, self.db.tables["TaxonomyAssignment"])
        self.db.insert({
            "taxonomy_value_id": 2,
            "entity_id": 1,
        }, self.db.tables["TaxonomyAssignment"])
        self.db.insert({
            "taxonomy_value_id": 3,
            "entity_id": 4,
        }, self.db.tables["TaxonomyAssignment"])

        response = self.application.get('/public/get_public_object_count?include_taxonomy_categories=ENTITY TYPE'
                                        '&include_entities=true&include_articles=true'
                                        '&include_article_types=EVENT,JOB OFFER,NEWS,RESOURCE,SERVICE,TOOL',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual(response.json, {
            'entity': {
                'total': 3
            },
            'article': {
                'event': 0,
                'job offer': 0,
                'news': 0,
                'resource': 0,
                'service': 0,
                'tool': 0,
                'total': 0
            },
            'taxonomy': {
                'ENTITY TYPE': {
                    'Association': 2,
                    'Private company': 1,
                    'Other': 0
                }
            },
        })

    @BaseCase.login
    def test_ok_with_entities_and_articles_and_taxonomy(self, token):
        self.db.insert({
            "id": 1,
            "name": "My entity",
            "creation_date": "2020-06-06",
        }, self.db.tables["Entity"])
        self.db.insert({
            "id": 2,
            "name": "My entity 2",
            "creation_date": None,
        }, self.db.tables["Entity"])
        self.db.insert({
            "id": 3,
            "name": "My entity 3",
            "creation_date": None,
        }, self.db.tables["Entity"])
        self.db.insert({
            "id": 4,
            "name": "My inactive entity",
            "status": "INACTIVE",
            "creation_date": None,
        }, self.db.tables["Entity"])

        self.db.insert({
            "name": "ENTITY TYPE",
        }, self.db.tables["TaxonomyCategory"])
        self.db.insert({
            "id": 1,
            "category": "ENTITY TYPE",
            "name": "Association",
        }, self.db.tables["TaxonomyValue"])
        self.db.insert({
            "id": 2,
            "category": "ENTITY TYPE",
            "name": "Private company",
        }, self.db.tables["TaxonomyValue"])
        self.db.insert({
            "id": 3,
            "category": "ENTITY TYPE",
            "name": "Other",
        }, self.db.tables["TaxonomyValue"])

        self.db.insert({
            "taxonomy_value_id": 1,
            "entity_id": 1,
        }, self.db.tables["TaxonomyAssignment"])
        self.db.insert({
            "taxonomy_value_id": 1,
            "entity_id": 2,
        }, self.db.tables["TaxonomyAssignment"])
        self.db.insert({
            "taxonomy_value_id": 2,
            "entity_id": 1,
        }, self.db.tables["TaxonomyAssignment"])
        self.db.insert({
            "taxonomy_value_id": 3,
            "entity_id": 4,
        }, self.db.tables["TaxonomyAssignment"])

        self.db.insert({
            "id": 1,
            "title": "MY NEWS",
            "type": "NEWS",
            "status": "PUBLIC"
        }, self.db.tables["Article"])
        self.db.insert({
            "id": 2,
            "title": "MY SERVICE",
            "type": "SERVICE",
            "status": "PUBLIC"
        }, self.db.tables["Article"])
        self.db.insert({
            "id": 3,
            "title": "MY DRAFT EVENT",
            "type": "EVENT",
            "status": "DRAFT"
        }, self.db.tables["Article"])
        self.db.insert({
            "id": 4,
            "title": "MY UNDER REVIEW EVENT",
            "type": "EVENT",
            "status": "UNDER REVIEW"
        }, self.db.tables["Article"])
        self.db.insert({
            "id": 5,
            "title": "MY ARCHIVED EVENT",
            "type": "EVENT",
            "status": "ARCHIVE"
        }, self.db.tables["Article"])

        self.db.insert({"taxonomy_value_id": 1, "article_id": 1}, self.db.tables["ArticleTaxonomyTag"])
        self.db.insert({"taxonomy_value_id": 1, "article_id": 2}, self.db.tables["ArticleTaxonomyTag"])
        self.db.insert({"taxonomy_value_id": 1, "article_id": 3}, self.db.tables["ArticleTaxonomyTag"])
        self.db.insert({"taxonomy_value_id": 1, "article_id": 4}, self.db.tables["ArticleTaxonomyTag"])
        self.db.insert({"taxonomy_value_id": 1, "article_id": 5}, self.db.tables["ArticleTaxonomyTag"])

        response = self.application.get('/public/get_public_object_count?include_taxonomy_categories=ENTITY TYPE'
                                        '&include_entities=true&include_articles=true'
                                        '&include_article_types=EVENT,JOB OFFER,NEWS,RESOURCE,SERVICE,TOOL',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual(response.json, {
            'entity': {
                'total': 3
            },
            'article': {
                'event': 0,
                'job offer': 0,
                'news': 1,
                'resource': 0,
                'service': 1,
                'tool': 0,
                'total': 2
            },
            'taxonomy': {
                'ENTITY TYPE': {
                    'Association': 4,
                    'Private company': 1,
                    'Other': 0
                }
            },
        })

    @BaseCase.login
    def test_ok_article_events_and_taxonomy(self, token):
        self.db.insert({
            "id": 1,
            "name": "My entity",
            "creation_date": "2020-06-06",
        }, self.db.tables["Entity"])
        self.db.insert({
            "id": 2,
            "name": "My entity 2",
            "creation_date": None,
        }, self.db.tables["Entity"])
        self.db.insert({
            "id": 3,
            "name": "My entity 3",
            "creation_date": None,
        }, self.db.tables["Entity"])
        self.db.insert({
            "id": 4,
            "name": "My inactive entity",
            "status": "INACTIVE",
            "creation_date": None,
        }, self.db.tables["Entity"])

        self.db.insert({
            "name": "ENTITY TYPE",
        }, self.db.tables["TaxonomyCategory"])
        self.db.insert({
            "id": 1,
            "category": "ENTITY TYPE",
            "name": "Association",
        }, self.db.tables["TaxonomyValue"])
        self.db.insert({
            "id": 2,
            "category": "ENTITY TYPE",
            "name": "Private company",
        }, self.db.tables["TaxonomyValue"])
        self.db.insert({
            "id": 3,
            "category": "ENTITY TYPE",
            "name": "Other",
        }, self.db.tables["TaxonomyValue"])

        self.db.insert({
            "taxonomy_value_id": 1,
            "entity_id": 1,
        }, self.db.tables["TaxonomyAssignment"])
        self.db.insert({
            "taxonomy_value_id": 1,
            "entity_id": 2,
        }, self.db.tables["TaxonomyAssignment"])
        self.db.insert({
            "taxonomy_value_id": 2,
            "entity_id": 1,
        }, self.db.tables["TaxonomyAssignment"])
        self.db.insert({
            "taxonomy_value_id": 3,
            "entity_id": 4,
        }, self.db.tables["TaxonomyAssignment"])

        self.db.insert({
            "id": 1,
            "title": "MY NEWS",
            "type": "NEWS",
            "status": "PUBLIC"
        }, self.db.tables["Article"])
        self.db.insert({
            "id": 2,
            "title": "MY SERVICE",
            "type": "SERVICE",
            "status": "PUBLIC"
        }, self.db.tables["Article"])
        self.db.insert({
            "id": 3,
            "title": "MY DRAFT EVENT",
            "type": "EVENT",
            "status": "DRAFT"
        }, self.db.tables["Article"])
        self.db.insert({
            "id": 4,
            "title": "MY UNDER REVIEW EVENT",
            "type": "EVENT",
            "status": "UNDER REVIEW"
        }, self.db.tables["Article"])
        self.db.insert({
            "id": 5,
            "title": "MY ARCHIVED EVENT",
            "type": "EVENT",
            "status": "ARCHIVE"
        }, self.db.tables["Article"])

        self.db.insert({"taxonomy_value_id": 1, "article_id": 1}, self.db.tables["ArticleTaxonomyTag"])
        self.db.insert({"taxonomy_value_id": 1, "article_id": 2}, self.db.tables["ArticleTaxonomyTag"])
        self.db.insert({"taxonomy_value_id": 1, "article_id": 3}, self.db.tables["ArticleTaxonomyTag"])
        self.db.insert({"taxonomy_value_id": 1, "article_id": 4}, self.db.tables["ArticleTaxonomyTag"])
        self.db.insert({"taxonomy_value_id": 1, "article_id": 5}, self.db.tables["ArticleTaxonomyTag"])

        response = self.application.get('/public/get_public_object_count?include_taxonomy_categories=ENTITY TYPE'
                                        '&include_articles=true'
                                        '&include_article_types=EVENT,NEWS',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual(response.json, {
            'article': {
                'event': 0,
                'news': 1,
                'total': 2
            },
            'taxonomy': {
                'ENTITY TYPE': {
                    'Association': 1,
                    'Private company': 0,
                    'Other': 0
                }
            },
        })