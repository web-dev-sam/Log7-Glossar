

/**
 * Write a template literal tag that cleans up any input from HTML
 * and returns a string that is safe to use in the DOM.
 * 
 * @example html`<div>${unsafeText}</div>`
 */
export function html(strings, ...values) {
    let result = '';

    for (let i = 0; i < strings.length; i++) {
        result += strings[i];
        if (i < values.length) {
            result += escapeHTML(values[i]);
        }
    }

    return result;
}


/**
 * Escape any unsafe HTML
 */
export function escapeHTML(unsafeText) {
    const doc = new DOMParser().parseFromString(unsafeText, "text/html");
    return doc.body.textContent;
}
