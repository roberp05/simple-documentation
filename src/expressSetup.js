const express = require('express');
const apiRouter = require('./api/router.js');
const bodyparser = require('body-parser');
const path = require('path');

/** Sets up and configures an Express.js application.
 *
 * @param {Object} options - Configuration options for the setup.
 * @param {string} [options.markdownLibraryPath] - Path to the markdown library.
 * @returns {Object} An object containing the configured Express app and server control functions.
 * @example
 * const options = { markdownLibraryPath: '/path/to/markdown' };
 * const appInstance = setupExpressApp(options);
 * const server = appInstance.startServer(3000);
 * // ...
 * appInstance.stopServer(server);
 * @author Paul Roberts
 */
function init(options) {
    const app = express();
    apiRouter.config = options.config;
    app.locals.config = options.config;

    app.use(bodyparser.json());

    app.use('/api/config', (req, res) => {
        res.type = 'json';
        res.send(options.config);
    })
    // Mount the API router on the '/api' route
    app.use('/api', apiRouter);

    // Use options.markdownLibraryPath to access the specified path
    const markdownPath = options.markdownLibraryPath || '/docs';

    app.get('/', (req, res, next) => {
        res.sendFile(path.join(__dirname, 'index.html'))
    });
      
    app.use('/assets', express.static(path.join(__dirname, 'assets')));
    app.use('/images', express.static(path.join(__dirname, 'images')));
    app.use('/css', express.static(path.join(__dirname, 'css')));
    app.use('/js', express.static(path.join(__dirname, 'js')));

    return {
        app,
        /** Starts the Express server.
         *
         * @param {number} port - The port to listen on.
         * @returns {http.Server} The HTTP server instance.
         * @example
         * const server = appInstance.startServer(3000);
         * @author Paul Roberts
         */
        startServer() {
            return app.listen(options.port, () => {
                console.log(`Server is running on port ${options.port}`);
            });
        },
        /** Stops the Express server gracefully.
         *
         * @param {http.Server} server - The HTTP server instance to close.
         * @example
         * // Assuming 'server' is the result of 'startServer'
         * appInstance.stopServer(server);
         * @author Paul Roberts
         */
        stopServer(server) {
            server.close(() => {
                console.log('Server has been stopped');
            });
        }
    };
}

module.exports = init;
