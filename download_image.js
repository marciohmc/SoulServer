import fs from 'fs';
import https from 'https';

const url = 'https://raw.githubusercontent.com/marciohmc/SoulServer/refs/heads/main/img/soulserver-bg.jpg';
const path = 'src/assets/soulserver-bg.jpg';

const file = fs.createWriteStream(path);
https.get(url, (response) => {
  response.pipe(file);
  file.on('finish', () => {
    file.close();
    console.log('Download completed');
  });
}).on('error', (err) => {
  fs.unlink(path, () => {});
  console.error('Error downloading file:', err.message);
});
