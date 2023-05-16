#!/usr/bin/env python3

import ssl
from urllib.request import urlopen

import sys
import signal

import json
import re

from bs4 import BeautifulSoup, NavigableString


ot_abbr = 'gen ex lev num deut josh judg ruth 1-sam 2-sam 1-kgs 2-kgs 1-chr 2-chr ezra neh esth job ps prov eccl song isa jer lam ezek dan hosea joel amos obad jonah micah nahum hab zeph hag zech mal'.split(' ')
ot_names = '創世記 出エジプト記 レビ記 民数記 申命記 ヨシュア記 士師記 ルツ記 サムエル記上 サムエル記下 列王紀上 列王紀下 歴代志上 歴代志下 エズラ記 ネヘミヤ書 エステル記 ヨブ記 詩篇 箴言 伝道の書 雅歌 イザヤ書 エレミヤ書 哀歌 エゼキエル書 ダニエル書 ホセア書 ヨエル書 アモス書 オバデヤ書 ヨナ書 ミカ書 ナホム書 ハバクク書 ゼパニヤ書 ハガイ書 ゼカリヤ書 マラキ書'.split(' ')

ot_url = 'https://www.churchofjesuschrist.org/study/scriptures/ot'

nt_abbr = 'matt mark luke john acts rom 1-cor 2-cor gal eph philip col 1-thes 2-thes 1-tim 2-tim titus philem heb james 1-pet 2-pet 1-jn 2-jn 3-jn jude rev'.split(' ')
nt_names = 'マタイによる福音書 マルコによる福音書 ルカによる福音書 ヨハネによる福音書 使徒行伝 ローマ人への手紙 コリント人への第一の手紙 コリント人への第二の手紙 ガラテヤ人への手紙 エペソ人への手紙 ピリピ人への手紙 コロサイ人への手紙 テサロニケ人への第一の手紙 テサロニケ人への第二の手紙 テモテヘの第一の手紙 テモテヘの第二の手紙 テトスヘの手紙 ピレモンヘの手紙 ヘブル人への手紙 ヤコブの手紙 ペテロの第一の手紙 ペテロの第二の手紙 ヨハネの第一の手紙 ヨハネの第二の手紙 ヨハネの第三の手紙 ユダの手紙 ヨハネの黙示録'.split(' ')
nt_url = 'https://www.churchofjesuschrist.org/study/scriptures/nt'

bofm_abbr = '1-ne 2-ne jacob enos jarom omni w-of-m mosiah alma hel 3-ne 4-ne morm ether moro'.split(' ')
bofm_names = 'ニーファイ第一書 ニーファイ第二書 ヤコブ書 エノス書 ジェロム書 オムナイ書 モルモンの言葉 モーサヤ書 アルマ書 ヒラマン書 第三ニーファイ 第四ニーファイ モルモン書 エテル書 モロナイ書'.split(' ')
bofm_url = 'https://www.churchofjesuschrist.org/study/scriptures/bofm'

dc_abbr = list(range(1, 139))
dc_names = ['第{}章'.format(abbr) for abbr in dc_abbr]
dc_url = 'https://www.churchofjesuschrist.org/study/scriptures/dc-testament/dc'

pgp_abbr = 'moses abr js-m js-h a-of-f'.split(' ')
pgp_names = 'モーセ書 アブラハム書 ジョセフ・スミス—マタイ ジョセフ・スミス—歴史 信仰箇条'.split(' ')
pgp_url = 'https://www.churchofjesuschrist.org/study/scriptures/pgp'


LANG = 'jpn'


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
    count = 0

    for title in soup.find_all('p', class_='title'):
        if re.match(r'第|Cap|Chap|Psalm|Salmo', title.get_text()):
            count += 1

    return count if count > 0 else 1


def parse_verse(verse):
    text = ''

    for element in verse.contents:
        if isinstance(element, NavigableString) or element.name == 'ruby':
            text += str(element)
        elif element.name == 'a':
            text += parse_verse(element)
        else:
            text += element.get_text()

    return text


def get_verses(soup):
    verses = []

    for verse in soup.find_all('p', class_='verse'):
        text = parse_verse(verse)
        verses.append(text.strip())

    return verses


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
