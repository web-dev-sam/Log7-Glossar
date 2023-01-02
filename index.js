
const DATA = {
    articles: [
        {
            hash: "web-components",
            title: "Web Components",
            content: "Web Components are a set of web platform APIs that allow you to create new custom, reusable, encapsulated HTML tags to use in web pages and web apps.",
            articles: [
                {
                    hash: "shadow-dom",
                    title: "Shadow DOM",
                    content: "The Shadow DOM is a DOM tree attached to an element, but rendered separately from a document's main DOM tree.",
                    articles: [
                        {
                            hash: "shadow-root",
                            title: "Shadow Root",
                            content: "The Shadow DOM is a DOM tree attached to an element, but rendered separately from a document's main DOM tree.",
                        },
                    ],
                },
                {
                    hash: "custom-elements",
                    title: "Custom Elements",
                    content: "Custom Elements are a set of web platform APIs that allow you to define custom elements and their behavior, which can then be used as desired in your user interface."
                },
                {
                    hash: "html-templates",
                    title: "HTML Templates",
                    content: "The HTML template element is a mechanism for holding HTML that is not to be rendered immediately when a page is loaded but may be instantiated subsequently during runtime using JavaScript."
                },
                {
                    hash: "html-imports",
                    title: "HTML Imports",
                    content: "The HTML Imports feature allows users to include and reuse HTML documents in other HTML documents."
                },
            ],
        },
    ]
};

function buildArticleNav(data) {
    const nav = document.getElementById('article-nav');
    const ul = document.createElement('ul');

    buildArticleList(data.articles, 1, ul);

    nav.appendChild(ul);
}

function buildArticleList(articles, level, ul) {
    articles.forEach(article => {

        // Ignore articles nested deeper than 3 levels (this shouldnt be done)
        if (level > 3) {
            return;
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
            return;
        }
    });
}

buildArticleNav(DATA);