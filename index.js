import ArticlesHandler from './data-handler.js';
import TermArticle from './components/term-article.js';
import MainArticle from './components/main-article.js';
import { html, textAreaAdjust } from './utils.js';

class App {

    constructor() {
        this.dataHandler = new ArticlesHandler();

        this.wrapperElement = document.getElementById('article-wrapper');
        this.searchElement = document.getElementById("article-search");
        this.navElement = document.getElementById('article-nav');
        this.navListElement = document.querySelector('#article-nav > ul');
        this.termArticleElement = document.querySelector('term-article');

        this.setupEventListeners();
        this.updatePage();
    }


    setupEventListeners() {
        window.addEventListener('hashchange', () => this.updatePage());
        window.addEventListener('keydown', e => this.handleKeyDown(e));
        this.searchElement.addEventListener("input", () => this.filterArticles());
    }


    handleKeyDown(e) {
        if (e.ctrlKey && e.key === 'p') {
            e.preventDefault();
            this.searchElement.focus();
        }
    }


    setupSearch() {
        document.getElementById("article-search").addEventListener("input", () => {
            this.filterArticles();
        });
    }


    updatePage() {
        this.updateArticle();
        this.updateArticleNav();
    }


    updateArticle() {
        this.page = document.location.hash.replace('#', '');
        this.article = this.dataHandler.getArticleByHash(this.page);

        if (this.page === 'new-article') {
            this.wrapperElement.innerHTML = html`<term-article is-new="true" parent-hash=""></term-article>`;
        } else {
            this.wrapperElement.innerHTML = this.page == null || this.article == null ?
            html`<main-article></main-article>` :
            html`<term-article></term-article>`;
        }

        this.termArticleElement = document.querySelector('term-article');
    }


    addArticleCategory(parentHash) {
        this.wrapperElement.innerHTML = html`<term-article is-new="true" parent-hash="${parentHash ?? ''}"></term-article>`;
        this.termArticleElement = document.querySelector('term-article');
    }


    updateArticleNav() {
        this.navListElement.innerHTML = '';

        const buildArticleList = (articles = this.dataHandler.data.articles, level = 1) => {
            for (const article of articles) {

                // Ignore articles nested deeper than 3 levels (this shouldnt be done)
                if (level > 3) continue;

                // Build nav item
                this.navListElement.innerHTML += html`
                    <li class="nav-level-${level} nav-item nav-${article.hash} ${article.hash === this.page ? 'active-nav' : ''}">
                        <a href="#${article.hash}" title="${article.title}">${article.title}</a><i class="fa-solid fa-plus" onclick="window.app.addArticleCategory('${article.hash}')"></i>
                    </li>
                `;

                // Build nested articles if present
                if (article.articles != null) {
                    buildArticleList(article.articles, level + 1);
                }
            };
        }

        buildArticleList();

        this.navListElement.innerHTML += html`
            <li class="nav-level-1 nav-item add-article-category" onclick="window.app.addArticleCategory()">
                <i class="fa-solid fa-plus"></i>
            </li>
        `;
    }


    filterArticles() {
        const search = this.searchElement.value;
        const data = this.dataHandler.data.articles;

        function filterArticlesRecursive(articles, search) {
            let hasMatch = false;
            for (const article of articles) {
                const informations = article.title.toLowerCase() + article.hash.toLowerCase() + article.content.toLowerCase();
                const matches = informations.includes(search.toLowerCase());
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

}

window.app = new App();
window.textAreaAdjust = textAreaAdjust;

customElements.define('term-article', TermArticle);
customElements.define('main-article', MainArticle);
