
window.dataHandler = new ArticleDataHandler();
window.addEventListener('hashchange', () => {
    updatePage();
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
