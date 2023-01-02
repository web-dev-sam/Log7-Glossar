
class ArticleDataHandler {

    constructor() {
        this.data = {
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
    }

    getArticleBefore(hash) {
        const article = this.getArticleByHash(hash);
        if (article == null) {
            return null;
        }

        const history = article.history || [];
        const parent = history[history.length - 1];
        const articles = parent?.articles || this.data.articles;
        const index = articles.indexOf(article);
        const prevArticle = articles[index - 1];
        return prevArticle;
    }

    getArticleAfter(hash) {
        const article = this.getArticleByHash(hash);
        if (article == null) {
            return null;
        }
        
        const history = article.history || [];
        const parent = history[history.length - 1];
        const articles = parent?.articles || this.data.articles;
        const index = articles.indexOf(article);
        const nextArticle = articles[index + 1];
        return nextArticle;
    }

    getArticleByHash(hash) {
        function getArticleByHashRecursive(articles, hash, history = []) {
            const article = articles.find(a => a.hash === hash);
            if (article != null) {
                article.history = history;
                return article;
            }
    
            for (const article of articles) {
                if (article.articles != null) {
                    history.push(article);
    
                    const result = getArticleByHashRecursive(article.articles, hash, history);
                    if (result != null) {
                        return result;
                    }
                }
            }
        }
    
        return getArticleByHashRecursive(this.data.articles, hash);
    }
}