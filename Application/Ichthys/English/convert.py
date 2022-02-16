import json


data_path = 'pgp.json'
index_path = 'pgp_index.json'
output_path = 'pgp.ichs'
use_books = True
aliases = []
lang = 'eng'

with open(data_path) as data_file:
    with open(index_path) as index_file:
        data_raw = json.loads(data_file.read())
        index = json.loads(index_file.read())

        index = { v: k for k, v in index.items() }

        data = {}

        for key in data_raw.keys():
            if key in index:
                data[index[key]] = data_raw[key]

        output = {
            'useBooks': use_books,
            'aliases': aliases,
            'lang': lang,
            'content': data
        }

with open(output_path, 'w') as f:
    f.write(json.dumps(output))
