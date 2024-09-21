const { exec } = require('child_process');

async function processImage(imageData) {
    return new Promise((resolve, reject) => {
        exec('python3 python-scripts/imageGen.py', (err, stdout, stderr) => {
            if (err) {
                console.error(err);
                return reject('Error processing image');
            }
            resolve(stdout || 'Image processed successfully!');
        });
    });
}

module.exports = { processImage };
