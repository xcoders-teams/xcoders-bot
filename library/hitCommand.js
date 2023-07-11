import moment from "moment-timezone";
import functions from '../library/functions.js';

class HitCommandTracker {

  get hitCommand() {
    return global.hitCommand;
  }

  capitalize(str) {
    return functions.capitalize(str);
  }

  parseCount(number) {
    return `${(number ? number.toString() : '0').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
  };

  monospace(str) {
    return '```' + str + '```';
  }

  addHitCommand(title, boolean) {
    const key = boolean ? 'done' : 'fail';
    const Commands = this?.hitCommand || global.hitCommand;
    if (Commands.hasOwnProperty(title)) {
      Commands[title].count += 1;
      Commands[title][key] += 1;
      Commands[title].timestamp = Date.now();
    } else {
      Commands[title] = { count: 1, fail: 0, done: 0, timestamp: Date.now() };
      Commands[title][key] += 1;
    }
  }

  getHitCommand(title) {
    if (this.hitCommand[title]) {
      return `• ${title}: ${this.hitCommand[title].count} Hit`;
    } else {
      return null;
    }
  }

  getSmallHitCommand() {
    const keys = Object.keys(this.hitCommand);
    if (keys.length < 1) return null;
    const minCount = Math.min(...keys.map(key => this.hitCommand[key].count));
    const smallHitCommands = keys.filter(key => this.hitCommand[key].count === minCount);
    return smallHitCommands.map(command => `• ${command}: ${this.hitCommand[command].count} Hit`).join('\n');
  }

  getHighHitCommand() {
    const keys = Object.keys(this.hitCommand);
    if (keys.length < 1) return null;
    const maxCount = Math.max(...keys.map(key => this.hitCommand[key].count));
    const highHitCommands = keys.filter(key => this.hitCommand[key].count === maxCount);
    return highHitCommands.map(command => `• ${command}: ${this.hitCommand[command].count} Hit`).join('\n');
  }

  shortedCommands(dataObj) {
    const data = dataObj || this.hitCommand;
    const sortedCommands = Object.keys(data).sort((a, b) => {
      if (data[b].count === data[a].count) {
        return data[b].done - data[a].done;
      }
      return data[b].count - data[a].count;
    });
    return sortedCommands.map(command => {
      let { count, done, fail, timestamp } = data[command];
      if (!timestamp) {
        data[command].timestamp = Date.now();
        timestamp = Date.now();
      }
      const update = moment(timestamp).fromNow();
      return `⬟ ${this.monospace(command)}\n\t⊳ ${this.monospace('Done:')} *${this.parseCount(done)} Count*\n\t⊳ ${this.monospace('Fail:')} *${this.parseCount(fail)} Count*\n\t⊳ ${this.monospace('Total:')} *${this.parseCount(count)} Hit*\n\t⊳  ${this.monospace('Make in:')} *${this.capitalize(update)}*\n\n`;
    }).join('');
  }

  popularCommand(count = 1, style, styleClass) {
    const keys = Object.keys(this.hitCommand);
    if (keys.length < 1) return '';
    const sortedCommands = keys.sort((a, b) => {
      if (this.hitCommand[b].count === this.hitCommand[a].count) {
        return this.hitCommand[b].done - this.hitCommand[a].done;
      }
      return this.hitCommand[b].count - this.hitCommand[a].count;
    }).slice(0, count);
    return sortedCommands.map(command => {
      let { count, done, fail, timestamp } = this.hitCommand[command];
      if (!timestamp) {
        this.hitCommand[command].timestamp = Date.now();
        timestamp = Date.now();
      }
      const update = moment(timestamp).fromNow();
      return `${style}⁂ ${this.monospace(command)}\n${styleClass}• Done: *${this.parseCount(done)} Count*\n${styleClass}• Fail: *${this.parseCount(fail)} Count*\n${styleClass}• Total: *${this.parseCount(count)} Hit*\n${styleClass}• Make in: *${this.capitalize(update)}*\n\n`;
    }).join('');
  }
}

export default new HitCommandTracker();