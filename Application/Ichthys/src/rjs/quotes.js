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
    ]
];


const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
quoteElement.innerHTML = `${randomQuote[0]} <span class="quote-source">― ${randomQuote[1]}</span>`;
