'use strict';

import _ from 'lodash';
import phone from 'awesome-phonenumber';
import util from 'util';

export default {
  views: ['owners'], // views for menu message
  command: /^(pemilik|owner(s|))$/i, // command another.
  description: 'Utility for display owner',
  query: false,
  usage: '',
  execute: async ({ xcoders, x, m, owners }) => {
    try {
      const res = _.find(phone('+' + owners[0].replace(/[^0-9]+/, '')));
      let contacts = [];
      for (let i = 0; i < 51; i++) {
        contacts.push({
          displayName: 'Fxc7',
          vcard: 'BEGIN:VCARD\n' +
            'VERSION:3.0\n' +
            'FN:FarhanXCode7\n' +
            'ORG:xcoders team\'s\n' +
            'TEL;type=CELL;type=VOICE;waid=' + res.number.input.split('+')[1] + ':' + res.number.international + '\n' +
            'X-ABLabel:XCODERS TEAM\'S\n' +
            'URL;TYPE=Website:https://api-xcoders.site\n' +
            'URL;TYPE=Github:https://github.com/Fxc7\n' +
            'URL;TYPE=Github:https://github.com/FarhannnnX\n' +
            'EMAIL;TYPE=Email:farhanxcode7@gmail.com\n' +
            'ADR;TYPE=Location:;;yo ndatau kok tanya saya;;;;\n' +
            'END:VCARD'
        });
      }
      return xcoders.sendMessage(m.chat, { contacts: { displayName: 'WhatsApp Owners', contacts: [...contacts] }, contextInfo: { isForwarded: true, forwardingScore: 9999999 } }, { quoted: x });
    } catch (error) {
      return errorMessage(m.chat, error);
    }
  }
};