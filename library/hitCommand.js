class HitCommandTracker {

  get hitCommand() {
    return global.hitCommand;
  }

  monospace(str) {
    return '```' + str + '```';
  }

  addHitCommand(title, boolean) {
    const key = boolean ? 'done' : 'fail';
    const Commands = this ? this.hitCommand : global.hitCommand;
    if (Commands.hasOwnProperty(title)) {
      Commands[title].count += 1;
      Commands[title][key] += 1;
    } else {
      Commands[title] = { count: 1, fail: 0, done: 0 };
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
      const { count, done, fail } = this.hitCommand[command];
      return `${style}⁂ ${this.monospace(command)}\n${styleClass}• Done: *${done} Count*\n${styleClass}• Fail: *${fail} Count*\n${styleClass}• Total: *${count} Hit*\n\n`;
    }).join('');
  }
}

export default new HitCommandTracker();