const contentWrapper = document.querySelector('#content');
const titlebar = document.querySelector('#titlebar');
const percentageIndicator = document.querySelector('#percentage-indicator');

let hasRendered = false;


function renderChapter(title, intro, summary, chapterVerses, selectedVerses, chapterTitle, percentage) {
    titlebar.innerText = title;
    percentageIndicator.innerText = Math.round(percentage * 100).toString() + '%';
    percentageIndicator.classList.remove('hide');

    while (contentWrapper.firstChild)
        contentWrapper.firstChild.remove();

    if (chapterTitle) {
        const titleElement = document.createElement('H1');
        titleElement.innerText = chapterTitle;
        titleElement.classList.add('chapter-title');
        contentWrapper.appendChild(titleElement);
    }

    if (intro) {
        const introElement = document.createElement('p');
        introElement.innerText = intro;
        introElement.classList.add('intro');
        contentWrapper.appendChild(introElement);
    }

    if (summary) {
        const summaryElement = document.createElement('p');
        summaryElement.innerText = summary;
        summaryElement.classList.add('summary');
        contentWrapper.appendChild(summaryElement);
    }

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

        contentElement.innerHTML = verse.replace(/^\d+ /, '');
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
