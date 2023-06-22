// External modules
import Baileys from '@whiskeysockets/baileys';
import fs from 'fs';
import pino from 'pino';
import chalk from 'chalk';
import ffmpeg from 'fluent-ffmpeg';
import { fileURLToPath } from 'url';

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

try {
  global.logger = logger;
  await loadedPlugins(functions);
  if (global.yargs.server) (await import('./server.js'));
  await starting();
} catch (error) {
  throw error;
}

async function starting() {
  const { state, saveCreds } = await useMultiFileAuthState('session');
  const { version } = await fetchLatestBaileysVersion();
  const store = makeInMemoryStore({
    logger: pino().child({
      level: 'silent',
      stream: 'store'
    })
  });

  const xcoders = makeWASocket({
    version: version,
    logger: pino({ level: 'silent' }),
    auth: state,
    generateHighQualityLinkPreview: true,
    printQRInTerminal: true,
    markOnlineOnConnect: false,
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

  xcoders.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, receivedPendingNotifications } = update;
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
      await pluginsCommand(xcoders, x, m, functions);
    } catch (error) {
      throw error;
    }
  });

  xcoders.ev.on('close', () => starting());
  global.store = store;

  xcoders.sendFileFromUrl = async (jid, url, caption = '', quoted = '', options = {}) => {
    try {
      const mentionedJid = options.mentionedJid ? options.mentionedJid : [];
      const { result, mimetype, size } = await functions.getBuffer(url, { optional: true });
      const MimeType = options.mimetype || mimetype;
      if (MimeType == 'image/gif' || options.gif) {
        await xcoders.sendMessage(jid, { image: result, caption, mentionedJid, jpegThumbnail: icon, gifPlayback: true, gifAttribution: 1, ...options }, { quoted, upload: xcoders.waUploadToServer, mediaUploadTimeoutMs: 600000 });
      } else if (/video/.test(MimeType)) {
        const type = size > 100000000 ? 'document' : 'video';
        await xcoders.sendMessage(jid, { [type]: result, caption, mentionedJid, jpegThumbnail: icon, ...options }, { quoted, upload: xcoders.waUploadToServer, mediaUploadTimeoutMs: 600000 });
      } else if (/image/.test(MimeType)) {
        await xcoders.sendMessage(jid, { image: result, caption, mentionedJid, jpegThumbnail: icon, ...options }, { quoted, upload: xcoders.waUploadToServer, mediaUploadTimeoutMs: 600000 });
      } else if (/audio/.test(MimeType)) {
        await xcoders.sendMessage(jid, { audio: result, caption, mentionedJid, jpegThumbnail: icon, ...options }, { quoted, upload: xcoders.waUploadToServer, mediaUploadTimeoutMs: 600000 });
      } else if (!/video|image|audio/.test(MimeType)) {
        await xcoders.sendMessage(jid, { document: result, caption, mentionedJid, jpegThumbnail: icon, ...options }, { quoted, upload: xcoders.waUploadToServer, mediaUploadTimeoutMs: 600000 });
      }
    } catch (error) {
      throw error;
    }
  };

  xcoders.sendAudioFromUrl = async (jid, url, quoted, options = {}) => {
    const mimetype = getDevice(quoted.id) == 'ios' ? 'audio/mpeg' : 'audio/mp4';
    const type = options.type !== 'audio' ? 'documentMessage' : 'audioMessage';
    const option = options.type !== 'audio' ? { externalAdReply: { title: options.title || options.fileName, body: options.body || `${global.packname} ${global.authorname}`, mediaType: 1, renderLargerThumbnail: true, showAdAttribution: true, thumbnail: options.thumbnail || global.icon, sourceUrl: options.source || global.host, mediaUrl: options.source || global.host } } : {};
    const prepareMessage = (buffer) => prepareWAMessageMedia({ [options.type || 'document']: buffer, mimetype, fileName: options.fileName || functions.getRandom('.mp3'), contextInfo: { ...option, forwardingScore: 999, isForwarded: true } }, { upload: xcoders.waUploadToServer, });
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
      await ffmpeg(url)
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

const files = fileURLToPath(import.meta.url);
fs.watchFile(files, () => {
  fs.unwatchFile(files);
  console.log(chalk.redBright('Update index.js'));
  import(`${files}?update=${Date.now()}`);
});