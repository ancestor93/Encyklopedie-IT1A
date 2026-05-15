const searchPages = [
    { url: 'html/1.html', title: 'Kapitola 1: Úvod do IoT' },
    { url: 'html/2.html', title: 'Kapitola 2: Historie IoT' },
    { url: 'html/3.html', title: 'Kapitola 3: Technologie IoT' },
    { url: 'html/4.html', title: 'Kapitola 4: Aplikace IoT' },
    { url: 'html/5.html', title: 'Kapitola 5: Bezpečnost v IoT' },
];

const pageCache = new Map();

async function fetchPageText(page) {
    if (pageCache.has(page.url)) {
        return pageCache.get(page.url);
    }

    try {
        const response = await fetch(page.url);
        if (!response.ok) {
            throw new Error(`Chyba načítání ${page.url}: ${response.status}`);
        }

        const text = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        const bodyText = doc.body ? doc.body.innerText : '';
        const pageText = `${page.title}\n${bodyText}`;
        pageCache.set(page.url, pageText);
        return pageText;
    } catch (error) {
        console.error(error);
        return '';
    }
}

function highlightTerms(text, terms) {
    const escaped = terms.map(term => term.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'));
    const regex = new RegExp(`(${escaped.join('|')})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

function createSnippet(text, query) {
    const lower = text.toLowerCase();
    const index = lower.indexOf(query.toLowerCase());
    if (index === -1) {
        return text.slice(0, 150) + '...';
    }

    const start = Math.max(index - 40, 0);
    const end = Math.min(index + 110, text.length);
    const snippet = text.slice(start, end).trim();
    return (start > 0 ? '... ' : '') + snippet + (end < text.length ? ' ...' : '');
}

async function searchFunction() {
    const query = document.getElementById('searchInput').value.trim();
    const resultsDiv = document.getElementById('searchResults');
    resultsDiv.innerHTML = '';

    if (!query) {
        return;
    }

    const terms = query.split(/\s+/).filter(Boolean);

    const results = [];
    for (const page of searchPages) {
        const pageText = await fetchPageText(page);
        if (!pageText) {
            continue;
        }

        const textLower = pageText.toLowerCase();
        const found = terms.every(term => textLower.includes(term.toLowerCase()));
        if (found) {
            results.push(page);
        }
    }

    if (results.length === 0) {
        resultsDiv.innerHTML = '<p>Nebyly nalezeny žádné výsledky pro zadaný dotaz.</p>';
        return;
    }

    const list = document.createElement('ul');
    for (const page of results) {
        const li = document.createElement('li');
        li.innerHTML = `<a href="${page.url}">${page.title}</a>`;
        list.appendChild(li);
    }
    resultsDiv.appendChild(list);
}

window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('searchButton').addEventListener('click', searchFunction);
    document.getElementById('searchInput').addEventListener('keyup', event => {
        if (event.key === 'Enter') {
            searchFunction();
        }
    });
});

