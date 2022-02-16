const { ipcRenderer } = require('electron');


const searchInput = document.querySelector('#search-input');
const startingSearchInput = document.querySelector('#starting-search-input');
const overlay = document.querySelector('#overlay');


function search(query) {
    const lang = ipcRenderer.sendSync('read-settings')['lang'];
    const index = ipcRenderer.sendSync('request-index', lang);

    const match = getExactMatch(query, index);

    if (match) {
        const [book, title, chapter, verse, otherVerses] = match;

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

            renderChapter(windowTitle, chapterVerses, range);
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
    }

}, false);

searchInput.addEventListener('keydown', e => {
    e.stopPropagation();

    if (e.key === 'Enter' || e.key === 'j' && e.ctrlKey) {
        search(searchInput.value);
        endSearch();
    } else if (e.key === 'Escape' || e.key === '[' && e.ctrlKey) {
        endSearch();
    }
}, false);

startingSearchInput.addEventListener('keydown', e => {
    e.stopPropagation();

    if (e.key === 'Enter' || e.key === 'j' && e.ctrlKey) {
        search(startingSearchInput.value);
    } else if (e.key === 'Escape' || e.key === '[' && e.ctrlKey) {
        startingSearchInput.blur();
    }
}, false);

document.addEventListener('click', e => {
    endSearch();
}, false);

startingSearchInput.focus();
