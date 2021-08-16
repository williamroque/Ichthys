#!/usr/bin/env python3

import ssl
from urllib.request import urlopen

import sys
import signal

import json
import re

from bs4 import BeautifulSoup


ot_abbr = 'gen ex lev num deut josh judg ruth 1-sam 2-sam 1-kgs 2-kgs 1-chr 2-chr ezra neh esth job ps prov eccl song isa jer lam ezek dan hosea joel amos obad jonah micah nahum hab zeph hag zech mal'.split(' ')
ot_names = 'Genesis Exodus Leviticus Numbers Deuteronomy Joshua Judges Ruth Samuel-1 Samuel-2 Kings-1 Kings-2 Chronicles-1 Chronicles-2 Ezra Nehemiah Esther Job Psalms Proverbs Ecclesiastes Song-of-Solomon Isaiah Jeremiah Lamentations Ezekiel Daniel Hosea Joel Amos Obadiah Jonah Micah Nahum Habakkuk Zephaniah Haggai Zechariah Malachi'.split(' ')
ot_url = 'https://www.churchofjesuschrist.org/study/scriptures/ot'

nt_abbr = 'matt mark luke john acts rom 1-cor 2-cor gal eph philip col 1-thes 2-thes 1-tim 2-tim titus philem heb james 1-pet 2-pet 1-jn 2-jn 3-jn jude rev'.split(' ')
nt_names = 'Matthew Mark Luke John Acts Romans Corinthians-1 Corinthians-2 Galatians Ephesians Philippians Colossians Thessalonians-1 Thessalonians-2 Timothy-1 Timothy-2 Titus Philemon Hebrews James Peter-1 Peter-2 John-1 John-2 John-3 Jude Revelations'.split(' ')
nt_url = 'https://www.churchofjesuschrist.org/study/scriptures/nt'

bofm_abbr = '1-ne 2-ne jacob enos jarom omni w-of-m mosiah alma hel 3-ne 4-ne morm ether moro'.split(' ')
bofm_names = 'Nephi-1 Nephi-2 Jacob Enos Jarom Omni Words-of-Mormon Mosiah Alma Helaman Nephi-3 Nephi-4 Mormon Ether Moroni'.split(' ')
bofm_url = 'https://www.churchofjesuschrist.org/study/scriptures/bofm'

dc_abbr = list(range(1, 139))
dc_names = ['Section {}'.format(abbr) for abbr in dc_abbr]
dc_url = 'https://www.churchofjesuschrist.org/study/scriptures/dc-testament/dc'


def get_page(url):
    url += '?lang=por'

    ctx = ssl._create_unverified_context()
    with urlopen(url, context=ctx) as res:
        if url != res.url:
            return
        return res.read().decode('utf-8')


def get_clean_soup(page):
    soup = BeautifulSoup(page, 'html.parser')

    for sup in soup.find_all('sup'):
        sup.extract()

    return soup


def get_title_count(soup):
    titles = soup.find_all('p', class_='title')

    if not re.match(r'Cap', titles[0].get_text()):
        return 1

    return len(titles)


def get_verses(url):
    page = get_page(url)
    soup = get_clean_soup(page)

    return [verse.get_text() for verse in soup.find_all('p', class_='verse')]


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
            chapters.append(
                get_verses('{}/{}'.format(
                    base_url,
                    abbreviation[i]
                ))
            )
        else:
            chapters.append(
                get_verses('{}/{}/{}'.format(
                    base_url,
                    abbreviation,
                    i + 1
                ))
            )

    return chapters


def get_book(base_url, abbreviations, names, dc):
    if dc:
        book = get_chapters(len(abbreviations), base_url, abbreviations, True)
    else:
        book = {}

        for i, abbreviation in enumerate(abbreviations):
            print(abbreviation)

            page = get_page('{}/{}'.format(base_url, abbreviation))

            if page:
                soup = get_clean_soup(page)
                title_count = get_title_count(soup)
            else:
                title_count = 1

            chapters = get_chapters(title_count, base_url, abbreviation)

            book[abbreviation] = {
                'name': names[i],
                'chapters': chapters
            }

            if sigint_sent:
                return book

    return book


def save_book(output_path, base_url, abbreviations, names, dc=False):
    book = get_book(base_url, abbreviations, names, dc)

    with open(output_path, 'w') as output_file:
        output_file.write(json.dumps(book))


book = sys.argv[1]

dc_abbr = dc_abbr[115:]
dc_names = dc_names[115:]

books = {
    'ot': ['ot.json', ot_url, ot_abbr, ot_names],
    'nt': ['nt.json', nt_url, nt_abbr, nt_names],
    'bofm': ['bofm.json', bofm_url, bofm_abbr, bofm_names],
    'dc': ['dc.json', dc_url, dc_abbr, dc_names, True]
}

save_book(*books[book])
