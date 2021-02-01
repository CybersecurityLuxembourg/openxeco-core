from test.BaseCase import BaseCase
from sqlalchemy.exc import IntegrityError
from unittest.mock import patch


class TestAddTaxonomyValueHierarchy(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({"name": "CAT1"}, self.db.tables["TaxonomyCategory"])
        self.db.insert({"name": "CAT2"}, self.db.tables["TaxonomyCategory"])
        self.db.insert({"parent_category": "CAT1", "child_category": "CAT2"}, self.db.tables["TaxonomyCategoryHierarchy"])
        self.db.insert({"id": 1, "name": "VAL1", "category": "CAT1"}, self.db.tables["TaxonomyValue"])
        self.db.insert({"id": 2, "name": "VAL2", "category": "CAT2"}, self.db.tables["TaxonomyValue"])

        payload = {
            "parent_value": 1,
            "child_value": 2,
        }

        response = self.application.post('/taxonomy/add_taxonomy_value_hierarchy',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(200, response.status_code)
        self.assertEqual(self.db.get_count(self.db.tables["TaxonomyValueHierarchy"]), 1)

    @BaseCase.login
    def test_ko_same_values(self, token):

        payload = {
            "parent_value": 1,
            "child_value": 1,
        }

        response = self.application.post('/taxonomy/add_taxonomy_value_hierarchy',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(422, response.status_code)
        self.assertEqual("422 The provided values cannot be the same one", response.status)

    @BaseCase.login
    def test_ko_parent_value_not_existing(self, token):
        self.db.insert({"name": "CAT2"}, self.db.tables["TaxonomyCategory"])
        self.db.insert({"id": 2, "name": "VAL2", "category": "CAT2"}, self.db.tables["TaxonomyValue"])

        payload = {
            "parent_value": 1,
            "child_value": 2,
        }

        response = self.application.post('/taxonomy/add_taxonomy_value_hierarchy',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(422, response.status_code)
        self.assertEqual("422 Provided parent value not existing", response.status)

    @BaseCase.login
    def test_ko_child_value_not_existing(self, token):
        self.db.insert({"name": "CAT1"}, self.db.tables["TaxonomyCategory"])
        self.db.insert({"id": 1, "name": "VAL1", "category": "CAT1"}, self.db.tables["TaxonomyValue"])

        payload = {
            "parent_value": 1,
            "child_value": 2,
        }

        response = self.application.post('/taxonomy/add_taxonomy_value_hierarchy',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(422, response.status_code)
        self.assertEqual("422 Provided child value not existing", response.status)

    @BaseCase.login
    def test_ko_category_hierarchy_not_existing(self, token):
        self.db.insert({"name": "CAT1"}, self.db.tables["TaxonomyCategory"])
        self.db.insert({"name": "CAT2"}, self.db.tables["TaxonomyCategory"])
        self.db.insert({"id": 1, "name": "VAL1", "category": "CAT1"}, self.db.tables["TaxonomyValue"])
        self.db.insert({"id": 2, "name": "VAL2", "category": "CAT2"}, self.db.tables["TaxonomyValue"])

        payload = {
            "parent_value": 1,
            "child_value": 2,
        }

        response = self.application.post('/taxonomy/add_taxonomy_value_hierarchy',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(422, response.status_code)
        self.assertEqual("422 Hierarchy between the categories of the values does not exist", response.status)

    @BaseCase.login
    def test_ko_duplicate_entry(self, token):
        self.db.insert({"name": "CAT1"}, self.db.tables["TaxonomyCategory"])
        self.db.insert({"name": "CAT2"}, self.db.tables["TaxonomyCategory"])
        self.db.insert({"parent_category": "CAT1", "child_category": "CAT2"},
                       self.db.tables["TaxonomyCategoryHierarchy"])
        self.db.insert({"id": 1, "name": "VAL1", "category": "CAT1"}, self.db.tables["TaxonomyValue"])
        self.db.insert({"id": 2, "name": "VAL2", "category": "CAT2"}, self.db.tables["TaxonomyValue"])
        self.db.insert({"parent_value": 1, "child_value": 2,}, self.db.tables["TaxonomyValueHierarchy"])

        payload = {
            "parent_value": 1,
            "child_value": 2,
        }

        response = self.application.post('/taxonomy/add_taxonomy_value_hierarchy',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(500, response.status_code)
        self.assertEqual("500 Object already existing", response.status)

    @BaseCase.login
    @patch('db.db.DB.insert')
    def test_ko_force_integrity_error_out_of_duplicate(self, mock_db_insert, token):
        self.db.session.add(self.db.tables["TaxonomyCategory"](**{"name": "CAT1"}))
        self.db.session.add(self.db.tables["TaxonomyCategory"](**{"name": "CAT2"}))
        self.db.session.commit()
        self.db.session.add(self.db.tables["TaxonomyCategoryHierarchy"](**{"parent_category": "CAT1", "child_category": "CAT2"}))
        self.db.session.add(self.db.tables["TaxonomyValue"](**{"id": 1, "name": "My Value", "category": "CAT1"}))
        self.db.session.add(self.db.tables["TaxonomyValue"](**{"id": 2, "name": "My Value2", "category": "CAT2"}))
        self.db.session.commit()
        mock_db_insert.side_effect = IntegrityError(None, None, None)

        payload = {
            "parent_value": 1,
            "child_value": 2,
        }

        response = self.application.post('/taxonomy/add_taxonomy_value_hierarchy',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(500, response.status_code)
        self.assertEqual(mock_db_insert.call_count, 2)
