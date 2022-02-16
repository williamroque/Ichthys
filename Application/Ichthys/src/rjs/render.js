const contentWrapper = document.querySelector('#content');
const titlebar = document.querySelector('#titlebar');

let hasRendered = false;


function renderChapter(title, chapterVerses, selectedVerses) {
    titlebar.innerText = title;

    while (contentWrapper.firstChild)
        contentWrapper.firstChild.remove();

    const table = document.createElement('TABLE');
    table.classList.add('verse-table');

    let firstVerseElement;

    chapterVerses.forEach((verse, i) => {
        verse = verse.trim();

        const verseElement = document.createElement('TR');
        verseElement.classList.add('verse');

        const numElement = document.createElement('TD');
        const num = verse.match(/^\d+/)[0];
        const numTextElement = document.createTextNode(num);

        numElement.appendChild(numTextElement);
        numElement.classList.add('verse-num');
        verseElement.appendChild(numElement);

        const contentElement = document.createElement('TD');
        contentElement.classList.add('verse-content');

        if (selectedVerses.indexOf(i + 1) > -1) {
            verseElement.classList.add('selected-verse');
        }

        const contentTextElement = document.createTextNode(
            verse.replace(/^\d+ /, '')
        );

        contentElement.appendChild(contentTextElement);
        verseElement.appendChild(contentElement);

        table.appendChild(verseElement);

        if (i + 1 === selectedVerses[0]) {
            firstVerseElement = verseElement;
        }
    });

    contentWrapper.appendChild(table);

    if (firstVerseElement) {
        contentWrapper.scrollTop = firstVerseElement.offsetTop;
    } else {
        contentWrapper.scrollTop = 0;
    }

    hasRendered = true;
}
