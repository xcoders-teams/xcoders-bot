import '../configs/global.js';
import crypto from 'crypto';
const {
  generateWAMessageFromContent,
  generateForwardMessageContent,
  jidNormalizedUser,
  extractMessageContent,
  areJidsSameUser,
  getContentType,
  isJidGroup,
  proto
} = Baileys;

const serialize = async (conn, m, functions) => {
  const copyNForward = async (jid, message, forceForward, options = {}) => {
    if (options.readViewOnce) {
      message.message = message.message && message.message.ephemeralMessage && message.message.ephemeralMessage.message ? message.message.ephemeralMessage.message : (message.message || undefined);
      const vtype = Object.keys(message.message.viewOnceMessage.message)[0];
      delete message.message?.ignore ? message.message.ignore : message.message;
      delete message.message.viewOnceMessage.message[vtype].viewOnce;
      message.message = { ...message.message.viewOnceMessage.message };
    }
    const mtype = getContentType(message.message);
    const content = generateForwardMessageContent(message, forceForward);
    const ctype = getContentType(content);
    let context = {};
    if (mtype !== 'conversation') context = message.message[mtype]?.contextInfo;
    const messageOptions = {
      ...content[ctype],
      ...options,
      ...(options.contextInfo && {
        contextInfo: {
          ...content[ctype].contextInfo,
          ...options.contextInfo,
        },
      }),
    };
    messageOptions.contextInfo = {
      ...context,
      ...messageOptions.contextInfo,
    };
    const waMessage = generateWAMessageFromContent(jid, content, messageOptions);
    waMessage.key.id = `XCODERS_BOT_${crypto.randomBytes(13).toString('hex').toUpperCase()}`;
    await conn.relayMessage(jid, waMessage.message, { messageId: waMessage.key.id });
    return waMessage;
  };
  const cMod = async (jid, copy, text = '', sender = conn.user.id, options = {}) => {
    let mtype = getContentType(copy.message);
    let isEphemeral = mtype === 'ephemeralMessage';
    if (isEphemeral) {
      mtype = Object.keys(copy.message.ephemeralMessage.message)[0];
      copy.message = copy.message.ephemeralMessage.message[mtype];
    }
    let content = copy.message;
    if (typeof content === 'string') {
      copy.message = text || content;
    } else if (text || content.caption) {
      content.caption = text || content.caption;
    } else if (content.text) {
      content.text = text || content.text;
    }
    if (typeof content !== 'string') {
      copy.message = { ...content, ...options };
    }
    if (copy.key.participant) {
      sender = sender || copy.key.participant;
    } else if (copy.key.remoteJid.includes('@s.whatsapp.net')) {
      sender = sender || copy.key.remoteJid;
    } else if (copy.key.remoteJid.includes('@broadcast')) {
      sender = sender || copy.key.remoteJid;
    }
    copy.key.remoteJid = jid;
    copy.key.fromMe = areJidsSameUser(sender, (conn.user && conn.user.id));
    return proto.WebMessageInfo.fromObject(copy);
  };
  if (!m) return m;
  if (m.key) {
    m.id = m.key.id;
    m.isBaileys = m.id ? m.id.startsWith('BAE5') : false;
    m.chat = m.key.remoteJid;
    m.fromMe = m.key.fromMe;
    m.isGroups = isJidGroup(m.chat) || m.chat.endsWith('@g.us');
    m.sender = m.fromMe ? jidNormalizedUser(conn.user.id) : (m.key.participant || m.chat);
  }
  m.message = extractMessageContent(m.message);
  if (m.message) {
    m.mtype = getContentType(m.message) || Object.keys(m.message)[0];
    m.body = '';
    if (m.mtype === 'conversation') m.body = m.message.conversation;
    if (m.mtype === 'imageMessage') m.body = m.message.imageMessage.caption;
    if (m.mtype === 'videoMessage') m.body = m.message.videoMessage.caption;
    if (m.mtype === 'extendedTextMessage') m.body = m.message.extendedTextMessage.text;
    if (m.mtype === 'buttonsResponseMessage') m.body = m.message.buttonsResponseMessage.selectedButtonId;
    if (m.mtype === 'listResponseMessage') m.body = m.message.listResponseMessage.singleSelectReply.selectedRowId;
    if (m.mtype === 'templateButtonReplyMessage') m.body = m.message.templateButtonReplyMessage.selectedId;
    if (m.mtype === 'messageContextInfo') m.body = (m.message.listResponseMessage.singleSelectReply.selectedRowId || m.message.buttonsResponseMessage.selectedButtonId || m.text);
    m.coders = m.message[m.mtype];
    if (m.mtype === 'ephemeralMessage') {
      await serialize(conn, m.coders, functions);
      m.mtype = m.coders.mtype;
      m.coders = m.coders.coders;
    }
    let quoted = m.quoted = m.coders.contextInfo ? m.coders.contextInfo.quotedMessage : null;
    m.mentionedJid = m.coders.contextInfo?.mentionedJid || [];
    if (m.quoted) {
      const type = getContentType(m.quoted) || Object.keys(m.quoted)[0];
      m.quoted = m.quoted[type];
      if (/productMessage/.test(type)) m.quoted = m.quoted[Object.keys(m.quoted)[0]];
      if (typeof m.quoted === 'string') m.quoted = { text: m.quoted };
      m.quoted.id = m.coders.contextInfo.stanzaId;
      m.quoted.mtype = getContentType(m.quoted.message) || getContentType(m.coders.contextInfo.quotedMessage) || null;
      m.quoted.chat = m.coders.contextInfo.remoteJid || m.chat;
      m.quoted.isBaileys = m.quoted.id ? m.quoted.id.startsWith('BAE5') : false;
      m.quoted.sender = jidNormalizedUser(m.coders.contextInfo.participant);
      m.quoted.fromMe = areJidsSameUser(m.quoted.sender, (conn.user && conn.user.id));
      m.quoted.text = m.quoted.text || m.quoted.caption || '';
      m.quoted.mentionedJid = m.coders.contextInfo ? m.coders.contextInfo.mentionedJid : [];
      m.getQuotedObj = m.getQuotedMessage = async () => {
        if (!m.quoted.id) return false;
        const quotedMsg = await store.loadMessage(m.chat, m.quoted.id);
        return serialize(conn, quotedMsg, functions);
      };
      let vM = m.quoted.fakeObj = proto.WebMessageInfo.fromObject({
        key: {
          remoteJid: m.quoted.chat,
          fromMe: m.quoted.fromMe,
          id: m.quoted.id,
          participant: m.quoted.participant
        },
        message: quoted, ...(m.isGroups ? { participant: m.quoted.sender } : {})
      });
      m.quoted.delete = () => conn.sendMessage(m.quoted.chat, { delete: vM.key });
      m.quoted.copyNForward = (jid, forceForward = false, options = {}) => copyNForward(jid, vM, forceForward, options);
      m.quoted.cMod = (jid, text = '', sender = m.quoted.sender, options = {}) => cMod(jid, vM, text, sender, options);
      m.quoted.download = () => functions.downloadContentMediaMessage(m.quoted);
    }
  }
  if (m.coders) {
    m.download = () => functions.downloadContentMediaMessage(m.coders);
    m.text = (m.mtype == 'listResponseMessage' ? m.coders.singleSelectReply.selectedRowId : '') || m.coders.text || m.coders.caption || m.coders || '';
  }
  m.reply = (text, chatId, options) => conn.sendMessage(chatId ? chatId : m.chat, { text: text }, { quoted: m, detectLinks: false, thumbnail: global.thumbnail, ...options });
  m.copy = () => serialize(conn, proto.WebMessageInfo.fromObject(proto.WebMessageInfo.toObject(m)), functions);
  m.copyNForward = (jid = m.chat, message, forceForward = false, options = {}) => copyNForward(jid, message, forceForward, options);
  m.cMod = (jid, text = '', sender = m.sender, options = {}) => cMod(jid, m, text, sender, options);
  return m;
};

export default serialize;