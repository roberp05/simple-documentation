module.exports = {
    getNavigation: jest.fn(() => {
      // Mocked navigation data
      return Promise.resolve([
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
            "page_title": "Aws Cfn Bootstrap",
            "parent_folder": "Repositories",
            "folder_name": "Repositories",
            "path": "docs/repositories/aws-cfn-bootstrap.md",
            "type": "file",
            "extension": "md"
        },
        {
            "page_title": "Awscli Wormhole Authentication",
            "parent_folder": "Repositories",
            "folder_name": "Repositories",
            "path": "docs/repositories/awscli-wormhole-authentication.md",
            "type": "file",
            "extension": "md"
        },
        {
            "page_title": "Bbc Nginx",
            "parent_folder": "Repositories",
            "folder_name": "Repositories",
            "path": "docs/repositories/bbc-nginx.md",
            "type": "file",
            "extension": "md"
        },
        {
            "page_title": "Bbc Telegraf",
            "parent_folder": "Repositories",
            "folder_name": "Repositories",
            "path": "docs/repositories/bbc-telegraf.md",
            "type": "file",
            "extension": "md"
        },
        {
            "page_title": "Bbc Vector",
            "parent_folder": "Repositories",
            "folder_name": "Repositories",
            "path": "docs/repositories/bbc-vector.md",
            "type": "file",
            "extension": "md"
        },
        {
            "page_title": "Cd Aws Access",
            "parent_folder": "Repositories",
            "folder_name": "Repositories",
            "path": "docs/repositories/cd-aws-access.md",
            "type": "file",
            "extension": "md"
        },
        {
            "page_title": "Cd Core Infrastructure",
            "parent_folder": "Repositories",
            "folder_name": "Repositories",
            "path": "docs/repositories/cd-core-infrastructure.md",
            "type": "file",
            "extension": "md"
        },
        {
            "page_title": "Cd Jenkins",
            "parent_folder": "Repositories",
            "folder_name": "Repositories",
            "path": "docs/repositories/cd-jenkins.md",
            "type": "file",
            "extension": "md"
        },
        {
            "page_title": "Cd Loadtest",
            "parent_folder": "Repositories",
            "folder_name": "Repositories",
            "path": "docs/repositories/cd-loadtest.md",
            "type": "file",
            "extension": "md"
        }
    ]);
    }),
    // Define other core functions here if needed
  };
  