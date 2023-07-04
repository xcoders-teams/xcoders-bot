'use strict';

class Logger {
  constructor() {
    this.closeByNewLine = false;
    this.useIcons = true;
    this.logsTitle = 'LOGS';
    this.warningsTitle = 'WARNINGS';
    this.errorsTitle = 'ERRORS';
    this.informationsTitle = 'INFORMATIONS';
    this.successesTitle = 'SUCCESS';
    this.debugTitle = 'DEBUG';
    this.assertsTitle = 'ASSERT';
  }
  GetColor(foregroundColor = '', backgroundColor = '') {
    let foregroundsColors = '\x1b[37m';
    let backgroundsColors = '';
    switch (foregroundColor.trim().toLowerCase()) {
      case 'black':
        foregroundsColors = '\x1b[30m';
        break;
      case 'red':
        foregroundsColors = '\x1b[31m';
        break;
      case 'green':
        foregroundsColors = '\x1b[32m';
        break;
      case 'yellow':
        foregroundsColors = '\x1b[33m';
        break;
      case 'blue':
        foregroundsColors = '\x1b[34m';
        break;
      case 'magenta':
        foregroundsColors = '\x1b[35m';
        break;
      case 'cyan':
        foregroundsColors = '\x1b[36m';
        break;
      case 'white':
        foregroundsColors = '\x1b[37m';
        break;
    }

    switch (backgroundColor.trim().toLowerCase()) {
      case 'black':
        backgroundsColors = '\x1b[40m';
        break;
      case 'red':
        backgroundsColors = '\x1b[44m';
        break;
      case 'green':
        backgroundsColors = '\x1b[44m';
        break;
      case 'yellow':
        backgroundsColors = '\x1b[43m';
        break;
      case 'blue':
        backgroundsColors = '\x1b[44m';
        break;
      case 'magenta':
        backgroundsColors = '\x1b[45m';
        break;
      case 'cyan':
        backgroundsColors = '\x1b[46m';
        break;
      case 'white':
        backgroundsColors = '\x1b[47m';
        break;
    }
    return (foregroundsColors + backgroundsColors);
  }

  GetColorReset() {
    return '\x1b[0m';
  }

  clear() {
    console.clear();
  }

  print(foregroundColor = 'white', backgroundColor = 'black', ...strings) {
    const Icons = this.GetColor(foregroundColor, backgroundColor);
    console.log(Icons, strings.join(''), this.GetColorReset());
    if (this.closeByNewLine) console.log('');
  }

  log(...strings) {
    const foregrounds = 'white';
    const backgrounds = '';
    const icons = '\u25ce';
    const groupTiles = ` ${this.logsTitle}`;
    if (strings.length > 1) {
      const Icons = this.GetColor(forEach, backgrounds);
      console.group(Icons, (this.useIcons ? icons : '') + groupTiles);
      const newLine = this.closeByNewLine;
      this.closeByNewLine = false;
      strings.forEach((items) => {
        this.print(foregrounds, backgrounds, items, this.GetColorReset());
      });
      this.closeByNewLine = newLine;
      console.groupEnd();
      if (newLine) console.log();
    } else {
      this.print(foregrounds, backgrounds, strings.map((item) => {
        return `${(this.useIcons ? `${icons} ` : '')}${item}`;
      }));
    }
  }
  warn(...strings) {
    const foregrounds = 'yellow';
    const backgrounds = '';
    const icons = '\u26a0';
    const groupTiles = ` ${this.warningsTitle}`;
    if (strings.length > 1) {
      const Icons = this.GetColor(foregrounds, backgrounds);
      console.group(Icons, (this.useIcons ? icons : '') + groupTiles);
      const newLine = this.closeByNewLine;
      this.closeByNewLine = false;
      strings.forEach((item) => {
        this.print(foregrounds, backgrounds, item, this.GetColorReset());
      });
      this.closeByNewLine = newLine;
      console.groupEnd();
      if (newLine) console.log();
    } else {
      this.print(foregrounds, backgrounds, strings.map((item) => {
        return `${(this.useIcons ? `${icons} ` : '')}${item}`;
      }));
    }
  }
  error(...strings) {
    const foregrounds = 'red';
    const backgrounds = '';
    const icons = '\u26D4';
    const groupTiles = ` ${this.errorsTitle}`;
    if (strings.length > 1) {
      const Icons = this.GetColor(foregrounds, backgrounds);
      console.group(Icons, (this.useIcons ? icons : '') + groupTiles);
      const newLine = this.closeByNewLine;
      this.closeByNewLine = false;
      strings.forEach((item) => {
        this.print(foregrounds, backgrounds, item);
      });
      this.closeByNewLine = newLine;
      console.groupEnd();
      if (newLine) console.log();
    } else {
      this.print(foregrounds, backgrounds, strings.map((item) => {
        return `${(this.useIcons ? `${icons} ` : '')}${item}`;
      }));
    }
  }
  info(...strings) {
    const foregrounds = 'blue';
    const backgrounds = '';
    const icons = '\u2139';
    const groupTiles = ` ${this.informationsTitle}`;
    if (strings.length > 1) {
      const Icons = this.GetColor(foregrounds, backgrounds);
      console.group(Icons, (this.useIcons ? icons : '') + groupTiles);
      const newLine = this.closeByNewLine;
      this.closeByNewLine = false;
      strings.forEach((item) => {
        this.print(foregrounds, backgrounds, item);
      });
      this.closeByNewLine = newLine;
      console.groupEnd();
      if (newLine) console.log();
    } else {
      this.print(foregrounds, backgrounds, strings.map((item) => {
        return `${(this.useIcons ? `${icons} ` : '')}${item}`;
      }));
    }
  }
  success(...strings) {
    const foregrounds = 'green';
    const backgrounds = '';
    const icons = '\u2713';
    const groupTiles = ` ${this.successesTitle}`;
    if (strings.length > 1) {
      const Icons = this.GetColor(foregrounds, backgrounds);
      console.group(Icons, (this.useIcons ? icons : '') + groupTiles);
      const newLine = this.closeByNewLine;
      this.closeByNewLine = false;
      strings.forEach((item) => {
        this.print(foregrounds, backgrounds, item);
      });
      this.closeByNewLine = newLine;
      console.groupEnd();
      if (newLine) console.log();
    } else {
      this.print(foregrounds, backgrounds, strings.map((item) => {
        return `${(this.useIcons ? `${icons} ` : '')}${item}`;
      }));
    }
  }
  debug(...strings) {
    const foregrounds = 'magenta';
    const backgrounds = '';
    const icons = '\u1367';
    const groupTiles = ` ${this.debugsTitle}`;
    if (strings.length > 1) {
      const Icons = this.GetColor(foregrounds, backgrounds);
      console.group(Icons, (this.useIcons ? icons : '') + groupTiles);
      const newLine = this.closeByNewLine;
      this.closeByNewLine = false;
      strings.forEach((item) => {
        this.print(foregrounds, backgrounds, item);
      });
      this.closeByNewLine = newLine;
      console.groupEnd();
      if (newLine) console.log();
    } else {
      this.print(foregrounds, backgrounds, strings.map((item) => {
        return `${(this.useIcons ? `${icons} ` : '')}${item}`;
      }));
    }
  }
  load() {
    const P = ['\\', '|', '/', '-'];
    let x = 0;
    const loader = setInterval(() => {
      process.stdout.write(`\r${P[x++]}`);
      x %= P.length;
    }, 250);
    setTimeout(() => {
      clearInterval(loader);
    }, 5000);
  }
  assert(...strings) {
    const foregrounds = 'cyan';
    const backgrounds = '';
    const icons = '\u0021';
    const groupTiles = ` ${this.assertsTitle}`;
    if (strings.length > 1) {
      const Icons = this.GetColor(foregrounds, backgrounds);
      console.group(Icons, (this.useIcons ? icons : '') + groupTiles);
      const newLine = this.closeByNewLine;
      this.closeByNewLine = false;
      strings.forEach((item) => {
        this.print(foregrounds, backgrounds, item);
      });
      this.closeByNewLine = newLine;
      console.groupEnd();
      if (newLine) console.log();
    } else {
      this.print(foregrounds, backgrounds, strings.map((item) => {
        return `${(this.useIcons ? `${icons} ` : '')}${item}`;
      }));
    }
  }
}

export default new Logger();