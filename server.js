import './configs/global.js';
import { fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import express from 'express';
import http from 'http';
import axios from 'axios';
import qrcode from 'qrcode';
import util from 'util';

const apps = express();
const server = http.createServer(apps);

import html from './middleware/html.js';

apps.set('json spaces', 2);
apps.use(express.json());

apps.get('*', async (_, res) => {
  try {
    if (global.qrcode) {
      const { version, isLatest } = await fetchLatestBaileysVersion();
      const codeQR = await qrcode.toDataURL(global.qrcode, { scale: 10 });
      const generateHTML = html(codeQR, `using WA v${version.join('.')}, isLatest: ${isLatest}`);
      res.send(generateHTML);
    } else {
      const { data } = await axios.get('http://ip-api.com/json');
      res.json({
        status: true,
        creator: 'xcoders teams',
        server: data
      });
    }
  } catch (error) {
    res.send(util.format(error));
  }
});

server.listen(3000, () => console.log(`Express connected in port: ${PORT}`));