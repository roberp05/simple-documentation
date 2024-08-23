# Simple Docs (simple-docs)

Simple is as simple does, and this is just simple.

### Backup
There is a backup of main as of 22/09/2023 in the [`main-backup-22/09`](https://github.com/bbc/simple-docs/tree/main-backup-22/09) branch (if you wanna get rid of Tom's *amazing* changes).

### Abstract
Simple-Docs is an easy way to maintain your markdown documentation repository whilst also having the ability to make it available to everyone, anywhere or anyone everywhere without needing to convert everytime you need to make updates.

### Structure
root
- docs
  - All your
  - documentation
  - folders
    - and_files.md
  - for_all
    - your_products.md
    - your_projects.md
    - your_team_working.md
  - index.js

### Installation
Create your barebones nodejs project at the base of the repository.  Then you can simply install `simple-docs` directly from github, 

```bash
npm install git@github.com:bbc/simple-docs.git
```

and create a straight forward index.js with the following code in it.

```javascript
const simple_docs = require('simple-docs');
const config = {
    documentsLibraryPath: 'docs',
    port: {YOUR_DESIRED_HTTP_PORT},
    config: {
        teamname: "{TEAM_NAME}",
        teamname_short: "{TEAM_NAME_SHORT_VERSION}",
        area: "{AREA_OR_PRODUCT_GROUP_TEAM_RESIDES_IN}",
        area_short: "{AREA_OR_PRODUCT_GROUP_TEAM_RESIDES_IN_SHORT_VERSION}",
        org: "{ORGANISATION}",
        org_short: "{ORGANISATION_SHORT_VERSION}"
    },
};
  
const { app, startServer, stopServer } = simple_docs.createApp(config);

const simple_docs_server = startServer();
```

Done