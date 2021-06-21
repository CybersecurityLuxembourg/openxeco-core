from unittest.mock import patch

from sqlalchemy.exc import IntegrityError

from test.BaseCase import BaseCase


class TestAddTaxonomyValue(BaseCase):

    @BaseCase.login
    @BaseCase.grant_access("/taxonomy/add_taxonomy_value")
    def test_ok(self, token):
        self.db.insert({"name": "CAT1"}, self.db.tables["TaxonomyCategory"])

        payload = {
            "category": "CAT1",
            "value": "My Value",
        }

        response = self.application.post('/taxonomy/add_taxonomy_value',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(200, response.status_code)
        self.assertEqual(self.db.get_count(self.db.tables["TaxonomyValue"]), 1)

    @BaseCase.login
    @BaseCase.grant_access("/taxonomy/add_taxonomy_value")
    def test_ko_missing_category(self, token):

        payload = {
            "category": "CAT1",
            "value": "My Value",
        }

        response = self.application.post('/taxonomy/add_taxonomy_value',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("422 the provided category does not exist", response.status)

    @BaseCase.login
    @BaseCase.grant_access("/taxonomy/add_taxonomy_value")
    def test_ko_duplicate_entry(self, token):
        self.db.insert({"name": "CAT1"}, self.db.tables["TaxonomyCategory"])
        self.db.insert({"id": 1, "name": "My Value", "category": "CAT1"}, self.db.tables["TaxonomyValue"])

        payload = {
            "category": "CAT1",
            "value": "My Value",
        }

        response = self.application.post('/taxonomy/add_taxonomy_value',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("422 This value is already existing", response.status)

    @BaseCase.login
    @BaseCase.grant_access("/taxonomy/add_taxonomy_value")
    @patch('db.db.DB.insert')
    def test_ko_force_integrity_error_out_of_duplicate(self, mock_db_insert, token):
        self.db.session.add(self.db.tables["TaxonomyCategory"](**{"name": "CAT1"}))
        self.db.session.commit()
        mock_db_insert.side_effect = [IntegrityError(None, None, None), None]

        payload = {
            "category": "CAT1",
            "value": "My Value",
        }

        response = self.application.post('/taxonomy/add_taxonomy_value',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(500, response.status_code)
        self.assertEqual(mock_db_insert.call_count, 2)
