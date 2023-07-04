// External modules
import https from 'https';
import fs from 'fs';
import pino from 'pino';
import chalk from 'chalk';
import ffmpeg from 'fluent-ffmpeg';
import { fileTypeFromBuffer } from 'file-type';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const {
  default: makeWASocket,
  delay,
  WAProto,
  getDevice,
  jidDecode,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason,
  makeInMemoryStore,
  prepareWAMessageMedia,
  generateWAMessageFromContent
} = Baileys;

import logger from './middleware/console.js';
import serializeMessage from './middleware/serialize.js';
import functions from './library/functions.js';
import pluginsCommand from './commands/index.commands.js';
import loadedPlugins from './loadedCommands.js';

async function starting() {
  const { state, saveCreds } = await useMultiFileAuthState('session');
  const { version } = await fetchLatestBaileysVersion();
  const store = makeInMemoryStore({
    logger: pino().child({
      level: 'silent',
      stream: 'store'
    })
  });

  store.readFromFile('./database/baileys_store.json');
  setInterval(() => {
    store.writeToFile('./database/baileys_store.json');
  }, 10_000);

  const xcoders = makeWASocket({
    version: version,
    logger: pino({ level: 'silent' }),
    auth: state,
    linkPreviewImageThumbnailWidth: 300,
    generateHighQualityLinkPreview: true,
    printQRInTerminal: true,
    markOnlineOnConnect: false,
    options: {
      httpsAgent: new https.Agent({
        rejectUnauthorized: false
      })
    },
    patchMessageBeforeSending: (message) => {
      const requiresPatch = !!(message.buttonsMessage || message.templateMessage || message.listMessage);
      if (requiresPatch) message = { viewOnceMessage: { message: { messageContextInfo: { deviceListMetadataVersion: 2, deviceListMetadata: {} }, ...message } } };
      return message;
    },
    getMessage: async (key) => {
      if (!store) return { conversation: 'hello there!' };
      const msg = await store.loadMessage(key.remoteJid, key.id);
      return msg.message || undefined;
    }
  });

  xcoders.ev.on('connection.update', async ({ connection, lastDisconnect, receivedPendingNotifications }) => {
    if (connection === 'close') {
      const statusCode = lastDisconnect && lastDisconnect.error && lastDisconnect.error.output && lastDisconnect.error.output.statusCode;
      if (statusCode === DisconnectReason.loggedOut) {
        logger.warn('status server loggedOut, server stopped');
        starting();
      }
      if (statusCode === (DisconnectReason.connectionClosed || DisconnectReason.connectionLost)) {
        logger.warn('Connection Close or Lost, reconnecting server...');
        starting();
      }
      if (statusCode === DisconnectReason.connectionReplaced) {
        logger.error('Connection Replaced, server stopped.');
        process.exit();
      }
      if (statusCode === DisconnectReason.restartRequired) {
        logger.info('Restart Server required, restart Server.');
        starting();
      }
      if (statusCode === DisconnectReason.timedOut) {
        logger.warn('Time Out, starting server..');
        starting();
      }
    } else if (connection === 'open') {
      logger.success(chalk.green('[ xcoders ] Connected...'));
      global.qrcode = null;
    } else if (update.qr) {
      global.qrcode = update.qr;
    }
    if (receivedPendingNotifications) logger.info('Waiting new message...\n');
  });

  xcoders.ev.on('creds.update', saveCreds);
  store.bind(xcoders.ev);

  xcoders.ev.on('messages.upsert', async ({ type, messages }) => {
    try {
      if (!type == 'notify') return;
      if (!messages) return;
      const x = messages[0];
      const m = await serializeMessage(xcoders, x, functions);
      for (let message of messages) {
        if (message.key && message.key.remoteJid == 'status@broadcast') {
          if (message.message?.protocolMessage) return;
          logger.info(`Read status ${message.pushName}`);
          await xcoders.readMessages([message.key]);
        }
      }
      await pluginsCommand(xcoders, x, m);
    } catch (error) {
      throw error;
    }
  });

  xcoders.ev.on('close', () => starting());
  global.store = store;

  xcoders.sendFileFromUrl = async (jid, url, caption = '', quoted = '', options = {}) => {
    try {
      const mentionedJid = options.mentionedJid ? options.mentionedJid : [];
      const response = await fetch(url).then(response => response.arrayBuffer());
      const result = functions.convertToBuffer(response);
      const size = response.byteLength;
      const type = await fileTypeFromBuffer(result);
      const mimetype = !type ? options.mimetype : type.mime;
      const ext = !type ? mimetype.split('/')[1] : type.ext;
      if (mimetype == 'image/gif' || options.gif) {
        await xcoders.sendMessage(jid, { image: result, caption, mentionedJid, jpegThumbnail: icon, gifPlayback: true, gifAttribution: 1, ...options }, { quoted });
      } else if (/video/.test(mimetype)) {
        const type = size >= 50000000 ? 'document' : 'video';
        await xcoders.sendMessage(jid, { [type]: result, caption, mentionedJid, fileName: functions.getRandom(ext), mimetype: mimetype, jpegThumbnail: icon, ...options }, { quoted });
      } else if (/image/.test(mimetype)) {
        await xcoders.sendMessage(jid, { image: result, caption, mentionedJid, jpegThumbnail: icon, ...options }, { quoted });
      } else if (/audio/.test(mimetype)) {
        await xcoders.sendMessage(jid, { audio: result, caption, mentionedJid, jpegThumbnail: icon, ...options }, { quoted });
      } else if (!/video|image|audio/.test(mimetype)) {
        await xcoders.sendMessage(jid, { document: result, caption, mentionedJid, jpegThumbnail: icon, ...options }, { quoted });
      }
    } catch (error) {
      throw error;
    }
  };

  xcoders.sendAudioFromUrl = async (jid, url, quoted, options = {}) => {
    const mimetype = getDevice(quoted.id) == 'ios' ? 'audio/mpeg' : 'audio/mp4';
    const type = options.type !== 'audio' ? 'documentMessage' : 'audioMessage';
    const option = options.type !== 'audio' ? { externalAdReply: { title: options.title || options.fileName, body: options.body || `${global.packname} ${global.authorname}`, mediaType: 1, renderLargerThumbnail: true, showAdAttribution: true, thumbnail: options.thumbnail || global.icon, sourceUrl: options.source || global.host, mediaUrl: options.source || global.host } } : {};
    const prepareMessage = (buffer) => prepareWAMessageMedia({ [options.type || 'document']: buffer, mimetype, fileName: options.fileName || functions.getRandom('.mp3'), contextInfo: { ...option, forwardingScore: 9999999, isForwarded: true } }, { upload: xcoders.waUploadToServer });
    if (!options.ffmpeg) {
      const result = await functions.getBuffer(url);
      await delay(1000);
      const message = await prepareMessage(result);
      const media = generateWAMessageFromContent(jid, { [type]: message[type] }, { quoted });
      return xcoders.relayMessage(jid, media.message, { messageId: media.key.id });
    } else {
      const fileName = options.fileName || functions.getRandom('.mp3');
      const file_name = Date.now() + '.mp3';
      const path_files = `./temp/${file_name}`;
      const stream = fs.createWriteStream(path_files);
      ffmpeg(url)
        .audioBitrate(138)
        .audioChannels(2)
        .audioCodec('libmp3lame')
        .format('mp3')
        .outputOptions(['-metadata', `title=${fileName}`, '-metadata', 'artist=xcoders-teams'])
        .on('error', (error) => {
          throw new Error(error);
        }).on('end', async () => {
          logger.success('Successfully...');
          const buffer = fs.readFileSync(path_files);
          const message = await prepareMessage(buffer);
          const media = generateWAMessageFromContent(jid, { [type]: message[type] }, { quoted });
          fs.unlinkSync(path_files);
          return xcoders.relayMessage(jid, media.message, { messageId: media.key.id });
        }).pipe(stream, { end: true });
    }
  };

  xcoders.requestPaymentMenu = async (jid, caption, options = {}) => {
    const generateWA = await generateWAMessageFromContent(jid, { requestPaymentMessage: { currencyCodeIso4217: 'USD', amount1000: '9999999999', requestFrom: options.sender, noteMessage: { extendedTextMessage: { text: '\n' + caption + '\n\n' + watermark + '\n\n', contextInfo: { mentionedJid: options.sender ? [options.sender] : [] } } }, expiryTimestamp: '0', amount: { value: '125', offset: '100', currencyCode: 'USD' } } }, { quoted: options.quoted });
    return xcoders.relayMessage(jid, generateWA.message, { messageId: generateWA.key.id });
  };

  xcoders.sendGroupV4Invite = async (jid, participant, inviteCode, inviteExpiration, groupName, jpegThumbnail, caption, options = {}) => {
    const messageProto = await WAProto.Message.fromObject({
      groupInviteMessage: WAProto.GroupInviteMessage.fromObject({ inviteCode, inviteExpiration: inviteExpiration ? parseInt(inviteExpiration) : + new Date(new Date + (3 * 86400000)), groupJid: jid, groupName: groupName ? groupName : (await xcoders.groupMetadata(jid)).subject, jpegThumbnail: jpegThumbnail ? await functions.getBuffer(jpegThumbnail) : '', caption })
    });
    const generate = await generateWAMessageFromContent(participant, messageProto, ...options);
    return xcoders.relayMessage(participant, generate.message, { messageId: generate.key.id });
  };

  xcoders.decodeJid = (jid) => {
    if (!jid && !/:\d+@/gi.test(jid)) return jid;
    const decode = jidDecode(jid) || {};
    return decode.user && decode.server && decode.user + '@' + decode.server || jid;
  };

  xcoders.serializeMessages = async (forced) => {
    return serializeMessage(xcoders, forced);
  };
  return xcoders;
}

try {
  global.logger = logger;
  await loadedPlugins(functions);
  (await import('./server.js')).default;
  await starting();
} catch (error) {
  throw error;
}

const files = global.absoluteUrl(import.meta.url);
fs.watchFile(files, () => {
  fs.unwatchFile(files);
  console.log(chalk.redBright('Update index.js'));
  import(`${files}?update=${Date.now()}`);
});