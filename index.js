const express = require('express');
const generate_contents = require('./scripts/generate_contents.js')
const simpeDocsServer = require('./src/expressSetup.js');
const fs = require('fs');

const save = (location, file_list) => {
    fs.existsSync(`${location}/contents.json`) ?? fs.unlinkSync(`${location}/contents.json`);
    fs.writeFileSync(`${location}/contents.json`, `[${file_list}]`);
}

let config = {};

module.exports = {
    createApp: function(options){
        config = options.config;
        let contents = generate_contents(options.documentsLibraryPath);
        save(options.documentsLibraryPath, contents);
        return simpeDocsServer(options);
    },
}