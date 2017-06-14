/**
utility.js
**/

function serialize(obj) {
  var str = [];
  for (var p in obj) {
    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
  }
  return str.join("&");
}

function array_contains(arr, obj) {
  var i = arr.length;
  while (i--) {
    if (arr[i] === obj)
      return true;
  }
  return false;
}

String.prototype.underscore = function() {
  /**
  example:
  var test = 'boxee_ftw';
  console.log(test.underscore());
     # 'boxee%5Fftw'
  **/

  var str = this.toString();
  return str.replace('_', '%5F');
};

String.prototype.regex = function(re) {
  /**
  example:
  var test = 'game=test\nmonth=4';
  var x = test.regex(/^(.*?)=(.*?)$/igm);
  **/

  var str = this.toString();
  var myArray;
  var result = [];

  while ((myArray = re.exec(str)) !== null) {
    result.push(myArray);
  }

  return result;
};

String.prototype.regexReplaceAll = function(re, rep) {
  /**
  example:
  var test = 'http://gdx.mlb.com/components/game/mlb/year_${YEAR}/month_${MONTH}/day_${DAY}/grid.xml]';
  var x = test.regexReplaceAll(/\${(.*?)}/, '%(\$1)s');
  **/

  var str = this.toString();

  while (str.match(re)) {
    str = str.replace(re, rep)
  }

  return str;
};

function base64_decode(data) {
  /* http://kevin.vanzonneveld.net
     +   original by: Tyler Akins (http://rumkin.com)
     +   improved by: Thunder.m
     +      input by: Aman Gupta
     +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
     +   bugfixed by: Onno Marsman
     +   bugfixed by: Pellentesque Malesuada
     +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
     +      input by: Brett Zamir (http://brett-zamir.me)
     +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
     *     example 1: base64_decode('S2V2aW4gdmFuIFpvbm5ldmVsZA==');
     *     returns 1: 'Kevin van Zonneveld'
     mozilla has this native
     - but breaks in 2.0.0.12!
    if (typeof this.window['btoa'] == 'function') {
        return btoa(data);
    } */

  var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
    ac = 0,
    dec = "",
    tmp_arr = [];

  if (!data) {
    return data;
  }

  data += '';

  do { // unpack four hexets into three octets using index points in b64
    h1 = b64.indexOf(data.charAt(i++));
    h2 = b64.indexOf(data.charAt(i++));
    h3 = b64.indexOf(data.charAt(i++));
    h4 = b64.indexOf(data.charAt(i++));

    bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;

    o1 = bits >> 16 & 0xff;
    o2 = bits >> 8 & 0xff;
    o3 = bits & 0xff;

    if (h3 === 64) {
      tmp_arr[ac++] = String.fromCharCode(o1);
    } else if (h4 === 64) {
      tmp_arr[ac++] = String.fromCharCode(o1, o2);
    } else {
      tmp_arr[ac++] = String.fromCharCode(o1, o2, o3);
    }
  } while (i < data.length);

  dec = tmp_arr.join('');

  return dec;
}


/**
sprintf() for JavaScript 0.7-beta1
http://www.diveintojavascript.com/projects/javascript-sprintf

Copyright (c) Alexandru Marasteanu <alexaholic [at) gmail (dot] com>
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of sprintf() for JavaScript nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL Alexandru Marasteanu BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.


Changelog:
2010.09.06 - 0.7-beta1
  - features: vsprintf, support for named placeholders
  - enhancements: format cache, reduced global namespace pollution

2010.05.22 - 0.6:
 - reverted to 0.4 and fixed the bug regarding the sign of the number 0
 Note:
 Thanks to Raphael Pigulla <raph (at] n3rd [dot) org> (http://www.n3rd.org/)
 who warned me about a bug in 0.5, I discovered that the last update was
 a regress. I appologize for that.

2010.05.09 - 0.5:
 - bug fix: 0 is now preceeded with a + sign
 - bug fix: the sign was not at the right position on padded results (Kamal Abdali)
 - switched from GPL to BSD license

2007.10.21 - 0.4:
 - unit test and patch (David Baird)

2007.09.17 - 0.3:
 - bug fix: no longer throws exception on empty paramenters (Hans Pufal)

2007.09.11 - 0.2:
 - feature: added argument swapping

2007.04.03 - 0.1:
 - initial release
**/

var sprintf = (function() {
  function get_type(variable) {
    return Object.prototype.toString.call(variable).slice(8, -1).toLowerCase();
  }

  function str_repeat(input, multiplier) {
    for (var output = []; multiplier > 0; output[--multiplier] = input) { /* do nothing */ }
    return output.join('');
  }

  var str_format = function() {
    if (!str_format.cache.hasOwnProperty(arguments[0])) {
      str_format.cache[arguments[0]] = str_format.parse(arguments[0]);
    }
    return str_format.format.call(null, str_format.cache[arguments[0]], arguments);
  };

  str_format.format = function(parse_tree, argv) {
    var cursor = 1,
      tree_length = parse_tree.length,
      node_type = '',
      arg, output = [],
      i, k, match, pad, pad_character, pad_length;
    for (i = 0; i < tree_length; i++) {
      node_type = get_type(parse_tree[i]);
      if (node_type === 'string') {
        output.push(parse_tree[i]);
      } else if (node_type === 'array') {
        match = parse_tree[i]; // convenience purposes only
        if (match[2]) { // keyword argument
          arg = argv[cursor];
          for (k = 0; k < match[2].length; k++) {
            if (!arg.hasOwnProperty(match[2][k])) {
              throw (sprintf('[sprintf] property "%s" does not exist', match[2][k]));
            }
            arg = arg[match[2][k]];
          }
        } else if (match[1]) { // positional argument (explicit)
          arg = argv[match[1]];
        } else { // positional argument (implicit)
          arg = argv[cursor++];
        }

        if (/[^s]/.test(match[8]) && (get_type(arg) != 'number')) {
          throw (sprintf('[sprintf] expecting number but found %s', get_type(arg)));
        }
        switch (match[8]) {
          case 'b':
            arg = arg.toString(2);
            break;
          case 'c':
            arg = String.fromCharCode(arg);
            break;
          case 'd':
            arg = parseInt(arg, 10);
            break;
          case 'e':
            arg = match[7] ? arg.toExponential(match[7]) : arg.toExponential();
            break;
          case 'f':
            arg = match[7] ? parseFloat(arg).toFixed(match[7]) : parseFloat(arg);
            break;
          case 'o':
            arg = arg.toString(8);
            break;
          case 's':
            arg = ((arg = String(arg)) && match[7] ? arg.substring(0, match[7]) : arg);
            break;
          case 'u':
            arg = Math.abs(arg);
            break;
          case 'x':
            arg = arg.toString(16);
            break;
          case 'X':
            arg = arg.toString(16).toUpperCase();
            break;
        }
        arg = (/[def]/.test(match[8]) && match[3] && arg >= 0 ? '+' + arg : arg);
        pad_character = match[4] ? match[4] == '0' ? '0' : match[4].charAt(1) : ' ';
        pad_length = match[6] - String(arg).length;
        pad = match[6] ? str_repeat(pad_character, pad_length) : '';
        output.push(match[5] ? arg + pad : pad + arg);
      }
    }
    return output.join('');
  };

  str_format.cache = {};

  str_format.parse = function(fmt) {
    var _fmt = fmt,
      match = [],
      parse_tree = [],
      arg_names = 0;
    while (_fmt) {
      if ((match = /^[^\x25]+/.exec(_fmt)) !== null) {
        parse_tree.push(match[0]);
      } else if ((match = /^\x25{2}/.exec(_fmt)) !== null) {
        parse_tree.push('%');
      } else if ((match = /^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fosuxX])/.exec(_fmt)) !== null) {
        if (match[2]) {
          arg_names |= 1;
          var field_list = [],
            replacement_field = match[2],
            field_match = [];
          if ((field_match = /^([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {
            field_list.push(field_match[1]);
            while ((replacement_field = replacement_field.substring(field_match[0].length)) !== '') {
              if ((field_match = /^\.([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {
                field_list.push(field_match[1]);
              } else if ((field_match = /^\[(\d+)\]/.exec(replacement_field)) !== null) {
                field_list.push(field_match[1]);
              } else {
                throw ('[sprintf] huh?');
              }
            }
          } else {
            throw ('[sprintf] huh?');
          }
          match[2] = field_list;
        } else {
          arg_names |= 2;
        }
        if (arg_names === 3) {
          throw ('[sprintf] mixing positional and named placeholders is not (yet) supported');
        }
        parse_tree.push(match);
      } else {
        throw ('[sprintf] huh?');
      }
      _fmt = _fmt.substring(match[0].length);
    }
    return parse_tree;
  };

  return str_format;
})();

var vsprintf = function(fmt, argv) {
  argv.unshift(fmt);
  return sprintf.apply(null, argv);
};
