
window.dataHandler = new ArticleDataHandler();
window.addEventListener('hashchange', () => {
    updatePage();
});
window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        document.getElementById('article-search').focus();
    }
});
document.getElementById("article-search").addEventListener("input", () => {
    filterArticles();
});

updatePage();

function updatePage() {
    updateArticleNav();
    updateArticles();
}

function updateArticles() {
    const wrapper = document.getElementById('article-wrapper');
    wrapper.innerHTML = '';

    const page = document.location.hash.replace('#', '');
    const article = window.dataHandler.getArticleByHash(page);
    if (page === '' || article == null) {
        wrapper.innerHTML = `<main-article></main-article>`;
    } else {
        wrapper.innerHTML = `<term-article></term-article>`;
    }
}

function updateArticleNav() {
    const nav = document.getElementById('article-nav');
    const ul = document.createElement('ul');

    function buildArticleList(articles, level, ul) {
        for (const article of articles) {
    
            // Ignore articles nested deeper than 3 levels (this shouldnt be done)
            if (level > 3) {
                continue;
            }
    
            // Build article
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `#${article.hash}`;
            a.textContent = article.title;
            li.classList.add(`nav-level-${level}`);
            li.classList.add(`nav-${article.hash}`);
            li.appendChild(a);
            ul.appendChild(li);
    
            // Build nested articles if present
            if (article.articles != null) {
                buildArticleList(article.articles, level + 1, ul);
            }
        };
    }
    buildArticleList(window.dataHandler.data.articles, 1, ul);
    nav.innerHTML = '';
    nav.appendChild(ul);
}

function filterArticles() {
    const search = document.getElementById("article-search").value;
    const data = window.dataHandler.data.articles;

    function filterArticlesRecursive(articles, search) {
        let hasMatch = false;
        for (const article of articles) {
            const title = article.title.toLowerCase();
            const matches = title.includes(search.toLowerCase());
            const hasChildren = article.articles != null && article.articles.length > 0;
            const childrenMatch = hasChildren ? filterArticlesRecursive(article.articles, search) : false;
            const show = matches || childrenMatch;
            const li = document.querySelector(`.nav-${article.hash}`);

            if (li != null) li.style.display = show ? 'block' : 'none';
            if (show) hasMatch = true;
        }
        return hasMatch;
    }

    filterArticlesRecursive(data, search);
}