
window.dataHandler = new ArticleDataHandler();

buildArticleNav();

function buildArticleNav() {
    const nav = document.getElementById('article-nav');
    const ul = document.createElement('ul');

    buildArticleList(window.dataHandler.data.articles, 1, ul);

    nav.appendChild(ul);
}

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
