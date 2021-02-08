from test.BaseCase import BaseCase
import datetime


class TestUpdateCompany(BaseCase):

    @BaseCase.login
    @BaseCase.grant_access("/company/update_company")
    def test_ok(self, token):
        today = datetime.date.today()

        self.db.insert({
            "id": 2,
            "name": "My Company",
            "creation_date": today,
            "is_startup": True
        }, self.db.tables["Company"])

        payload = {
            "id": 2,
            "name": "My Modified Company",
            "creation_date": (today - datetime.timedelta(days=1)).strftime("%Y-%m-%d"),
            "is_startup": False
        }

        response = self.application.post('/company/update_company',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        companies = self.db.get(self.db.tables["Company"], {"id": 2})

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(companies), 1)
        self.assertEqual(companies[0].name, "My Modified Company")
        self.assertEqual(companies[0].creation_date, today - datetime. timedelta(days=1))
        self.assertEqual(companies[0].is_startup, False)
