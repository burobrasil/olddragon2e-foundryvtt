export function registerHandlebarsHelper() {
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
