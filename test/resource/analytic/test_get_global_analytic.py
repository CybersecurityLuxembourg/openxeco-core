from test.BaseCase import BaseCase


class TestGetGlobalAnalytics(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({
            "name": "My company",
            "creation_date": "2020-06-06",
            "type": "ACTOR"
        }, self.db.tables["Company"])
        self.db.insert({
            "name": "My company 2",
            "creation_date": None,
            "type": "ACTOR"
        }, self.db.tables["Company"])
        self.db.insert({
            "name": "My company 3",
            "creation_date": None,
            "type": None
        }, self.db.tables["Company"])

        response = self.application.get('/analytic/get_global_analytics',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual(2, len(response.json["actors"]))
