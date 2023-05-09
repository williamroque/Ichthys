const quoteElement = document.querySelector('#quote');

const quotes = [
    [
        'For I am convinced that neither death nor life, neither angels nor demons, neither the present nor the future, nor any powers, neither height nor depth, nor anything else in all creation, will be able to separate us from the love of God that is in Christ Jesus our Lord.',
        'Romans 8:38-39'
    ],
    [
        'Greater love has no one than this: to lay down one\'s life for one\'s friends.',
        'John 15:13'
    ],
    [
        'There is no fear in love. But perfect love drives out fear, because fear has to do with punishment. The one who fears is not made perfect in love.',
        'John 4:18'
    ],
    [
        'While the sun, or the light, or the moon, or the stars, be not darkened, nor the clouds return after the rain... Or ever the silver cord be loosed, or the golden bowl be broken, or the pitcher be broken at the fountain, or the wheel broken at the cistern... Then shall the dust return to the earth as it was: and the spirit shall return unto God who gave it.',
        'Ecclesiastes 12:2−7'
    ],
    [
        'Whosoever drinketh of this water shall thirst again: But whosoever drinketh of the water that I shall give him shall never thirst; but the water that I shall give him shall be in him a well of water springing up into everlasting life.',
        'John 4:13−14'
    ],
    [
        'But be ye doers of the word, and not hearers only, deceiving your own selves. For if any be a hearer of the word, and not a doer, he is like unto a man beholding his natural face in a glass: For he beholdeth himself, and goeth his way, and straightway forgetteth what manner of man he was.',
        'James 1:22−24'
    ],
    [
        'And charity suffereth long, and is kind, and envieth not... beareth all things, believeth all things, hopeth all things, endureth all things. Wherefore, my beloved brethren, if ye have not charity, ye are nothing, for charity never faileth. Wherefore, cleave unto charity, which is the greatest of all, for all things must fail.',
        'Moroni 7:45−46'
    ],
    [
        'If thou be cast into the deep; if the billowing surge conspire against thee; if fierce winds become thine enemy; if the heavens gather blackness, and all the elements combine to hedge up the way; and above all, if the very jaws of hell shall gape open the mouth wide after thee, know thou, my son, that all these things shall give thee experience, and shall be for thy good.',
        'D&C 122:7'
    ],
    [
        'Therefore do not worry about tomorrow, for tomorrow will worry about itself. Each day has enough trouble of its own.',
        'Matthew 6:34'
    ],
    [
        'We have known and have believed the love that God has for us. God is love, and those who remain in love remain in God and God remains in them.',
        '1 John 4:16'
    ],
    [
        'Instead, love your enemies, do good, and lend expecting nothing in return. If you do, you will have a great reward. You will be acting the way children of the Most High act, for he is kind to ungrateful and wicked people.',
        'Luke 6:35'
    ],
    [
        'Conduct yourselves with all humility, gentleness, and patience. Accept each other with love, and make an effort to preserve the unity of the Spirit with the peace that ties you together.',
        'Ephesians 4:2−3'
    ],
    [
        'And now, O my son Helaman, behold, thou art in thy youth, and therefore, I beseech of thee that thou wilt hear my words and learn of me; for I do know that whosoever shall put their trust in God shall be supported in their trials, and their troubles, and their afflictions, and shall be lifted up at the last day.',
        'Alma 36:3',
    ],
    [
        'Peace I leave with you, my peace I give unto you: not as the world giveth, give I unto you. Let not your heart be troubled, neither let it be afraid.',
        'John 14:27'
    ],
    [
        'And now as I said concerning faith—faith is not to have a perfect knowledge of things; therefore if ye have faith ye hope for things which are not seen, which are true.',
        'Alma 32:21'
    ],
    [
        'Wherefore, there must be faith; and if there must be faith there must also be hope; and if there must be hope there must also be charity.',
        'Moroni 10:20'
    ],
    [
        'To every thing there is a season, and a time to every purpose under the heaven; A time to be born, and a time to die; A time to break down, and a time to build up; A time to weep, and a time to laugh; A time to mourn, and a time to dance; A time to embrace, and a time to refrain; A time to keep silence, and a time to speak; A time to love, and a time to hate; A time of war, and a time of peace.',
        'Ecclesiastes 3:1-8'
    ],
    [
        'The Lord is my shepherd; I shall not want. He maketh me to lie down in green pastures: he leadeth me beside the still waters. He restoreth my soul: he leadeth me in the paths of righteousness for his name’s sake. Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me.',
        'Psalms 23:1-4'
    ],
    [
        'Now ye may suppose that this is afoolishness in me; but behold I say unto you, that by bsmall and simple things are great things brought to pass; and small means in many instances doth confound the wise.',
        'Alma 37:6'
    ]
];


const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
quoteElement.innerHTML = `${randomQuote[0]} <span class="quote-source">― ${randomQuote[1]}</span>`;
