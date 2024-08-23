const express = require('express');
const request = require('supertest');
const init = require('../src/expressSetup.js'); // Update the path accordingly


jest.mock('express', () => ({
    Router: jest.fn(() => ({
        use: jest.fn(),
    })),
}));

const options = {
    config: { /* Your mocked configuration data */ },
    port: 3000,
    markdownLibraryPath: '/path/to/markdown',
};

describe('init', () => {
    let appInstance;

    beforeEach(() => {
        appInstance = init(config);
    });

    it('should start the server', async () => {
        await appInstance.startServer().then(async (server) => {
            expect(server.listening).toBe(true);
            // You can add more assertions here
        }).finally(() => {
            server.close(); // Close the server after the test
        });
    });

    it('should stop the server', async () => {
        const server = appInstance.startServer();
        await appInstance.stopServer(server).then(async (data) => {
            console.log(data)
        })
    });
});
