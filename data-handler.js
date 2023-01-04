
export default class ArticlesHandler {

    constructor() {
        this.data = this.#getData();
    }


    getArticleBreadcrumbs(hash) {
        function getBreadcrumbOfArticle(articles, breadcrumbs = []) {
            for (const article of articles) {
                if (article.hash === hash) {
                    breadcrumbs.push(article);
                    return breadcrumbs;
                }

                if (article.articles) {
                    const result = getBreadcrumbOfArticle(article.articles, [...breadcrumbs, article]);
                    if (result) return result;
                }
            }
        }

        return getBreadcrumbOfArticle(this.data.articles);
    }


    getArticleBefore(hash) {
        const breadcrumbs = this.getArticleBreadcrumbs(hash);
        const article = breadcrumbs[breadcrumbs.length - 1];
        const parent = breadcrumbs[breadcrumbs.length - 2];
        const articles = parent?.articles || this.data.articles;
        const index = articles.indexOf(article);
        const prevArticle = articles[index - 1];
        return prevArticle;
    }


    getArticleAfter(hash) {
        const breadcrumbs = this.getArticleBreadcrumbs(hash);
        const article = breadcrumbs[breadcrumbs.length - 1];
        const parent = breadcrumbs[breadcrumbs.length - 2];
        const articles = parent?.articles || this.data.articles;
        const index = articles.indexOf(article);
        const nextArticle = articles[index + 1];
        return nextArticle;
    }


    getArticleByTitle(title) {
        return this.#getArticleByProp(this.data, "title", title);
    }


    getArticleByHash(hash) {
        return this.#getArticleByProp(this.data, "hash", hash);
    }


    getArticleTitlesRegex() {
        const articles = this.#getArticleList();
        const titles = articles.map(a => a.title);
        return new RegExp(`\\b(${titles.join('|')})\\b`, 'g');;
    }


    saveArticleContent(hash, content) {
        const article = this.getArticleByHash(hash);
        article.content = content;

        this.#saveData(this.data);
    }


    #saveData(data) {
        localStorage.setItem("article-data", JSON.stringify(data));
    }


    #getArticleByProp(data, prop, value) {
        function getArticleByPropRecursive(articles, prop) {
            const article = articles.find(a => a[prop] === value);
            if (article != null) {
                return article;
            }

            for (const article of articles) {
                if (article.articles != null) {
                    const result = getArticleByPropRecursive(article.articles, prop);
                    if (result != null) {
                        return result;
                    }
                }
            }
        }

        return getArticleByPropRecursive(data.articles, prop);
    }


    #getArticleList() {
        function getArticleListRecursive(articles) {
            const articleList = [];
            for (const article of articles) {
                articleList.push(article);

                if (article.articles != null) {
                    const subArticles = getArticleListRecursive(article.articles);
                    articleList.push(...subArticles);
                }
            }
            return articleList;
        }

        return getArticleListRecursive(this.data.articles);
    }


    #getData() {
        const data = localStorage.getItem("article-data");

        if (data == null) {
            const defaultData = this.#getDefaultData();
            const defaultJSON = JSON.stringify(defaultData);
            localStorage.setItem("article-data", defaultJSON);
            return defaultData;
        }

        return JSON.parse(data);
    }


    #getDefaultData() {
        return {
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
}
