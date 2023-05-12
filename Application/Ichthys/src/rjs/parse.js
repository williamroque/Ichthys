function sanitize(text, unicode=false) {
    text = text.toLowerCase();
    text = text.trim();

    if (unicode) {
        text = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        text = text.replace(/[^a-z0-9:\- ]/g, '');
    }

    text = text.replace(/–/g, '-');
    text = text.replace(/ {2,}/g, ' ');

    return text;
}

function getCharProperties(str) {
    let props = { length: str.length };

    [...str].forEach((c, i) => {
        if (c in props) {
            props[c][0]++;
        } else {
            props[c] = [1, new Set()];
        }

        if (i > 0) props[c][1].add(str[i - 1]);
        if (i + 1 < str.length) props[c][1].add(str[i + 1]);
    });

    return props;
}

function getDistance(aProps, b) {
    const bProps = getCharProperties(b);

    let distance = Math.abs(aProps.length - bProps.length);

    for (const key in aProps) {
        if (key === 'length') continue;

        if (!(key in bProps)) {
            distance++;
            continue;
        }

        const neighbors = new Set([...aProps[key][1]]
                                  .filter(i => bProps[key][1].has(i)));

        distance += Math.abs(aProps[key][0] - bProps[key][0]);
        distance -= neighbors.size;
    }

    return distance;
}

function fuzzyGetBook(text, index) {
    text = sanitize(text);

    const textProperties = getCharProperties(text);

    let distances = {};

    for (const book in index) {
        for (const title of index[book]) {
            const sanitizedTitle = sanitize(title);
            const distance = getDistance(textProperties, sanitizedTitle);

            distances[distance] = [book, title];
        }
    }

    return distances[Math.min(...Object.keys(distances))];
}

function getExactMatch(text, index, unicode=false) {
    text = sanitize(text, unicode);

    for (const book in index) {
        const sorted = Object.keys(index[book]).sort((a, b) => b.length - a.length);

        for (const title of sorted) {
            const sanitizedTitle = sanitize(title, unicode);

            const match = text.match(new RegExp(`${sanitizedTitle} (\\d+)(?::(\\d+)(?:-(\\d+))?)?`));

            if (match) {
                const [_, chapter, verse, otherVerses, ...rest] = match;

                return [book, index[book][title], chapter, verse, otherVerses];
            } else if (text === sanitizedTitle) {
                return [book, index[book][title], '1', undefined, undefined];
            }
        }
    }

    if (!unicode) {
        return getExactMatch(text, index, true);
    }
}

