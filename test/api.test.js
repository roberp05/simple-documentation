const request = require('supertest');
const express = require('express');
const apiRouter = require('../src/api/router.js'); // Update the path accordingly

const mockNavigationItems = [
    {
        "page_title": "Repositories",
        "parent_folder": "Home",
        "folder_name": "Repositories",
        "path": "docs/repositories",
        "type": "folder"
    },
    {
        "page_title": "Amazon Efs Utils",
        "parent_folder": "Repositories",
        "folder_name": "Repositories",
        "path": "docs/repositories/amazon-efs-utils.md",
        "type": "file",
        "extension": "md"
    },
    {
        "page_title": "Slack",
        "parent_folder": "Shared Services",
        "folder_name": "Shared Services",
        "path": "docs/the-team/jml-handbook/shared-services/slack.md",
        "type": "file",
        "extension": "md"
    },
    {
        "page_title": "Team Values",
        "parent_folder": "Jml Handbook",
        "folder_name": "Jml Handbook",
        "path": "docs/the-team/jml-handbook/team-values.md",
        "type": "file",
        "extension": "md"
    },
    {
        "page_title": "Ways Of Working",
        "parent_folder": "Jml Handbook",
        "folder_name": "Ways Of Working",
        "path": "docs/the-team/jml-handbook/ways-of-working",
        "type": "folder"
    }
];

const mockConfigData = {
    "teamname": "Mock Team",
    "teamname_short": "MT",
    "area": "Mocked Area",
    "area_short": "MA",
    "org":"Mocked Organisation",
    "org_short":"MO"
};

// Mock the core.js module
jest.mock('../src/api/core.js', () => ({
  getNavigation: jest.fn(() => Promise.resolve(mockNavigationItems)),
  getConfig: jest.fn(() => Promise.resolve(mockConfigData)),
  getPage: jest.fn((path) => {
    // Mocked behavior based on the path
    if (path === 'mocked-path') {
      return Promise.resolve('Mocked page content');
    } else {
      return Promise.reject(new Error('Page not found'));
    }
  }),
}));

const app = express();
app.use(express.json());
app.use('/api', apiRouter);

describe('GET /navigation', () => {
  it('should return navigation items', async () => {
    const response = await request(app).get('/api/navigation');
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.arrayContaining(mockNavigationItems));
  });

  it('should handle error from core function', async () => {
    // Simulate an error in the mocked function
    require('../src/api/core.js').getNavigation.mockRejectedValue(new Error('Mocked error'));

    const response = await request(app).get('/api/navigation');
    
    expect(response.status).toBe(500);
    expect(response.text).toBe('{}');
  });
});

describe('GET /config', () => {
    it('should return configuration object', async () => {
      const response = await request(app).get('/api/config');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(expect.objectContaining(mockConfigData));
    });
  
    it('should handle error from core function', async () => {
      require('../src/api/core.js').getConfig.mockRejectedValue(new Error('Mocked error'));
  
      const response = await request(app).get('/api/config');
      
      expect(response.status).toBe(500);
      expect(response.text).toBe('An error has occured');
    });
  });
  
  describe('GET /page', () => {
    it('should return page content for a valid path', async () => {
      const response = await request(app).get('/api/page').query({ path: 'mocked-path' });
      
      expect(response.status).toBe(200);
      expect(response.text).toBe('Mocked page content');
    });
  
    it('should handle error for an invalid path', async () => {
      const response = await request(app).get('/api/page').query({ path: 'invalid-path' });
      
      expect(response.status).toBe(500);
      expect(response.text).toBe('');
    });
  });