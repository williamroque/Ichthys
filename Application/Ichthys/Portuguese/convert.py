import json


name = 'pgp'
data_path = f'{name}.json'
index_path = f'{name}_index.json'
output_path = f'{name}.ichs'
use_books = True
aliases = []
lang = 'Portuguese'

with open(data_path) as data_file:
    data_raw = json.loads(data_file.read())

    try:
        with open(index_path) as index_file:
            index = json.loads(index_file.read())

            index = { v: k for k, v in index.items() }

            data = {}

            for key in data_raw.keys():
                if key in index:
                    data[index[key]] = data_raw[key]
    except FileNotFoundError:
        data = data_raw

    output = {
        'name': name,
        'useBooks': use_books,
        'aliases': aliases,
        'lang': lang,
        'content': data
    }

with open(output_path, 'w') as f:
    f.write(json.dumps(output))

print('Converted.')
