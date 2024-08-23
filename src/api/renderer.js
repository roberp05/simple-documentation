const { marked } = require('marked');
const path = require('path');
const fs = require('fs');

const options = {
    prefix: "my-prefix-",
    isExport: true,
    absoluteFilePath: ''
  };

/**
 * Renders Markdown content with custom processing.
 *
 * @param {string} content - The Markdown content to render.
 * @returns {string} The rendered HTML content.
 * @author Paul Roberts
 */
function renderMarkdown(content) {

    const renderer = new marked.Renderer();
    renderer.paragraph = (text) => {
        text = text.replace(/^\[\[toc]]/img, () => renderTableOfContents(content));
        text = text.replace(/^\[\[index]]/img, () => renderIndex());
        return marked.Renderer.prototype.paragraph.call(renderer, text);
    };

    renderer.code = function (code, language) {
        if (language == 'mermaid')
            return '<pre class="mermaid">' + code + '</pre>';

        else
            return '<pre><code>' + code + '</code></pre>';
    };

    renderer.link = (href, title, text) => {
        text = removeLinks(text);
        href = formatHref(href, options.isExport);
        return marked.Renderer.prototype.link.call(renderer, href, title, text);
    };

    return marked(content, {
        renderer,
        gfm: true,
        smartLists: true,
        breaks: false,
        highlight: (code, lang) => {
        }
    });
}

/**
 * Loads a page's content and processes it.
 *
 * @param {string} requestPath - The path to the page.
 * @param {function} cb - Callback function to handle the loaded page's data.
 * @author Paul Roberts
 */
function loadPage(requestPath, cb) {
    let filename;
    let title;

    filename = `${__dirname}/${requestPath}`;
    title = path.basename(filename, '.md');

    fs.readFile(filename, { encoding: 'utf-8' }, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT' || error.code === 'ENOTDIR') {
                cb({ status: 404, error });
            } else {
                cb({ status: 500, error });
                console.log(`error loading: ${filename}, error: ${error}`);
            }
        } else {
            cb(null, title, content);
        }
    });
}

/**
 * Removes anchor tags from the given text.
 *
 * @param {string} text - The text containing HTML anchor tags.
 * @returns {string} The text with anchor tags removed.
 * @private
 * @author Paul Roberts
 */
function removeLinks(text) {
    return text.replace(/<a\b[^>]*>/gi, '')
        .replace(/<\/a>/gi, '');
}

/**
 * Formats the href attribute of a link.
 *
 * @param {string} href - The original href.
 * @param {boolean} isExport - Whether it's an export or not.
 * @returns {string} The formatted href.
 * @private
 */
function formatHref(href, isExport) {
    const isExternal = !href.startsWith('/') && path.dirname(href) !== '.';
    const isHash = href.startsWith('#');

    if (!isExport || isExternal || isHash) {
        return href;
    }
    const ext = path.extname(href);
    let dir = path.dirname(href);
    if ((href.startsWith('./')) && dir != options.absoluteFilePath) { dir = path.dirname(options.absoluteFilePath); }
    const base = path.basename(href, ext);
    return path.join('#~', dir, `${base}${ext}`);
}

/**
 * Renders the table of contents based on the content.
 *
 * @param {string} content - The content to generate the table of contents from.
 * @returns {string} The rendered table of contents as HTML.
 * @private
 * @author Paul Roberts
 */
function renderTableOfContents(content) {
    let toc = '';
    const renderer = new marked.Renderer();
    renderer.heading = (text, level, raw) => {
        text = removeLinks(text);
        const slug = raw.toLowerCase().replace(/[^\w]+/g, '-');
        toc += '  '.repeat(level) + `- [${text}](#${slug})\n`;
    };

    marked(content, {
        renderer
    });
    return renderMarkdown(toc);
}

/**
 * Renders the index of files and folders.
 *
 * @returns {string} The rendered index content.
 * @private
 * @author Paul Roberts
 */
function renderIndex() {
    const files = this.indexer.getFiles();
    const nav = {};

    files.forEach(file => {
        file = normalizePath(file);
        const dir = path.dirname(file);
        const components = dir.split(path.sep);
        const name = path.basename(file);
        let parent = nav;

        if (components[0] === '.') {
            components.splice(0, 1);
        }

        components.forEach(component => {
            const current = parent[component] || {};
            parent[component] = current;
            parent = current;
        });

        parent[name] = file;
    });

    const content = renderIndexLevel(nav, 0);
    return this.renderMarkdown(content);
}

/**
 * Renders the index content for a specific level in the directory hierarchy.
 *
 * @param {Object} index - The index object representing files and folders.
 * @param {number} level - The current level in the hierarchy.
 * @returns {string} The rendered index content for the specified level.
 * @private
 * @author Paul Roberts
 */
function renderIndexLevel(index, level) {
    let content = '';
    const indent = '  '.repeat(level);
    const keys = Object.keys(index).sort((a, b) => {
        const aType = typeof index[a];
        const bType = typeof index[b];
        const aNumPrefix = Renderer.getNumberPrefix(a);
        const bNumPrefix = Renderer.getNumberPrefix(b);

        if (ROOT_FILES_INDEX[a]) {
            return -1;
        }

        if (ROOT_FILES_INDEX[b]) {
            return 1;
        }

        if (Number.isFinite(aNumPrefix) && Number.isFinite(bNumPrefix)) {
            return aNumPrefix - bNumPrefix;
        }

        if (Number.isFinite(aNumPrefix)) {
            return -1;
        }

        if (Number.isFinite(bNumPrefix)) {
            return 1;
        }

        if (aType === bType) {
            return a.localeCompare(b);
        }

        if (aType === 'string') {
            // Display files before folders
            return -1;
        }

        return 1;
    });

    keys.forEach(key => {
        const value = index[key];
        content += indent;

        if (typeof value === 'string') {
            const link = Renderer.encodeFileLink(value);
            key = path.basename(key, path.extname(key));
            content += `- [${humanize(Renderer.trimNumberPrefix(key))}](/${link})\n`;
        } else {
            content += `- ${humanize(Renderer.trimNumberPrefix(key))}\n`;
            content += Renderer.renderIndexLevel(value, level + 1);
        }
    });

    return content;
}

module.exports = {
    renderMarkdown,
    loadPage
}