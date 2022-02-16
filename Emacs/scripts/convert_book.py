import json
import sys


with open(sys.argv[1], 'r+') as input_file:
    book = json.loads(input_file.read())

    book_order = list(book.keys())
    name_order = [book[abbr]['name'].replace('-', ' ') for abbr in book_order]

    for key, value in book.items():
        book[key] = value['chapters']

    book['bookOrder'] = book_order
    book['nameOrder'] = name_order

    input_file.seek(0)
    input_file.truncate()
    input_file.write(json.dumps(book))


