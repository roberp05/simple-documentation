const sass = require('node-sass');
const path = require('path');
const fs = require('fs');

// Define input and output paths
const inputPath = path.join(__dirname, 'src/scss', 'style.scss'); // Change this to your Sass file
const outputPath = path.join(__dirname, 'src/css', 'style.css'); // Change this to your desired output path

// Compile Sass to CSS
sass.render(
  {
    file: inputPath,
  },
  (error, result) => {
    if (!error) {
      fs.writeFileSync(outputPath, result.css);
      console.log('Sass compiled successfully!');
    } else {
      console.error('Error compiling Sass:', error);
    }
  }
);