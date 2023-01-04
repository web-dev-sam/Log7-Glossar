import DEFAULT_DATA from "./default-data.js";

export default class ArticlesHandler {

    constructor() {
        this.data = this.#getData();
        console.log(this.data);
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
        return new RegExp(`\\b(${titles.join('|')})\\b`, "gi");
    }


    saveArticle(hash, title, content) {
        if (!title || !content) {
            return;
        }
        
        const article = this.getArticleByHash(hash);
        article.content = content;
        article.title = title;
        article.hash = this.#generateHash(title);

        this.#saveData(this.data);

        return article;
    }


    addArticle(title, content, parentHash) {
        if (!title || !content) {
            return;
        }

        const article = {
            title,
            content,
            hash: this.#generateHash(title),
        };

        if (parentHash) {
            const parent = this.getArticleByHash(parentHash);
            if (parent.articles) {
                parent.articles.push(article);
            } else {
                parent.articles = [article];
            }
        } else {
            this.data.articles.push(article);
        }

        this.#saveData(this.data);

        return article;
    }


    deleteArticle(hash) {
        const breadcrumbs = this.getArticleBreadcrumbs(hash);
        const article = breadcrumbs[breadcrumbs.length - 1];
        const parent = breadcrumbs[breadcrumbs.length - 2];
        const articles = parent?.articles || this.data.articles;
        const index = articles.indexOf(article);
        articles.splice(index, 1);

        this.#saveData(this.data);
    }


    #generateHash(title) {
        return title.toLowerCase().replaceAll(/[^a-z0-9]/g, "-");
    }


    #saveData(data) {
        localStorage.setItem("article-data", JSON.stringify(data));
    }


    #getArticleByProp(data, prop, value) {
        function getArticleByPropRecursive(articles, prop) {
            const article = articles.find(a => a[prop].toLowerCase() === value.toLowerCase());
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
            const defaultJSON = JSON.stringify(DEFAULT_DATA);
            localStorage.setItem("article-data", defaultJSON);
            return DEFAULT_DATA;
        }

        return JSON.parse(data);
    }

}
