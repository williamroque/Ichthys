const { ipcRenderer } = require('electron');


const searchInput = document.querySelector('#search-input');
const startingSearchInput = document.querySelector('#starting-search-input');
const overlay = document.querySelector('#overlay');
const leftArrow = document.querySelector('#left-arrow');
const rightArrow = document.querySelector('#right-arrow');


let currentMatch;


function search(query) {
    const lang = ipcRenderer.sendSync('read-settings')['lang'];
    const index = ipcRenderer.sendSync('request-index', lang);

    const match = getExactMatch(query, index);

    if (match) {
        let [book, title, chapter, verse, otherVerses] = match;

        const bookData = ipcRenderer.sendSync('request-book', book, lang);

        let titleContent, windowTitle;
        if (bookData.useBooks) {
            titleContent = bookData.content[title];
            windowTitle = `${title} ${chapter}`;
        } else {
            titleContent = bookData.content;
            windowTitle = `${bookData.aliases[0]} ${chapter}`;
        }

        const chapterIndex = parseInt(chapter) - 1;

        if (chapterIndex < titleContent.length) {
            const chapterVerses = titleContent[chapterIndex];

            let range = [];

            if (verse) {
                const start = parseInt(verse);
                const end = parseInt(otherVerses || start);

                range = [...Array(end - start + 1)].map((_, i) => start + i);
            }

            renderChapter(
                windowTitle,
                chapterVerses,
                range,
                chapter === '1' ? title : ''
            );
            leftArrow.classList.remove('hide');
            rightArrow.classList.remove('hide');

            return match;
        }
    }
}

function startSearch() {
    searchInput.value = '';

    searchInput.classList.remove('hide');
    overlay.classList.remove('hide');

    searchInput.focus();
}

function endSearch() {
    searchInput.classList.add('hide');
    overlay.classList.add('hide');
}

function next() {
    if (currentMatch) {
        const lang = ipcRenderer.sendSync('read-settings')['lang'];
        const index = ipcRenderer.sendSync('request-index', lang);

        const [book, title, chapter, verse, otherVerses] = currentMatch;

        let match = search(`${title} ${parseInt(chapter) + 1}`);

        if (match) {
            currentMatch = match;
        } else {
            const nextTitle = index[book][index[book].indexOf(title) + 1];

            currentMatch = search(`${nextTitle} 1`) || currentMatch;
        }
    }
}

function previous() {
    if (currentMatch) {
        const lang = ipcRenderer.sendSync('read-settings')['lang'];
        const index = ipcRenderer.sendSync('request-index', lang);

        const [book, title, chapter, verse, otherVerses] = currentMatch;

        const chapterNum = parseInt(chapter);

        if (chapterNum === 1) {
            const previousTitle = index[book][index[book].indexOf(title) - 1];

            const bookData = ipcRenderer.sendSync('request-book', book, lang);
            const lastChapter = bookData.content[previousTitle].length;

            currentMatch = search(`${previousTitle} ${lastChapter}`) || currentMatch;
        } else {
            const match = search(`${title} ${parseInt(chapterNum) - 1}`);

            if (match) {
                currentMatch = match;
            }
        }
    }
}

document.addEventListener('keydown', e => {
    if (e.key === 'f') {
        e.preventDefault();

        if (hasRendered) {
            startSearch();
        } else {
            startingSearchInput.focus();
        }
    } else if (e.key === 'j') {
        contentWrapper.scrollBy(0, 20);
    } else if (e.key === 'k') {
        contentWrapper.scrollBy(0, -20);
    } else if (e.key === 'h') {
        previous();
    } else if (e.key === 'l') {
        next();
    }

}, false);

searchInput.addEventListener('keydown', e => {
    e.stopPropagation();

    if (e.key === 'Enter' || e.key === 'j' && e.ctrlKey) {
        currentMatch = search(searchInput.value);
        endSearch();
    } else if (e.key === 'Escape' || e.key === '[' && e.ctrlKey) {
        endSearch();
    }
}, false);

startingSearchInput.addEventListener('keydown', e => {
    e.stopPropagation();

    if (e.key === 'Enter' || e.key === 'j' && e.ctrlKey) {
        currentMatch = search(startingSearchInput.value);
    } else if (e.key === 'Escape' || e.key === '[' && e.ctrlKey) {
        startingSearchInput.blur();
    }
}, false);

document.addEventListener('click', e => {
    endSearch();
}, false);

leftArrow.addEventListener('click', previous, false);
rightArrow.addEventListener('click', next, false);

startingSearchInput.focus();
