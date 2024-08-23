let page_configuration;
let page_navigation;
let page_contents;

Array.prototype.insert = function (index, ...items) {
    this.splice(index, 0, ...items);
};

if (page_configuration === undefined) {
    fetch(`/api/config`).then(async (response) => {
        console.log(`${new Date().toDateString()}: Getting Page Configuration.`)
        let pc = await response.text();
        page_configuration = JSON.parse(pc);
    }).catch(error => {
        console.log(`page_configuration error: ${error}`);
    })
}
if (page_navigation === undefined) {
    fetch(`/api/navigation`).then(async (response) => {
        var left = '';
        let pn = await response.text();
        page_navigation = JSON.parse(pn);

        page_navigation.forEach(async element => {
            left += `<li><a href="#~docs/${element.toLowerCase().replace(/ /g, "-")}/index.md" ><span class="fa fa-${element.toLowerCase()} mr-3"></span> ${element} </a></li>`;
        })
        document.getElementById('leftNav').innerHTML = left;


    }).catch(error => {
        console.log(error)
    })
}

window.addEventListener('DOMContentLoaded', event => {
    var url = window.location.href.split('#');
    var navigation = '';
    if (url.length > 1) {
        navigation = encodeURIComponent(url[1]);
        if (url[1].charAt(0) === "!") get_folder_contents(navigation.slice(1))
        if (url[1].charAt(0) === "~") change_page(navigation.slice(1))
    } else {
        change_page('README.md');
    }
    breadcrumb(url[1]);
    bootsrap_page();

});

const checkForChildren = async (folder) => {

    fetch(`/api/${folder}/contents`).then(async (response) => {
        var contents = await response.json();
        let children = '';
        contents.forEach(content => {
            if (content.type === 'folder') {
                children += `<li><a href="#!${content.path}">${content.page_title}</a> </li>`
            }
        })
        return `<ul>${children}</ul>`;

    })

};

const bootsrap_page = () => {
    var res = page_configuration;
    document.title = `${res.teamname || 'simple-docs'} - part of ${res.area || 'no config set'}`;
    document.getElementById('title').innerHTML = `${res.teamname || 'simple-docs'} <span>${res.area || 'documentation'}</span>`
    document.getElementById('footer').innerHTML = `<p>&copy;${new Date().getFullYear()} ${res.org_short || 's-d'} ${res.teamname || 'simple'} - ${res.area_short || 'docs'} </p>`
}
/**
 * The breadcrumb function takes a path and returns the last part of it.
 * 
 *
 * @param path Create the breadcrumb
 *
 * @author Paul Roberts
 */
const breadcrumb = (path) => {
    let crumbString = '<a href="#">HOME</a>';
    if (path !== undefined) {
        let breadcrumbParts = decodeURIComponent(path).slice(1).replace('docs/', '').split("/");
        let accumulation = [];
        let type = '';
        breadcrumbParts.forEach(part => {
            if (part === 'undefined') return;
            type = (part.split('.').length === 1) ? '!' : '~';
            accumulation.push(part);
            if (accumulation.length === breadcrumbParts.length) {
                crumbString += ` > <a href="#${type}docs/${accumulation.join('/')}">${part}</a>`
            } else {
                crumbString += ` > <a href="#${type}docs/${accumulation.join('/')}">${create(part)}</a>`
            }
        })
    }
    document.getElementById('breadcrumb').innerHTML = crumbString;
}

window.addEventListener('hashchange', (event) => {
    var url = window.location.href.split('#');
    var navigation = '';
    if (url.length > 1) {
        navigation = encodeURIComponent(url[1]);
        if (url[1].charAt(0) === "!") get_folder_contents(navigation.slice(1))
        if (url[1].charAt(0) === "~") change_page(navigation.slice(1))
    } else {
        change_page('README.md');
    }
    breadcrumb(url[1]);

});

/**
 * The change_page function is used to change the page content of the website.
 * 
 *
 * @param path Specify which page to load
 *
 * @return The contents of the page
 *
 * @author Paul Roberts
 */
async function change_page(path) {
    let pathParts = decodeURIComponent(path).split("/");
    console.log(path)
    fetch(`/api/page?path=${path}`).then(async (response) => {
        var res = await response.text();
        document.getElementById("pagecontent").innerHTML = res;
    }).then(async () => {
        await postProcessLinking(path);
        await draw_mermaid();
        await right_navigation(pathParts[pathParts.length - 2]);

    })
};



/**
 * The draw_mermaid function is used to draw the mermaid diagrams.
 * 
 *
 *
 * @return A promise
 *
 * @author Paul Roberts
 */
async function draw_mermaid() {
    const input = document.querySelector(".mermaid");
    if (input === null) return;
    if (Array.isArray(input)) {
        input.forEach(async element => {
            let output = element;

            const { svg } = await mermaid.render("preparedScheme", element.innerText);
            output.innerHTML = svg;
        });

    } else {
        let output = input;
        const { svg } = await mermaid.render("preparedScheme", input.innerText);
        output.innerHTML = svg;
    }

}

/**
 * The postProcessLinking function is used to update the links in a page after it has been loaded.
 * This function will be called by the loadPage function, and should not need to be called manually.
 * 
 * The postProcessLinking function takes one parameter: linkPath, which is a string representing the path of the page that was just loaded. 
 * It then finds all &lt;a&gt; tags on that page and updates their href attributes so they point to other pages within this application instead of external websites or files. 
 
 *
 * @param linkPath Determine the current page
 *
 * @return A promise
 *
 * @author Paul Roberts
 */
async function postProcessLinking(linkPath) {
    linkPath = decodeURIComponent(linkPath);

    const pathParts = linkPath.split('/');
    const links = document.getElementById("pagecontent").querySelectorAll('a');

    if (links) {
        Array.from(links).forEach(link => {
            let href = String(link.getAttribute('href'));
            if (href !== "null" && href.charAt(0) !== "#" && !href.startsWith('http')) {
                let hrefParts = href.split('/');
                let newParts = [...pathParts];

                for (let i = 0; i < pathParts.length; i++) {
                    if (hrefParts[i] === "." || (hrefParts.length === 1 && hrefParts[0].split('/').length === 2)) {
                        if(hrefParts.length > 1) {
                            newParts.splice(newParts.length-1, 1);
                            hrefParts.forEach((part) => {
                                console.log(part)
                                if(!part.startsWith('.')){
                                    console.log(`pushing: ${part}`)
                                    newParts.push(part);
                                };
                            });
                        } else {
                            newParts[newParts.length - 1] = hrefParts[hrefParts.length - 1]; 
                        }
                        break; 
                    }
                    if (hrefParts[i] === "..") { 
                        hrefParts.splice(i, 1);
                        i--; 
                        continue;
                    }
                    if (pathParts[i] === hrefParts[i]) { 
                        continue; 
                    } else {  
                        newParts[i] = hrefParts[i]; 
                    }
                }

                // if (newParts.length > hrefParts.length) {
                //     newParts.splice(hrefParts.length, newParts.length - hrefParts.length);
                // }

                link.setAttribute('href', `#~${newParts.join('/')}`);
            }
        });
    }
}

/**
 * The get_folder_contents function fetches the contents of a folder from the server and displays them on the page.
 * 
 *
 * @param folder_name Specify the folder to get the contents of
 *
 * @return A list of objects
 *
 * @author Paul Roberts
 */
async function get_folder_contents(folder_name) {
    let folderPathParts = decodeURIComponent(folder_name).split('/')
    folder = create(folderPathParts[folderPathParts.length - 1])
    fetch(`/api/${folder_name}/contents`).then(async (response) => {
        var res = await response.json();
        var html = '';
        res = res.sort((a, b) => { if (a.type > b.type) return -1; });
        res.forEach(element => {
            if (element.parent_folder === folder) {
                html += `<div class="card bg-light mb-3"><div class="card-header">${element.page_title}</div><div class="card-body"> <a href="#${(element.type === 'folder') ? `~${element.path}/index.md` : `~${element.path}`}" class="card-link">Read More</a><footer class="footer">${element.type} (${element.extension})</footer></div> </div>`
            }
        })
        let route = decodeURIComponent(folder_name).split(`/`);
        document.getElementById("pagecontent").innerHTML = `<div class="row"><h1>${route[route.length - 1].toLowerCase().split('-').map(word => word.charAt(0).toUpperCase() + word.substring(1)).join(' ')}</h1></div><div class="row">${html}</div>`;

    })
}

async function folder_contents(folder_name) {
    return new Promise(async (resolve, reject) => {
        fetch(`/api/${folder_name}/contents`).then(async (response) => {
            let resp = await response.json();
            resolve(resp);
        }).catch((error) => { reject(error) })

    })
}

// Create an observer instance
const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
        var newNodes = mutation.addedNodes; // DOM NodeList
        if (newNodes !== null) { // If there are new nodes added
            newNodes.forEach(node => {
                if (node.nodeName.toLowerCase() === "table") {
                    node.classList.add("class", "table");
                }
                if (arrHes.includes(node.nodeName.toLowerCase())) {
                    node.innerHTML = `<a id="${String(node.innerText).toLowerCase().replace(/ /g, "-").replace(/[^\w]+/g, '-')}">${node.innerText}</a>`
                }
            });
        }
    });
});

const arrHes = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']

// Configuration of the observer:
const observerConfig = {
    attributes: true,
    childList: true,
    characterData: true
};

// Pass in the target node, as well as the observer options
observer.observe(document.getElementById("pagecontent"), observerConfig);

/**
 * The create function takes a string and returns the same string with the first letter of each word capitalized.
 * 
 *
 * @param page_name Create the title of the page
 *
 * @return The page name with the first letter of each word capitalized and separated by spaces
 *
 * @author Paul Roberts
 */
function create(page_name) {
    page_name = String(page_name).split(".")[0];
    return page_name.toLowerCase().split('-').map(word => word.charAt(0).toUpperCase() + word.substring(1)).join(' ')
}

async function right_navigation(folder_name) {
    await folder_contents(folder_name).then(async (data) => {
        let right_nav_string = '';
        Array.from(data).forEach(item => {
            right_nav_string += `<div><a href="#${(item.type === 'file') ? '~' : '!'}${item.path}">${item.page_title}</a></div>`
        })
        document.getElementById('folder_contents').innerHTML = `<h5>${create(folder_name)}</h5><div>${right_nav_string}</div>`
    });

}

