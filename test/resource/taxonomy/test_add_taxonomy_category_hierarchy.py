from test.BaseCase import BaseCase
from sqlalchemy.exc import IntegrityError
from unittest.mock import patch


class TestAddTaxonomyCategoryHierarchy(BaseCase):

    @BaseCase.login
    @BaseCase.grant_access("/taxonomy/add_taxonomy_category_hierarchy")
    def test_ok(self, token):
        self.db.insert({"name": "CAT1"}, self.db.tables["TaxonomyCategory"])
        self.db.insert({"name": "CAT2"}, self.db.tables["TaxonomyCategory"])

        payload = {
            "parent_category": "CAT1",
            "child_category": "CAT2",
        }

        response = self.application.post('/taxonomy/add_taxonomy_category_hierarchy',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(200, response.status_code)
        self.assertEqual(self.db.get_count(self.db.tables["TaxonomyCategoryHierarchy"]), 1)

    @BaseCase.login
    @BaseCase.grant_access("/taxonomy/add_taxonomy_category_hierarchy")
    def test_ko_same_categories(self, token):
        self.db.insert({"name": "CAT1"}, self.db.tables["TaxonomyCategory"])

        payload = {
            "parent_category": "CAT1",
            "child_category": "CAT1",
        }

        response = self.application.post('/taxonomy/add_taxonomy_category_hierarchy',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(422, response.status_code)
        self.assertEqual("422 The provided categories cannot be the same one", response.status)

    @BaseCase.login
    @BaseCase.grant_access("/taxonomy/add_taxonomy_category_hierarchy")
    def test_ko_missing_category(self, token):

        payload = {
            "parent_category": "CAT1",
            "child_category": "CAT2",
        }

        response = self.application.post('/taxonomy/add_taxonomy_category_hierarchy',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(422, response.status_code)
        self.assertEqual("422 One of the provided category does not exist", response.status)

    @BaseCase.login
    @BaseCase.grant_access("/taxonomy/add_taxonomy_category_hierarchy")
    def test_ko_duplicate_entry(self, token):
        self.db.insert({"name": "CAT1"}, self.db.tables["TaxonomyCategory"])
        self.db.insert({"name": "CAT2"}, self.db.tables["TaxonomyCategory"])
        self.db.insert({"parent_category": "CAT1", "child_category": "CAT2"},
                       self.db.tables["TaxonomyCategoryHierarchy"])

        payload = {
            "parent_category": "CAT1",
            "child_category": "CAT2",
        }

        response = self.application.post('/taxonomy/add_taxonomy_category_hierarchy',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(500, response.status_code)
        self.assertEqual("500 Object already existing", response.status)

    @BaseCase.login
    @BaseCase.grant_access("/taxonomy/add_taxonomy_category_hierarchy")
    @patch('db.db.DB.insert')
    def test_ko_force_integrity_error_out_of_duplicate(self, mock_db_insert, token):
        self.db.session.add(self.db.tables["TaxonomyCategory"](**{"name": "CAT2"}))
        self.db.session.add(self.db.tables["TaxonomyCategory"](**{"name": "CAT1"}))
        self.db.session.commit()
        mock_db_insert.side_effect = IntegrityError(None, None, None)

        payload = {
            "parent_category": "CAT1",
            "child_category": "CAT2",
        }

        response = self.application.post('/taxonomy/add_taxonomy_category_hierarchy',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(500, response.status_code)
        self.assertEqual(mock_db_insert.call_count, 2)
