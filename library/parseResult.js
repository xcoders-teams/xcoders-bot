'use strict';

function capitalize(text) {
  return text.replace(/[^a-zA-Z0-9]/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

class parseResult {

  capitalized(text) {
    return capitalize(text);
  }

  parseArray(arr) {
    let result = '';
    for (let i = 0; i < arr.length; i++) {
      const value = arr[i];
      if (typeof value === 'object' && !Array.isArray(value)) {
        const nestedEntries = this.parseResultObject(value);
        if (nestedEntries !== '') {
          result += `${nestedEntries}\n`;
        }
      } else if (Array.isArray(value)) {
        const nestedEntries = this.parseArray(value);
        if (nestedEntries !== '') {
          result += `${nestedEntries}\n`;
        }
      } else {
        result += `${value}, `;
      }
    }
    return result;
  }

  parseResultObject(input) {
    let result = '';
    const keys = Object.keys({ ...input });
    const values = Object.values({ ...input });
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const value = values[i];
      if (typeof value === 'string' && value.startsWith('http')) continue;
      if (typeof value === 'object' && !Array.isArray(value)) {
        const nestedEntries = this.parseResultObject(value);
        if (nestedEntries !== '') {
          result += `• ${capitalize(key)}:\n${nestedEntries}\n\n`;
        }
      } else if (Array.isArray(value)) {
        const nestedEntries = this.parseArray(value);
        if (nestedEntries !== '') {
          result += `• ${capitalize(key)}: ${nestedEntries}\n\n`;
        }
      } else {
        result += `• ${capitalize(key)}: ${value}\n`;
      }
    }
    return result;
  }

  parseResultArray(response) {
    let result = '';
    for (let i = 0; i < response.length; i++) {
      const keys = Object.keys({ ...response[i] });
      const values = Object.values({ ...response[i] });
      const entries = keys.map((key, index) => {
        const value = values[index];
        if (typeof value === 'string' && value.startsWith('http')) return false;
        if (typeof value === 'object' && !Array.isArray(value)) {
          const nestedEntries = Object.entries(value).map(([nestedKey, nestedValue]) => {
            if (typeof nestedValue === 'string' && nestedValue.startsWith('http')) return false;
            return `  • ${capitalize(nestedKey)}: ${nestedValue}`;
          }).filter(entry => entry !== false);
          if (nestedEntries.length > 0) {
            return `• ${capitalize(key)}:\n${nestedEntries.join('\n')}`;
          }
        } else if (Array.isArray(value)) {
          const nestedEntries = value.map(nestedValue => {
            if (typeof nestedValue === 'string' && nestedValue.startsWith('http')) return false;
            if (typeof nestedValue === 'object' && !Array.isArray(nestedValue)) return false;
            return `  • ${JSON.stringify(nestedValue)}`;
          }).filter(entry => entry !== false);
          if (nestedEntries.length > 0) {
            return `• ${capitalize(key)}:\n${nestedEntries.join('\n')}`;
          }
        }
        return `• ${capitalize(key)}: ${typeof value === 'string' ? value : typeof value === 'number' ? value.toString() : typeof value === 'boolean' ? value.toString() : value instanceof Object ? Object.keys({ ...value }).join(', ') : '-'}`;
      }).filter(entry => entry !== false);
      if (entries.length > 0) {
        result += entries.join('\n') + '\n\n';
      }
    }
    return result;
  }

  literation(input) {
    let lines = input.split('\n');
    let outputString = '';
    for (let line of lines) {
      let colonIndex = line.indexOf(':');
      let trimmedLine = line.trim();
      if (colonIndex !== -1 && trimmedLine.charAt(colonIndex + 1) !== '') {
        outputString += line + '\n';
      }
    }
    return outputString;
  }

  parse(input) {
    let result = '';
    if (input instanceof Array) result = this.parseResultArray(input);
    if (input instanceof Object) result = this.parseResultObject(input);
    const results = result.replaceAll('\n\n\n', '\n').replaceAll('\n\n', '');
    return this.literation(results).slice(0, -1);
  }
}

export default parseResult;