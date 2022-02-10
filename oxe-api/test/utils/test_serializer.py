import datetime

from test.BaseCase import BaseCase
from utils.serializer import Serializer


class TestSerializer(BaseCase):

    def test_ok_serialize_object(self):
        self.db.insert({
            "name": "My company",
            "creation_date": "2020-06-06",
            "is_startup": True,
        }, self.db.tables["Company"])

        company = self.db.get(self.db.tables["Company"])[0]

        res = Serializer.serialize_object(company, self.db.tables["Company"])

        self.assertEqual(res["name"], "My company")
        self.assertEqual(res["creation_date"], "2020-06-06")
        self.assertEqual(res["is_startup"], True)

    def test_ok_serialize_with_object(self):
        self.db.insert({
            "name": "My company",
            "creation_date": "2020-06-06",
            "is_startup": True,
        }, self.db.tables["Company"])

        company = self.db.get(self.db.tables["Company"])[0]

        res = Serializer.serialize(company, self.db.tables["Company"])

        self.assertEqual(res["name"], "My company")
        self.assertEqual(res["creation_date"], "2020-06-06")
        self.assertEqual(res["is_startup"], True)

    def test_ok_serialize_with_list(self):
        self.db.insert({
            "name": "My company",
            "creation_date": "2020-06-06",
            "is_startup": True,
        }, self.db.tables["Company"])
        self.db.insert({
            "name": "My company 2",
            "creation_date": "2020-06-06",
            "is_startup": True,
        }, self.db.tables["Company"])

        companies = self.db.get(self.db.tables["Company"])

        res = Serializer.serialize(companies, self.db.tables["Company"])

        self.assertEqual(len(res), 2)
        self.assertEqual(res[0]["name"], "My company")
        self.assertEqual(res[0]["creation_date"], "2020-06-06")
        self.assertEqual(res[0]["is_startup"], True)
        self.assertEqual(res[1]["name"], "My company 2")
        self.assertEqual(res[1]["creation_date"], "2020-06-06")
        self.assertEqual(res[1]["is_startup"], True)

    def test_ok_serialize_with_bytes(self):
        self.db.insert({
            "id": 51,
            "thumbnail": bytes("", encoding='utf8'),
            "width": 10,
            "height": 10,
            "creation_date": datetime.datetime.today()
        }, self.db.tables["Image"])

        image = self.db.get(self.db.tables["Image"])[0]

        Serializer.serialize(image, self.db.tables["Image"])
