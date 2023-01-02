
customElements.get('term-article') ||
customElements.define('term-article', class extends HTMLElement {
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

        this.page = document.location.hash.replace('#', '');
        this.article = window.dataHandler.getArticleByProp("hash", this.page);
        this.build();

        this.appendChild(rootElement);
    }


    /**
     * Build the article
     */
    build() {
        this.buildPrevNext();
        this.buildBreadcrumbs();
        this.setTitle(this.article.title);
        this.buildContent();
    }


    /**
     * Build prev and next links
     */
    buildPrevNext() {
        const prev = window.dataHandler.getArticleBefore(this.page);
        const next = window.dataHandler.getArticleAfter(this.page);

        if (prev == null) {
            this.prevElement.classList.add('invisible');
        }

        if (next == null) {
            this.nextElement.classList.add('invisible');
        }

        this.prevElement.href = `#${prev?.hash}`;
        this.nextElement.href = `#${next?.hash}`;
    }


    /**
     * Set the title
     */
    setTitle(title) {
        this.titleElement.textContent = title;
    }


    /**
     * Build content and add it to the DOM
     */
    buildContent() {
        const content = this.article.content;
        const doc = new DOMParser().parseFromString(content, "text/html");
        const cleanedContent = doc.documentElement.textContent;

        const linkedContent = cleanedContent.replace(new RegExp(window.dataHandler.getArticleTitles().join('|'), 'g'), (match) => {
            const article = window.dataHandler.getArticleByProp("title", match);
            return `<a href="#${article.hash}">${match}</a>`;
        });

        this.contentElement.innerHTML = linkedContent;
    }


    /**
     * Build breadcrumbs and add them to the DOM
     */
    buildBreadcrumbs() {
        const breadcrumbs = this.article.history || [];
        const breadcrumbParts = [];

        const separator = document.createElement('i');
        separator.classList.add("fa-solid", "fa-chevron-right");
        
        // Build breadcrumb links
        for (const breadcrumb of breadcrumbs) {
            const a = document.createElement('a');
            a.href = `#${breadcrumb.hash}`;
            a.textContent = breadcrumb.title;
            breadcrumbParts.push(a);
        }

        // Add breadcrumb links to breadcrumb element
        for (let i = 0; i < breadcrumbParts.length; i++) {
            this.breadcrumbElement.appendChild(breadcrumbParts[i]);

            if (i < breadcrumbParts.length - 1) {
                this.breadcrumbElement.appendChild(separator.cloneNode(true));
            }
        }
    }

});
