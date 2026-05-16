const searchPages = [
    { url: 'html/1_uvod_iot.html', title: 'Kapitola 1: Úvod do IoT' },
    { url: 'html/2_historie_iot.html', title: 'Kapitola 2: Historie IoT' },
    { url: 'html/3_technologie_iot.html', title: 'Kapitola 3: Technologie IoT' },
    { url: 'html/4_aplikace_iot.html', title: 'Kapitola 4: Aplikace IoT' },
    { url: 'html/5_bezpecnost_v_iot.html', title: 'Kapitola 5: Bezpečnost v IoT' },
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
    resultsDiv.style.display = 'none';

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
        resultsDiv.style.display = 'block';
        return;
    }

    const list = document.createElement('ul');
    for (const page of results) {
        const li = document.createElement('li');
        li.innerHTML = `<a href="${page.url}">${page.title}</a>`;
        list.appendChild(li);
    }
    resultsDiv.appendChild(list);
    resultsDiv.style.display = 'block';
}

window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('searchButton').addEventListener('click', searchFunction);
    document.getElementById('searchInput').addEventListener('keyup', event => {
        if (event.key === 'Enter') {
            searchFunction();
        }
    });
});

// Insert burger button into navbar and handle toggle for mobile
document.addEventListener('DOMContentLoaded', () => {
    const nav = document.querySelector('navbar');
    if (!nav) return;

    // move searchResults into search-bar (if present) to behave like a dropdown
    const searchBar = nav.querySelector('.search-bar');
    const resultsDiv = document.getElementById('searchResults');
    if (searchBar && resultsDiv) {
        searchBar.appendChild(resultsDiv);
        resultsDiv.classList.add('dropdown');
        resultsDiv.style.display = 'none';
    }

    // create burger button
    const burger = document.createElement('button');
    burger.className = 'burger';
    burger.setAttribute('aria-label', 'Toggle menu');
    burger.innerHTML = '<span class="burger-box"><span class="burger-inner"></span></span>';

    // insert as first child of navbar
    nav.insertBefore(burger, nav.firstChild);

    burger.addEventListener('click', () => {
        nav.classList.toggle('open');
    });

    // Close menu when clicking outside on small screens
    document.addEventListener('click', (e) => {
        if (!nav.classList.contains('open')) return;
        if (!nav.contains(e.target)) {
            nav.classList.remove('open');
        }
    });

    // Close search dropdown when clicking outside
    document.addEventListener('click', (e) => {
        const searchBar = nav.querySelector('.search-bar');
        const resultsDiv = document.getElementById('searchResults');
        if (!searchBar || !resultsDiv) return;
        if (!searchBar.contains(e.target)) {
            resultsDiv.style.display = 'none';
        }
    });

    // Hide dropdown on ESC
    document.addEventListener('keyup', (e) => {
        if (e.key === 'Escape') {
            const resultsDiv = document.getElementById('searchResults');
            if (resultsDiv) resultsDiv.style.display = 'none';
            nav.classList.remove('open');
        }
    });
});

