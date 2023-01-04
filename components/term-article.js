import { html } from '../utils.js';

export default class extends HTMLElement {
    constructor() {
        super();

        const template = document.querySelector('#term-article-template');
        const templateContent = template.content;
        const rootElement = templateContent.cloneNode(true);


        this.prevElement = rootElement.querySelector('.prev');
        this.nextElement = rootElement.querySelector('.next');
        this.breadcrumbElement = rootElement.querySelector('.breadcrumbs');
        this.titleElement = rootElement.querySelector('.title');
        this.contentElement = rootElement.querySelector('.content');
        this.isNew = this.hasAttribute('is-new');
        this.parentHash = this.getAttribute('parent-hash');
        console.log(this.parentHash);
        if (this.isNew) {
            rootElement.querySelector(".edit-icon").classList.add("fa-floppy-disk");
        }

        this.page = document.location.hash.replace('#', '');
        this.article = window.app.dataHandler.getArticleByHash(this.page);
        this.build();

        this.appendChild(rootElement);
        this.rootElement = this.firstElementChild;
    }


    /**
     * Build the article
     */
    build() {
        if (!this.isNew) {
            this.buildBreadcrumbs();
        }

        this.buildPrevNext();
        this.setTitle();
        this.buildContent();
    }


    /**
     * Build prev and next links
     */
    buildPrevNext() {
        if (this.isNew) {
            this.prevElement.classList.add('invisible');
            this.nextElement.classList.add('invisible');
            return;
        }

        const prev = window.app.dataHandler.getArticleBefore(this.page);
        const next = window.app.dataHandler.getArticleAfter(this.page);

        if (prev == null) this.prevElement.classList.add('invisible');
        if (next == null) this.nextElement.classList.add('invisible');

        this.prevElement.href = `#${prev?.hash}`;
        this.nextElement.href = `#${next?.hash}`;
    }


    /**
     * Set the title
     */
    setTitle() {
        if (this.isNew) {
            this.titleElement.innerHTML = html`
                <input class="new-article-title" placeholder="Your Title..."></input>
            `;
            return;
        }
        this.titleElement.textContent = this.article?.title;
    }


    /**
     * Build content and add it to the DOM
     */
    buildContent() {
        if (this.isNew) {
            this.contentElement.innerHTML = html`
                <textarea onkeyup="textAreaAdjust(this)" class="new-article-content" placeholder="Enter article content here"></textarea>
            `;
            return;
        }

        const titleRegex = window.app.dataHandler.getArticleTitlesRegex();
        const linkedContent = this.article.content.replace(titleRegex, (match) => {
            const article = window.app.dataHandler.getArticleByTitle(match);
            return html`<a href="#${article.hash}">${match}</a>`;
        });

        this.contentElement.innerHTML = linkedContent;
    }


    /**
     * Build breadcrumbs and add them to the DOM
     */
    buildBreadcrumbs() {
        const breadcrumbs = window.app.dataHandler.getArticleBreadcrumbs(this.page);

        // Map the breadcrumbs to an HTML string array of links and arrows
        // Then flatten the array and remove the last arrow
        // Then reduce the array to one string and add it to the DOM
        const breadcrumbsHTML = breadcrumbs
            .map(breadcrumb => ([
                html`<a href="#${breadcrumb.hash}">${breadcrumb.title}</a>`,
                html`<i class="fa-solid fa-chevron-right"></i>`,
            ]))
            .flat()
            .slice(0, -1)
            .reduce((a, b) => a + b, "");

        this.breadcrumbElement.innerHTML = breadcrumbsHTML;
    }


    editArticle() {
        const content = this.rootElement.querySelector(".content");
        const editIcon = this.rootElement.querySelector(".edit-icon");
        const saving = editIcon.classList.contains("fa-floppy-disk");

        content.contentEditable = saving ? "false" : "true";
        content.focus();

        if (saving && this.isNew) {
            const title = this.rootElement.querySelector(".new-article-title").value;
            const content = this.rootElement.querySelector(".new-article-content").value;
            const newArticle = window.app.dataHandler.addArticle(title, content, this.parentHash);
            window.app.updateArticleNav();
            window.location.hash = newArticle.hash;
            return;
        }

        if (saving) {
            window.app.dataHandler.saveArticleContent(this.page, content.innerText);
            window.app.updateArticle();
            editIcon.classList.add("fa-pen");
        } else {
            editIcon.classList.add("fa-floppy-disk");
        }
    }

};
