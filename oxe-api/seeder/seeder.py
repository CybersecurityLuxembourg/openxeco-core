import csv




class DatabaseSeeder:

    def __init__(self, db):
        self.db = db

    def _read_csv(self, filename: str):
        with open(filename, newline='') as csvfile:
            reader = csv.reader(csvfile, delimiter=',', quotechar='|')
            for row in reader:
                yield row

    def seed_from_csv(self, table, file):
        path = f"seeder/lists/{file}"

        with open(path, 'r') as data:
            for line in csv.DictReader(data):
                if self.db.get_count(self.db.tables[table], line) > 0:
                    continue
                self.db.insert(line, self.db.tables[table])
