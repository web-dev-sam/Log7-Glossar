
customElements.get('main-article') ||
customElements.define('main-article', class extends HTMLElement {
    constructor() {
        super();

        const template = document.querySelector('#main-article-template');
        const templateContent = template.content;
        
        this.appendChild(templateContent.cloneNode(true));
    }

});
