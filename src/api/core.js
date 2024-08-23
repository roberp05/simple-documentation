const renderer = require('./renderer.js');
const fs = require('fs');
const path = require('path');
let config = {};

/** Retrieves the configuration from the 'config.json' file.
 *
 * @async
 * @returns {Promise<string>} A promise that resolves with the configuration content as a string.
 * @throws {Error} If there's an error reading the configuration file.
 * @author Paul Roberts
 */
const getConfig = async () => {
    return new Promise((resolve, reject) => {
        try {
            let config = fs.readFileSync('config.json', { encoding: 'utf8', flag: 'r' });
            resolve(config);
        } catch (error) {
            console.log(error)
            reject(error);
        }
    });
}

/** Retrieves the rendered content of a page given its path.
 *
 * @async
 * @param {string} path - The path to the page.
 * @returns {Promise<string>} A promise that resolves with the rendered page content as a string.
 * @throws {Error} If there's an error loading or rendering the page.
 * @author Paul Roberts
 */
const getPage = async (pagePath) => {
    return new Promise((resolve, reject) => {
        loadPage(pagePath, (error, title, body) => {
            if (error) {
                reject(error);
            } else {
                resolve(renderer.renderMarkdown(body));
            }
        });
    })
};

/** Retrieves the navigation items for the home folder.
 *
 * @async
 * @returns {Promise<string>} A promise that resolves with the navigation items as a JSON string.
 * @throws {Error} If there's an error loading the navigation data.
 * @author Paul Roberts
 */
const getNavigation = async () => {
    return new Promise((resolve, reject) => {
        var nav;
        loadNavigation((error, data) => {
            data = JSON.parse(data);
            if (error) {
                reject(error);
            } else {
                let items = [];
                data.forEach(element => {
                    if (String(element.parent_folder).toLowerCase() === 'home') {
                        if (items.indexOf(element.folder_name) === -1) items.push(element.folder_name);
                    }
                })
                resolve(JSON.stringify(items));
            }
        })
    });
}

/** Retrieves the contents of a folder.
 *
 * @param {string} folderName - The name of the folder.
 * @throws {Error} If there's an error loading the navigation data or processing the folder contents.
 * @author Paul Roberts
 */
const getFolderContents = (folderName) => {
    return new Promise((resolve, reject) => {
        loadNavigation((error, data) => {
            data = JSON.parse(data);
            if (error) {
                reject(error);
            } else {
                folderName = folderName.split('/')[folderName.split('/').length - 1];
                let items = data.filter(item => { return item.folder_name === create(folderName) || item.parent_folder === create(folderName) });
                resolve(JSON.stringify(items));
            }
        });
    
    })
}

/** Loads a page's content.
 *
 * @param {string} requestPath - The path to the page.
 * @param {function} cb - Callback function to handle the loaded page's data.
 * @throws {Error} If there's an error loading the page.
 * @private
 */
const loadPage = (requestPath, cb) => {
    let filename;
    let title;

    filename = requestPath;
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

/** Loads the navigation data.
 *
 * @param {function} cb - Callback function to handle the loaded navigation data.
 * @throws {Error} If there's an error loading the navigation data.
 * @private
 */
const loadNavigation = (cb) => {
    let filename;
    let title;

    filename = `docs/contents.json`;

    fs.readFile(filename, { encoding: 'utf-8' }, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT' || error.code === 'ENOTDIR') {
                cb({ status: 404, error });
            } else {
                cb({ status: 500, error });
                console.log(`error loading: ${filename}, error: ${error}`);
            }
        } else {
            cb(null, content);
        }
    });

};

/** Formats a page name.
 *
 * @param {string} page_name - The page name to format.
 * @returns {string} The formatted page name.
 * @private
 */
function create(page_name) {
    page_name = String(page_name).split(".")[0];
    return page_name.toLowerCase().split('-').map(word => word.charAt(0).toUpperCase() + word.substring(1)).join(' ')
}

module.exports = {
    getConfig,
    getPage,
    getNavigation,
    getFolderContents,
    config
}