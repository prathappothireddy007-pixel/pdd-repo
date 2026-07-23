import json

class MockResponse:
    def __init__(self, data):
        self.data = data

class MockQueryBuilder:
    def __init__(self, table_name, db):
        self.table_name = table_name
        self.db = db
        self.conditions = []
        self.operation = None
        self.payload = None
        self.order_col = None
        self.order_desc = False

    def select(self, *args):
        self.operation = "select"
        return self

    def insert(self, data):
        self.operation = "insert"
        self.payload = data if isinstance(data, list) else [data]
        return self

    def update(self, data):
        self.operation = "update"
        self.payload = data
        return self

    def delete(self):
        self.operation = "delete"
        return self

    def eq(self, col, val):
        self.conditions.append(lambda row: row.get(col) == val)
        return self

    def neq(self, col, val):
        self.conditions.append(lambda row: row.get(col) != val)
        return self

    def lte(self, col, val):
        self.conditions.append(lambda row: row.get(col) <= val)
        return self

    def or_(self, condition_str):
        parts = condition_str.split(',')
        parsed_or = []
        for part in parts:
            if '.eq.' in part:
                c, v = part.split('.eq.')
                parsed_or.append((c, v))
                
        self.conditions.append(lambda row: any(row.get(c) == v for c, v in parsed_or))
        return self

    def order(self, col, desc=False):
        self.order_col = col
        self.order_desc = desc
        return self
        
    def limit(self, val):
        return self

    def execute(self):
        table_data = self.db.setdefault(self.table_name, [])
        
        def match(row):
            return all(c(row) for c in self.conditions)

        if self.operation == "insert":
            for item in self.payload:
                if 'id' not in item and self.table_name in ['payments', 'deliveries', 'bids']:
                    item['id'] = len(table_data) + 1
                table_data.append(item)
            return MockResponse(self.payload)

        elif self.operation == "update":
            updated = []
            for row in table_data:
                if match(row):
                    row.update(self.payload)
                    updated.append(row)
            return MockResponse(updated)

        elif self.operation == "delete":
            new_data = [row for row in table_data if not match(row)]
            self.db[self.table_name] = new_data
            return MockResponse([])

        elif self.operation == "select":
            result = [row.copy() for row in table_data if match(row)]
            if self.order_col:
                result.sort(key=lambda x: x.get(self.order_col, 0), reverse=self.order_desc)
            return MockResponse(result)

        return MockResponse([])


class MockSupabaseClient:
    def __init__(self):
        self.db = {
            "users": [],
            "auctions": [],
            "bids": [],
            "deliveries": [],
            "payments": []
        }
        
    def table(self, table_name):
        return MockQueryBuilder(table_name, self.db)
