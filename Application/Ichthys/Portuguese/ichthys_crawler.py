#!/usr/bin/env python3

import ssl
from urllib.request import urlopen

import sys
import signal

import json
import re

from bs4 import BeautifulSoup


ot_abbr = 'gen ex lev num deut josh judg ruth 1-sam 2-sam 1-kgs 2-kgs 1-chr 2-chr ezra neh esth job ps prov eccl song isa jer lam ezek dan hosea joel amos obad jonah micah nahum hab zeph hag zech mal'.split(' ')
ot_names = 'Gênesis Êxodo Levítico Números Deuteronômio Josué Juízes Rute 1-Samuel 2-Samuel 1-Reis 2-Reis 1-Crônicas 2-Crônicas Esdras Neemias Ester Jó Salmos Provérbios Eclesiastes Cantares-de-Salomão Isaías Jeremias Lamentações Ezequiel Daniel Oseias Joel Amós Obadias Jonas Miqueias Naum Habacuque Sofonias Ageu Zacarias Malaquias'.split(' ')

ot_url = 'https://www.churchofjesuschrist.org/study/scriptures/ot'

nt_abbr = 'matt mark luke john acts rom 1-cor 2-cor gal eph philip col 1-thes 2-thes 1-tim 2-tim titus philem heb james 1-pet 2-pet 1-jn 2-jn 3-jn jude rev'.split(' ')
nt_names = 'Mateus Marcos Lucas João Atos Romanos 1-Coríntios 2-Coríntios Gálatas Efésios Filipenses Colossenses 1-Tessalonicenses 2-Tessalonicenses 1-Timóteo 2-Timóteo Tito Filemom Hebreus Tiago 1-Pedro 2-Pedro 1-João 2-João 3-João Judas Apocalipse'.split(' ')
nt_url = 'https://www.churchofjesuschrist.org/study/scriptures/nt'

bofm_abbr = '1-ne 2-ne jacob enos jarom omni w-of-m mosiah alma hel 3-ne 4-ne morm ether moro'.split(' ')
bofm_names = '1-Néfi 2-Néfi Jacó Enos Jarom Ômni Palavras-de-Mórmon Mosias Alma Helamã 3-Néfi 4-Néfi Mórmon Éter Morôni'.split(' ')
bofm_url = 'https://www.churchofjesuschrist.org/study/scriptures/bofm'

dc_abbr = list(range(1, 139))
dc_names = ['Section {}'.format(abbr) for abbr in dc_abbr]
dc_url = 'https://www.churchofjesuschrist.org/study/scriptures/dc-testament/dc'

pgp_abbr = 'moses abr js-m js-h a-of-f'.split(' ')
pgp_names = 'Moisés Abraão Joseph-Smith-Mateus Joseph-Smith-História Regras-de-Fé'.split(' ')
pgp_url = 'https://www.churchofjesuschrist.org/study/scriptures/pgp'


LANG = 'por'


def get_page(url):
    url += '?lang=' + LANG

    while True:
        try:
            ctx = ssl._create_unverified_context()
            with urlopen(url, context=ctx) as res:
                if url != res.url:
                    return
                return res.read().decode('utf-8', 'ignore')
        except:
            print('Network error. Trying again.')


def get_clean_soup(page):
    soup = BeautifulSoup(page, 'html.parser')

    for sup in soup.find_all('sup'):
        sup.extract()

    return soup


def get_title_count(soup):
    titles = soup.find_all('p', class_='title')

    if not re.match(r'Cap|Chap|Psalm|Salmo', titles[0].get_text()):
        return 1

    return len(titles)


def get_verses(soup):
    return [
        verse.get_text() for verse in soup.find_all('p', class_='verse')
    ]


def get_intro(soup):
    intro = soup.find('p', class_='intro')

    if intro:
        return intro.get_text()


def get_summary(soup):
    summary = soup.find('p', class_='study-summary')

    if summary:
        return summary.get_text()


sigint_sent = False


def signal_handler(sig, frame):
    global sigint_sent
    sigint_sent = True

signal.signal(signal.SIGINT, signal_handler)


def get_chapters(title_count, base_url, abbreviation, dc=False):
    chapters = []

    for i in range(title_count):
        if sigint_sent:
            return chapters

        print('Chapter', i + 1)

        if dc:
            url = '{}/{}'.format(
                base_url,
                abbreviation[i]
            )
        else:
            url = '{}/{}/{}'.format(
                base_url,
                abbreviation,
                i + 1
            )

        page = get_page(url)
        soup = get_clean_soup(page)

        chapters.append([
            get_intro(soup),
            get_summary(soup),
            get_verses(soup)
        ])

    return chapters


def get_book(base_url, abbreviations, names, dc):
    if dc:
        book = get_chapters(len(abbreviations), base_url, abbreviations, True)
    else:
        book = {'nameOrder': [], 'bookOrder': []}

        for i, abbreviation in enumerate(abbreviations):
            print(abbreviation)

            page = get_page('{}/{}'.format(base_url, abbreviation))

            if page:
                soup = get_clean_soup(page)
                title_count = get_title_count(soup)
            else:
                title_count = 1

            chapters = get_chapters(title_count, base_url, abbreviation)

            book[abbreviation] = chapters

            book['nameOrder'].append(names[i].replace('-', ' '))
            book['bookOrder'].append(abbreviation)

            if sigint_sent:
                return book

    return book


def save_book(output_path, index_path, base_url, abbreviations, names, dc=False):
    book = get_book(base_url, abbreviations, names, dc)

    with open(output_path, 'w') as output_file:
        output_file.write(json.dumps(book))

        if not dc:
            with open(index_path, 'w') as index_file:
                index = {}
                for i, scripture_book in enumerate(book['nameOrder']):
                    index[scripture_book] = book['bookOrder'][i]

                index_file.write(json.dumps(index))


book = sys.argv[1]

books = {
    'ot': ['ot.json', 'ot_index.json', ot_url, ot_abbr, ot_names],
    'nt': ['nt.json', 'nt_index.json', nt_url, nt_abbr, nt_names],
    'bofm': ['bofm.json', 'bofm_index.json', bofm_url, bofm_abbr, bofm_names],
    'dc': ['dc.json', None, dc_url, dc_abbr, dc_names, True],
    'pgp': ['pgp.json', 'pgp_index.json', pgp_url, pgp_abbr, pgp_names]
}

if len(sys.argv) > 2:
    LANG = sys.argv[2]

if book == 'all':
    for args in books.values():
        save_book(*args)
else:
    save_book(*books[book])
