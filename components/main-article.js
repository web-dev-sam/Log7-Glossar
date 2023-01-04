
export default class extends HTMLElement {
    constructor() {
        super();

        const template = document.querySelector('#main-article-template');
        const templateContent = template.content;
        this.appendChild(templateContent.cloneNode(true));
    }
}
