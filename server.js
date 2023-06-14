import './configs/global.js';
import { fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import express from 'express';
import axios from 'axios';
import qrcode from 'qrcode';
import util from 'util';

import html from './middleware/html.js';

const apps = express();

apps.set('json spaces', 2);

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

apps.listen(PORT, () => console.log(`Express connected in port: ${PORT}`));