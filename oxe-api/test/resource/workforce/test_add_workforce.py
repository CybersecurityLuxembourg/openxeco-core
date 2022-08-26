from test.BaseCase import BaseCase


class TestAddWorkforce(BaseCase):

    @BaseCase.login
    @BaseCase.grant_access("/workforce/add_workforce")
    def test_ok(self, token):
        self.db.insert({"id": 1, "name": "Entity1"}, self.db.tables["Entity"])

        payload = {
            "entity_id": 1,
            "workforce": 15,
            "date": "2020-01-01",
            "is_estimated": True,
            "source": "Newspaper",
        }

        response = self.application.post('/workforce/add_workforce',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(200, response.status_code)
        self.assertEqual(self.db.get_count(self.db.tables["Workforce"]), 1)

    @BaseCase.login
    @BaseCase.grant_access("/workforce/add_workforce")
    def test_ko_missing_entity(self, token):

        payload = {
            "entity_id": 1,
            "workforce": 15,
            "date": "2020-01-01",
            "is_estimated": True,
            "source": "Newspaper",
        }

        response = self.application.post('/workforce/add_workforce',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(422, response.status_code)
        self.assertEqual("422 Provided entity not existing", response.status)

    @BaseCase.login
    @BaseCase.grant_access("/workforce/add_workforce")
    def test_ko_wrong_date_format(self, token):
        payload = {
            "entity_id": 1,
            "workforce": 15,
            "date": "202a-01-01",
            "is_estimated": True,
            "source": "Newspaper",
        }

        response = self.application.post('/workforce/add_workforce',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(422, response.status_code)
        self.assertEqual("422 Provided date does not have the right format (expected: YYYY-mm-dd)", response.status)
