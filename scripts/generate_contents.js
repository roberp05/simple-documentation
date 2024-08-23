const fs = require('fs');
const path = require('path');

const getFileList = (dirName) => {
    let files = [];
    let directory_name = '';
    let parent_name = '';
    
    const items = fs.readdirSync(dirName, { withFileTypes: true });

    for (const item of items) {
        if(!item.name.includes('contents.json')) {
            var structure = dirName.replace('../', '').split("/");
            
            if (item.isDirectory()) {
                if(String(item.name).charAt(0) === '.') continue;

                directory_name = structure[structure.length-1];
                (structure.length < 2) ? parent_name = 'Home' : parent_name = create(structure[structure.length - 1])
                files.push(`{ "page_title":"${create(item.name)}", "parent_folder":"${parent_name}", "folder_name": "${create(item.name)}", "path":"${dirName.replace('../', '')}/${item.name}", "type": "folder" }`);
                files = [...files, ...getFileList(`${dirName}/${item.name}`)];
            } else {
                directory_name = structure[structure.length -1];
                (structure.length <= 3) ? parent_name = 'Home' : parent_name = structure[structure.length - 1]
                let filePath = `${dirName.replace('../', '')}/${item.name}`;
                files.push(`{ "page_title":"${create(item.name)}", "parent_folder":"${create(directory_name)}", "folder_name": "${create(directory_name)}", "path":"${filePath}", "type": "file", "extension":"${path.extname(filePath).slice(1)}" }`);
            }
        }
    }

    return files;
};

const create = (page_name) => {
    page_name = String(page_name).split(".")[0];
    return page_name.toLowerCase().split('-').map(word => word.charAt(0).toUpperCase() + word.substring(1)).join(' ')
}

module.exports = getFileList;