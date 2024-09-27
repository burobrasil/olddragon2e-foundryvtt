export function registerHandlebarsHelper() {
  // Stringify for Handlebars
  Handlebars.registerHelper('toJSON', function (obj) {
    return JSON.stringify(obj, null, 2);
  });

  // Times helper for Handlebars
  Handlebars.registerHelper('times', function (n, content) {
    let result = '';
    for (let i = 0; i < n; ++i) {
      content.data.index = i + 1;
      result += content.fn(i);
    }

    return result;
  });

  // Truncate helper for Handlebars
  Handlebars.registerHelper('truncate', function (str, len) {
    if (str && str.length > len) {
      var new_str = str.substr(0, len + 1);

      while (new_str.length) {
        var ch = new_str.substr(-1);
        new_str = new_str.substr(0, -1);

        if (ch == ' ') {
          break;
        }
      }

      if (new_str == '') {
        new_str = str.substr(0, len);
      }

      return new Handlebars.SafeString(new_str + '...');
    }
    return str;
  });

  // Compare operator helper for Handlebars
  Handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {
    switch (operator) {
      case '==':
        return v1 == v2 ? options.fn(this) : options.inverse(this);
      case '===':
        return v1 === v2 ? options.fn(this) : options.inverse(this);
      case '!=':
        return v1 != v2 ? options.fn(this) : options.inverse(this);
      case '!==':
        return v1 !== v2 ? options.fn(this) : options.inverse(this);
      case '<':
        return v1 < v2 ? options.fn(this) : options.inverse(this);
      case '<=':
        return v1 <= v2 ? options.fn(this) : options.inverse(this);
      case '>':
        return v1 > v2 ? options.fn(this) : options.inverse(this);
      case '>=':
        return v1 >= v2 ? options.fn(this) : options.inverse(this);
      case '&&':
        return v1 && v2 ? options.fn(this) : options.inverse(this);
      case '||':
        return v1 || v2 ? options.fn(this) : options.inverse(this);
      default:
        return options.inverse(this);
    }
  });

  // Checks if v1 is true and v2 is equal to v3
  Handlebars.registerHelper('ifCondAndEqual', function (v1, v2, v3, options) {
    if (v1 && v2 >= v3) {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  });

  Handlebars.registerHelper('hasDailyUses', function (dailyUses, options) {
    for (let key in dailyUses) {
      if (dailyUses[key] > 0) {
        return options.fn(this);
      }
    }
    return options.inverse(this);
  });

  Handlebars.registerHelper('generateCheckboxes', function (dailyUses, currentLevel) {
    let result = '';
    const maxUses = dailyUses[currentLevel] || 0;
    for (let i = 0; i < maxUses; i++) {
      result += `<input type="checkbox" name="daily_use_${currentLevel}_${i + 1}" />`;
    }
    return new Handlebars.SafeString(result);
  });
}

// Print a + or a - in front of numbers
Handlebars.registerHelper('signed_number', function (number, zero = '+0') {
  if (number === '0') {
    return zero;
  } else if (number < 0) {
    return number.toString();
  } else {
    return `+${number}`;
  }
});
