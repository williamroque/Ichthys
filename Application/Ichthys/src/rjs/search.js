const { ipcRenderer } = require('electron');


const searchInput = document.querySelector('#search-input');
const startingSearchInput = document.querySelector('#starting-search-input');
const overlay = document.querySelector('#overlay');
const leftArrow = document.querySelector('#left-arrow');
const rightArrow = document.querySelector('#right-arrow');


let currentMatch;


function calculatePercentage(data, title, currentChapter) {
    let total = 0;

    let count = 0;
    let stillCounting = true;

    Object.entries(data['content']).forEach(([book, chapters]) => {
        chapters.forEach((chapter, index) => {
            if (book === title && index === currentChapter) {
                stillCounting = false;
            }

            for (const verse of chapter[2]) {
                total += verse.length;

                if (stillCounting) {
                    count += verse.length;
                }
            }
        });
    });

    return count / total;
}


function search(query) {
    const lang = ipcRenderer.sendSync('read-settings')['lang'];
    const index = ipcRenderer.sendSync('request-index', lang);

    const match = getExactMatch(query, index);

    if (match) {
        let [book, key, chapter, verse, otherVerses] = match;
        const title = reverseGet(index[book], key);

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
            const [intro, summary, chapterVerses] = titleContent[chapterIndex];

            const percentage = calculatePercentage(
                bookData, title, chapterIndex
            );

            let range = [];

            if (verse) {
                const start = parseInt(verse);
                const end = parseInt(otherVerses || start);

                range = [...Array(end - start + 1)].map((_, i) => start + i);
            }

            renderChapter(
                windowTitle,
                intro,
                summary,
                chapterVerses,
                range,
                chapter === '1' ? title : '',
                percentage
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

function reverseGet(obj, value) {
    return Object.keys(obj).find(e => obj[e] == value);
}

function next() {
    if (currentMatch) {
        const lang = ipcRenderer.sendSync('read-settings')['lang'];

        const [book, key, chapter, verse, otherVerses] = currentMatch;

        const index = ipcRenderer.sendSync('request-index', lang)[book];
        const keys = Object.values(index);
        const title = reverseGet(index, key);

        let match = search(`${title} ${parseInt(chapter) + 1}`);

        if (match) {
            currentMatch = match;
        } else {
            const nextKey = keys[keys.indexOf(key) + 1];
            const nextTitle = reverseGet(index, nextKey);

            currentMatch = search(`${nextTitle} 1`) || currentMatch;
        }
    }
}

function previous() {
    if (currentMatch) {
        const lang = ipcRenderer.sendSync('read-settings')['lang'];

        const [book, key, chapter, verse, otherVerses] = currentMatch;

        const index = ipcRenderer.sendSync('request-index', lang)[book];
        const keys = Object.values(index);
        const title = reverseGet(index, key);

        const chapterNum = parseInt(chapter);

        if (chapterNum === 1) {
            const previousKey = keys[keys.indexOf(key) - 1];
            const previousTitle = reverseGet(index, previousKey);

            if (!previousTitle)
                return;

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

function openBookmark() {
    const [book, key, chapter] = ipcRenderer.sendSync('read-settings')['bookmark'];
    const lang = ipcRenderer.sendSync('read-settings')['lang'];
    const index = ipcRenderer.sendSync('request-index', lang)[book];
    const title = reverseGet(index, key);

    currentMatch = search(`${title} ${chapter}`);

    showMessage(`Jumped to ${title} ${chapter}.`);
}

function setBookmark() {
    const [book, key, chapter] = currentMatch;
    const lang = ipcRenderer.sendSync('read-settings')['lang'];
    const index = ipcRenderer.sendSync('request-index', lang)[book];
    const title = reverseGet(index, key);

    ipcRenderer.sendSync('write-settings', 'bookmark', [book, key, chapter]);

    showMessage(`Bookmarked ${title} ${chapter}.`);
}

document.addEventListener('keydown', e => {
    messagePrompt.classList.add('hide');

    if (e.key === 'c') {
        const language = ipcRenderer.sendSync('change-language');

        const [book, key, chapter] = currentMatch;
        const index = ipcRenderer.sendSync('request-index', language)[book];
        const title = reverseGet(index, key);

        search(`${title} ${chapter}`);

        showMessage(`Changed language to ${language}.`);
    } else if (e.key === 't') {
        if (lightStylesheet.media) {
            lightStylesheet.media = '';
            ipcRenderer.sendSync('write-settings', 'theme', 'light');
            showMessage('Switched to light mode.');
        } else {
            lightStylesheet.media = 'none';
            ipcRenderer.sendSync('write-settings', 'theme', 'dark');
            showMessage('Switched to dark mode.');
        }
    } else if (e.key === 'f') {
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
    } else if (e.key === 'b') {
        openBookmark();
    } else if (e.key === 'B' && currentMatch) {
        setBookmark();
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
