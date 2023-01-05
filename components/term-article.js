import { html } from '../utils.js';

export default class extends HTMLElement {
    constructor() {
        super();

        const template = document.querySelector('#term-article-template');
        const templateContent = template.content;
        const rootElement = templateContent.cloneNode(true);
        this.appendChild(rootElement);

        this.rootElement = this.firstElementChild;
        this.prevElement = this.rootElement.querySelector('.prev');
        this.nextElement = this.rootElement.querySelector('.next');
        this.breadcrumbElement = this.rootElement.querySelector('.breadcrumbs');
        this.titleElement = this.rootElement.querySelector('.title');
        this.contentElement = this.rootElement.querySelector('.content');
        this.isNew = this.hasAttribute('is-new');
        this.parentHash = this.getAttribute('parent-hash');

        this.page = document.location.hash.replace('#', '');
        this.article = window.app.dataHandler.getArticleByHash(this.page);
        this.build();

        if (this.isNew) {
            this.rootElement.querySelector('.edit-icon').classList.add("fa-floppy-disk");
            this.titleElement.querySelector("input").focus();
        }
    }


    /**
     * Build the article
     */
    build() {
        this.buildBreadcrumbs();
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
        const contentWithNewlines = this.article.content.replace(/\n/g, html`<br />`);
        const alreadyLinked = new Set();

        const linkedContent = contentWithNewlines
            .replace(titleRegex, (match) => {
                if (match.toLowerCase() === this.article.title.toLowerCase()) {
                    return match;
                }
                
                const article = window.app.dataHandler.getArticleByTitle(match);
                if (article == null || alreadyLinked.has(article.hash)) {
                    return match;
                }

                alreadyLinked.add(article.hash);
                return html`<a href="#${article.hash}" class="hover-opacity">${match}</a>`;
            });

        this.contentElement.innerHTML = linkedContent;
    }


    /**
     * Build breadcrumbs and add them to the DOM
     */
    buildBreadcrumbs() {
        const breadcrumbs = this.isNew ? 
            window.app.dataHandler.getArticleBreadcrumbs(this.parentHash) ?? [] :
            window.app.dataHandler.getArticleBreadcrumbs(this.page);

        if (this.isNew) breadcrumbs.push({
            title: breadcrumbs.length === 0 ? "Neue Kategorie" : "Neuer Artikel",
            hash: "new-article",
        });

        // Map the breadcrumbs to an HTML string array of links and arrows
        // Then flatten the array and remove the last arrow
        // Then reduce the array to one string and add it to the DOM
        const breadcrumbsHTML = breadcrumbs
            .map(breadcrumb => ([
                html`<a href="#${breadcrumb.hash}" class="hover-opacity">${breadcrumb.title}</a>`,
                html`<i class="fa-solid fa-chevron-right"></i>`,
            ]))
            .flat()
            .slice(0, -1)
            .reduce((a, b) => a + b, "");

        this.breadcrumbElement.innerHTML = breadcrumbsHTML;
    }


    editArticle() {
        const saving = this.rootElement.querySelector('svg.edit-icon').classList.contains("fa-floppy-disk");

        this.titleElement.contentEditable = saving ? "false" : "true";
        this.contentElement.contentEditable = saving ? "false" : "true";
        this.contentElement.focus();

        if (saving && this.isNew) {
            const title = this.rootElement.querySelector(".new-article-title").value;
            const content = this.rootElement.querySelector(".new-article-content").value;
            const newArticle = window.app.dataHandler.addArticle(title, content, this.parentHash);
            if (newArticle == null) {
                this.#wiggleElement(this.rootElement.querySelector('svg.edit-icon'));
                return;
            }

            window.app.updateArticleNav();
            window.location.hash = newArticle.hash;
            return;
        }

        if (saving) {
            this.save();
        } else {
            this.rootElement.querySelector('svg.edit-icon').classList.add("fa-floppy-disk");
        }
    }


    save() {
        const newArticle = this.#saveChanges();
        if (newArticle == null) {
            this.#wiggleElement(this.rootElement.querySelector('svg.edit-icon'));
            return;
        }

        window.app.updatePage(newArticle);
    }


    cancelEditing() {
        if (this.isNew) {
            window.location.hash = this.parentHash;
            return;
        }

        window.app.updatePage();
    }


    deleteArticle() {
        if (this.isNew) {
            window.location.hash = this.parentHash;
            return;
        }

        this.#deleteAlert(
            "Artikel löschen", 
            "Möchtest du diesen Artikel wirklich löschen?", 
            "Löschen", 
            "Abbrechen", 
            () => {
                window.app.dataHandler.deleteArticle(this.page);
                window.app.updatePage();
            }
        );
    }

    #wiggleElement(element) {
        element.animate([
            { transform: "translateX(-5px)" },
            { transform: "translateX(5px)" },
            { transform: "translateX(-5px)" },
            { transform: "translateX(5px)" },
            { transform: "translateX(-5px)" },
            { transform: "translateX(5px)" },
        ], {
            duration: 200,
            iterations: 1,
        });
    }


    #saveChanges() {
        const title = this.titleElement.innerText.trim();
        const content = this.contentElement.innerText.trim();
        return window.app.dataHandler.saveArticle(this.page, title, content);
    }

    #deleteAlert(title, message, confirmText, cancelText, confirmCallback) {
        const alert = document.createElement("div");
        alert.classList.add("alert");
        alert.onclick = () => alert.remove();
        alert.innerHTML = html`
            <div class="alert-content">
                <div class="alert-title">${title}</div>
                <div class="alert-message">${message}</div>
                <div class="alert-buttons">
                    <button class="alert-cancel hover-opacity">${cancelText}</button>
                    <button class="alert-confirm hover-opacity">${confirmText}</button>
                </div>
            </div>
        `;

        alert.querySelector(".alert-confirm").addEventListener("click", () => {
            confirmCallback();
            alert.remove();
        });

        alert.querySelector(".alert-cancel").addEventListener("click", () => {
            alert.remove();
        });

        this.appendChild(alert);
    }

};
