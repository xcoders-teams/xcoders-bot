const extractInstagramStories = (url) => {
  const regex = /https:\/\/(.+)?instagram\.com\/stories\/.+/
  const matchedUrl = url.match(regex)[0];
  const cleanUrl = matchedUrl.split('?')[0].replace(/\/$/, '');
  const [_, username, storyID] = cleanUrl.split('/');
  return { username, storyID };
};

const media = (url) => [/^https?:\/\/t\.me\/addstickers\/[a-zA-Z0-9_]+$/i, /https?:\/\/drive\.google\.com\/file\/d\/[a-zA-Z0-9_-]+\//i, /https?:\/\/(www\.|m\.|)imdb\.com\/video\/vi\d+/i, /https?:\/\/store\.line\.me\/stickershop\/product\/\d+/i, /https?:\/\/([^\s:/?#]+\.?)+(\/[^\s]*)?/i, /https?:\/\/sfile\.mobi\/[A-Za-z0-9]+/i, /https?:\/\/www\.capcut\.com\/(watch|template-detail)\/\d+\?/i, /https?:\/\/(|www\.)cocofun\.com\/share\/post\//i, /https?:\/\/(|www\.)likee\.video\/@/i, /https?:\/\/(www\.|m\.|)mediafire\.com\/file\/[a-zA-Z0-9]{15}(|\/[a-zA-Z0-9-_/%.]+)/i, /https?:\/\/drive\.+google\.+com\/file\/[a-zA-Z0-9-_./]+/i, /https?:\/\/(?:www\.|)xnxx\.com\/[a-zA-Z0-9-/_]+/i, /https?:\/\/(?:www\.|)xvideos\.com\/[a-z0-9/._-]+/i, /https?:\/\/store\.+line\.+me\/stickershop\/product\/[0-9]{1,8}/i, /https?:\/\/(?:m\.|www\.|)imdb\.com\/[a-zA-Z0-9-_\/?=&]+/i, /https?:\/\/ifunny\.co\/video\/[a-zA-Z0-9-_]+/i, /https?:\/\/(www\.|m\.|)soundcloud\.com\/[a-zA-Z0-9-_./]+/i, /https?:\/\/(www\.|)instagram\.com\/tv\/[A-z0-9-_]{1,11}/i, /https?:\/\/(?:(web\.|www\.|m\.|mobile\.|)youtube\.com\/\S*(?:(?:\/e(?:mbed))?\/|watch\?(?:\S*?&?v\=))|youtu\.be\/)([a-zA-Z0-9_-]{6,11})/i, /https?:\/\/www\.icocofun\.com\/[a-zA-Z0-9-_\/=?&]+/i, /https?:\/\/(www\.|mobile\.|id\.|)twitter\.com\/([a-zA-Z0-9_]{1,40}|i)\/(status|video)\/[0-9]*/i, /https?:\/\/(www\.|m\.|)instagram\.com\/(p|reel|([a-zA-Z0-9-_.]+\/(p|reel)))\/[a-zA-Z0-9]{1,11}/i, /https?:\/\/(www|pin|id)\.(it|pinterest\.co(m|\.[a-z]{1,2}))\S+/i, /https?:\/\/(web\.|www\.|m\.|)?(facebook|fb)\.(com|watch|gg)\S+/i, /https?:\/\/.+\.tiktok\.com\/.+/i].some(regex => regex.test(url));

const url = (url) => /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/i.test(url);

export default {
  url,
  media,
  extractInstagramStories
};