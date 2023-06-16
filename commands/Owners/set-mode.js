'use strict';

export default {
  views: ['change'], // views for menu message
  command: /^change/i, // another command
  description: 'Only Owner cant execute command',
  owner: true,
  query: true,
  usage: '%cmd% --help',
  execute: async ({ m, prefix, replyMessage, errorMessage, styleMessage, response, query }) => {
    try {
      if (/--help/.test(query)) {
        const result = styleMessage('Usage Change Options', `Jika ingin mengubah host api bisa dengan menggunakan *command: ${prefix}change api\nuntuk mengubah apikey: ${prefix}change apikey apikeymu\nuntuk mode self/public: ${prefix}change public/self\nuntuk prefix: ${prefix}change prefix optional\n\n`);
        return replyMessage(result);
      } else if (/api|host/.test(query)) {
        global.original = !global.original;
        return replyMessage(response.success);
      } else if (/apikey/.test(query)) {
        global.apikeys = query.slice(7);
        return replyMessage(response.success);
      } else if (/public|self/.test(query)) {
        global.public = query == 'self' ? false : true;
        return replyMessage(response.success);
      } else if(/prefix/.test(query)) {
        const input = query.slice(7);
        global.multiprefix = input == 'multi' ? true : false;
        global.nonprefix = input == 'nopref' ? true : false;
        global.prefix = !/multi|nopref/.test(input) ? input : '!';
        return replyMessage(response.success);
      } else {
        return replyMessage('harap periksa query anda');
      }
    } catch (error) {
      return errorMessage(m.chat, error);
    }
  }
};