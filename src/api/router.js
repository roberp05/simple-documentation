const express = require('express');
const core = require('./core.js');
const router = require('express').Router();
const path = require('path');


router.use((req,res,next) => {
    next();
})

/** Route handler for the root endpoint.
 *
 * @route GET /
 * @group Miscellaneous
 * @returns {object} JSON object with basic information.
 * @example
 * GET /
 */
router.get('/', async (req, res) => {
    res.statusCode = 200;
    res.contentType = "application/json";
    res.send(JSON.parse(`{"name":"canary", "base_path":"{{url}}/", "endpoint": "/", "status":"OK"}`));
});

router.get('/docs/:file', async (req, res) => {
    let file = req.params.file;
    res.sendFile(path.join(__dirname, `/docs/${file}`));
});
router.use('/docs/css', express.static(path.join(__dirname, '/docs/css')));
router.use('/docs/js', express.static(path.join(__dirname, '/docs/js')));
router.use('/docs/img', express.static(path.join(__dirname, '/docs/img')));

/**
 * Route handler for retrieving configuration.
 *
 * @route GET /config
 * @group Configuration
 * @returns {object} Configuration object.
 */
router.get('/config', async (req, res) => {
    await core.getConfig().then((data) => {
        res.send(data);
    }).catch((error) => {
        res.status(error.status || 500).send('An error has occured');
    })
});

/**
 * Route handler for retrieving the content of a specific page.
 *
 * @route GET /page
 * @group Pages
 * @param {string} path.query.required - The path to the requested page.
 * @returns {string} The content of the requested page.
 */
router.get('/page', async (req, res) => {
    let page = req.query.path;
    await core.getPage(page).then((data) => {
        res.send(data);
    }).catch((error) => {
        res.status(error.status || 500).end();
    })
});

/**
 * Route handler for retrieving navigation information.
 *
 * @route GET /navigation
 * @group Navigation
 * @returns {string} JSON array containing navigation items.
 */
router.get('/navigation', async (req, res) => {
    await core.getNavigation().then(data => {
        res.send(data);
    }).catch((error) => {
        res.status(error.status || 500).send(error).end()
    })
});

/**
 * Route handler for retrieving the contents of a folder.
 *
 * @route GET /:folder/contents
 * @group Folders
 * @param {string} folder.params.required - The name of the folder.
 * @returns {string} JSON array containing folder contents.
 */
router.get('/:folder/contents', async (req, res) => {
    let folder = decodeURIComponent(req.params.folder).toLowerCase().replace(" ", "-");
    await core.getFolderContents(folder).then((data) => {
        res.send(data);
    }).catch((error) => {
        res.status(error.status || 500).send(error).end()
    });
});

module.exports = router;
