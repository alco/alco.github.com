;(function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0].call(u.exports,function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({1:[function(require,module,exports){
var api = require('./remark/api')
  , highlighter = require('./remark/highlighter')
  , resources = require('./remark/resources')
  ;

// Expose API as `remark`
window.remark = api;

// Apply embedded styles to document
styleDocument();

function styleDocument () {
  var styleElement = document.createElement('style')
    , headElement = document.getElementsByTagName('head')[0]
    , style
    ;

  styleElement.type = 'text/css';
  headElement.insertBefore(styleElement, headElement.firstChild);

  styleElement.innerHTML = resources.documentStyles;

  for (style in highlighter.styles) {
    if (highlighter.styles.hasOwnProperty(style)) {
      styleElement.innerHTML = styleElement.innerHTML +
        highlighter.styles[style];
    }
  }
}

},{"./remark/api":2,"./remark/highlighter":3,"./remark/resources":4}],3:[function(require,module,exports){
(function(){/* Automatically generated */

var hljs = new (/*
Syntax highlighting with language autodetection.
http://softwaremaniacs.org/soft/highlight/
*/

function() {

  /* Utility functions */

  function escape(value) {
    return value.replace(/&/gm, '&amp;').replace(/</gm, '&lt;');
  }

  function findCode(pre) {
    for (var node = pre.firstChild; node; node = node.nextSibling) {
      if (node.nodeName == 'CODE')
        return node;
      if (!(node.nodeType == 3 && node.nodeValue.match(/\s+/)))
        break;
    }
  }

  function blockText(block, ignoreNewLines) {
    return Array.prototype.map.call(block.childNodes, function(node) {
      if (node.nodeType == 3) {
        return ignoreNewLines ? node.nodeValue.replace(/\n/g, '') : node.nodeValue;
      }
      if (node.nodeName == 'BR') {
        return '\n';
      }
      return blockText(node, ignoreNewLines);
    }).join('');
  }

  function blockLanguage(block) {
    var classes = (block.className + ' ' + block.parentNode.className).split(/\s+/);
    classes = classes.map(function(c) {return c.replace(/^language-/, '')});
    for (var i = 0; i < classes.length; i++) {
      if (languages[classes[i]] || classes[i] == 'no-highlight') {
        return classes[i];
      }
    }
  }

  /* Stream merging */

  function nodeStream(node) {
    var result = [];
    (function _nodeStream(node, offset) {
      for (var child = node.firstChild; child; child = child.nextSibling) {
        if (child.nodeType == 3)
          offset += child.nodeValue.length;
        else if (child.nodeName == 'BR')
          offset += 1;
        else if (child.nodeType == 1) {
          result.push({
            event: 'start',
            offset: offset,
            node: child
          });
          offset = _nodeStream(child, offset);
          result.push({
            event: 'stop',
            offset: offset,
            node: child
          });
        }
      }
      return offset;
    })(node, 0);
    return result;
  }

  function mergeStreams(stream1, stream2, value) {
    var processed = 0;
    var result = '';
    var nodeStack = [];

    function selectStream() {
      if (stream1.length && stream2.length) {
        if (stream1[0].offset != stream2[0].offset)
          return (stream1[0].offset < stream2[0].offset) ? stream1 : stream2;
        else {
          /*
          To avoid starting the stream just before it should stop the order is
          ensured that stream1 always starts first and closes last:

          if (event1 == 'start' && event2 == 'start')
            return stream1;
          if (event1 == 'start' && event2 == 'stop')
            return stream2;
          if (event1 == 'stop' && event2 == 'start')
            return stream1;
          if (event1 == 'stop' && event2 == 'stop')
            return stream2;

          ... which is collapsed to:
          */
          return stream2[0].event == 'start' ? stream1 : stream2;
        }
      } else {
        return stream1.length ? stream1 : stream2;
      }
    }

    function open(node) {
      function attr_str(a) {return ' ' + a.nodeName + '="' + escape(a.value) + '"'};
      return '<' + node.nodeName + Array.prototype.map.call(node.attributes, attr_str).join('') + '>';
    }

    while (stream1.length || stream2.length) {
      var current = selectStream().splice(0, 1)[0];
      result += escape(value.substr(processed, current.offset - processed));
      processed = current.offset;
      if ( current.event == 'start') {
        result += open(current.node);
        nodeStack.push(current.node);
      } else if (current.event == 'stop') {
        var node, i = nodeStack.length;
        do {
          i--;
          node = nodeStack[i];
          result += ('</' + node.nodeName.toLowerCase() + '>');
        } while (node != current.node);
        nodeStack.splice(i, 1);
        while (i < nodeStack.length) {
          result += open(nodeStack[i]);
          i++;
        }
      }
    }
    return result + escape(value.substr(processed));
  }

  /* Initialization */

  function compileLanguage(language) {

    function langRe(value, global) {
      return RegExp(
        value,
        'm' + (language.case_insensitive ? 'i' : '') + (global ? 'g' : '')
      );
    }

    function compileMode(mode, parent) {
      if (mode.compiled)
        return;
      mode.compiled = true;

      var keywords = []; // used later with beginWithKeyword but filled as a side-effect of keywords compilation
      if (mode.keywords) {
        var compiled_keywords = {};

        function flatten(className, str) {
          str.split(' ').forEach(function(kw) {
            var pair = kw.split('|');
            compiled_keywords[pair[0]] = [className, pair[1] ? Number(pair[1]) : 1];
            keywords.push(pair[0]);
          });
        }

        mode.lexemsRe = langRe(mode.lexems || hljs.IDENT_RE, true);
        if (typeof mode.keywords == 'string') { // string
          flatten('keyword', mode.keywords)
        } else {
          for (var className in mode.keywords) {
            if (!mode.keywords.hasOwnProperty(className))
              continue;
            flatten(className, mode.keywords[className]);
          }
        }
        mode.keywords = compiled_keywords;
      }
      if (parent) {
        if (mode.beginWithKeyword) {
          mode.begin = '\\b(' + keywords.join('|') + ')\\s';
        }
        mode.beginRe = langRe(mode.begin ? mode.begin : '\\B|\\b');
        if (!mode.end && !mode.endsWithParent)
          mode.end = '\\B|\\b';
        if (mode.end)
          mode.endRe = langRe(mode.end);
        mode.terminator_end = mode.end || '';
        if (mode.endsWithParent && parent.terminator_end)
          mode.terminator_end += (mode.end ? '|' : '') + parent.terminator_end;
      }
      if (mode.illegal)
        mode.illegalRe = langRe(mode.illegal);
      if (mode.relevance === undefined)
        mode.relevance = 1;
      if (!mode.contains) {
        mode.contains = [];
      }
      for (var i = 0; i < mode.contains.length; i++) {
        if (mode.contains[i] == 'self') {
          mode.contains[i] = mode;
        }
        compileMode(mode.contains[i], mode);
      }
      if (mode.starts) {
        compileMode(mode.starts, parent);
      }

      var terminators = [];
      for (var i = 0; i < mode.contains.length; i++) {
        terminators.push(mode.contains[i].begin);
      }
      if (mode.terminator_end) {
        terminators.push(mode.terminator_end);
      }
      if (mode.illegal) {
        terminators.push(mode.illegal);
      }
      mode.terminators = terminators.length ? langRe(terminators.join('|'), true) : {exec: function(s) {return null;}};
    }

    compileMode(language);
  }

  /*
  Core highlighting function. Accepts a language name and a string with the
  code to highlight. Returns an object with the following properties:

  - relevance (int)
  - keyword_count (int)
  - value (an HTML string with highlighting markup)

  */
  function highlight(language_name, value) {

    function subMode(lexem, mode) {
      for (var i = 0; i < mode.contains.length; i++) {
        var match = mode.contains[i].beginRe.exec(lexem);
        if (match && match.index == 0) {
          return mode.contains[i];
        }
      }
    }

    function endOfMode(mode, lexem) {
      if (mode.end && mode.endRe.test(lexem)) {
        return mode;
      }
      if (mode.endsWithParent) {
        return endOfMode(mode.parent, lexem);
      }
    }

    function isIllegal(lexem, mode) {
      return mode.illegal && mode.illegalRe.test(lexem);
    }

    function keywordMatch(mode, match) {
      var match_str = language.case_insensitive ? match[0].toLowerCase() : match[0];
      return mode.keywords.hasOwnProperty(match_str) && mode.keywords[match_str];
    }

    function processKeywords() {
      var buffer = escape(mode_buffer);
      if (!top.keywords)
        return buffer;
      var result = '';
      var last_index = 0;
      top.lexemsRe.lastIndex = 0;
      var match = top.lexemsRe.exec(buffer);
      while (match) {
        result += buffer.substr(last_index, match.index - last_index);
        var keyword_match = keywordMatch(top, match);
        if (keyword_match) {
          keyword_count += keyword_match[1];
          result += '<span class="'+ keyword_match[0] +'">' + match[0] + '</span>';
        } else {
          result += match[0];
        }
        last_index = top.lexemsRe.lastIndex;
        match = top.lexemsRe.exec(buffer);
      }
      return result + buffer.substr(last_index);
    }

    function processSubLanguage() {
      if (top.subLanguage && !languages[top.subLanguage]) {
        return escape(mode_buffer);
      }
      var result = top.subLanguage ? highlight(top.subLanguage, mode_buffer) : highlightAuto(mode_buffer);
      // Counting embedded language score towards the host language may be disabled
      // with zeroing the containing mode relevance. Usecase in point is Markdown that
      // allows XML everywhere and makes every XML snippet to have a much larger Markdown
      // score.
      if (top.relevance > 0) {
        keyword_count += result.keyword_count;
        relevance += result.relevance;
      }
      return '<span class="' + result.language  + '">' + result.value + '</span>';
    }

    function processBuffer() {
      return top.subLanguage !== undefined ? processSubLanguage() : processKeywords();
    }

    function startNewMode(mode, lexem) {
      var markup = mode.className? '<span class="' + mode.className + '">': '';
      if (mode.returnBegin) {
        result += markup;
        mode_buffer = '';
      } else if (mode.excludeBegin) {
        result += escape(lexem) + markup;
        mode_buffer = '';
      } else {
        result += markup;
        mode_buffer = lexem;
      }
      top = Object.create(mode, {parent: {value: top}});
      relevance += mode.relevance;
    }

    function processModeInfo(buffer, lexem) {
      mode_buffer += buffer;
      if (lexem === undefined) {
        result += processBuffer();
        return;
      }

      var new_mode = subMode(lexem, top);
      if (new_mode) {
        result += processBuffer();
        startNewMode(new_mode, lexem);
        return new_mode.returnBegin;
      }

      var end_mode = endOfMode(top, lexem);
      if (end_mode) {
        if (!(end_mode.returnEnd || end_mode.excludeEnd)) {
          mode_buffer += lexem;
        }
        result += processBuffer();
        do {
          if (top.className) {
            result += '</span>';
          }
          top = top.parent;
        } while (top != end_mode.parent);
        if (end_mode.excludeEnd) {
          result += escape(lexem);
        }
        mode_buffer = '';
        if (end_mode.starts) {
          startNewMode(end_mode.starts, '');
        }
        return end_mode.returnEnd;
      }

      if (isIllegal(lexem, top))
        throw 'Illegal';
    }

    var language = languages[language_name];
    compileLanguage(language);
    var top = language;
    var mode_buffer = '';
    var relevance = 0;
    var keyword_count = 0;
    var result = '';
    try {
      var match, index = 0;
      while (true) {
        top.terminators.lastIndex = index;
        match = top.terminators.exec(value);
        if (!match)
          break;
        var return_lexem = processModeInfo(value.substr(index, match.index - index), match[0]);
        index = match.index + (return_lexem ? 0 : match[0].length);
      }
      processModeInfo(value.substr(index), undefined);
      return {
        relevance: relevance,
        keyword_count: keyword_count,
        value: result,
        language: language_name
      };
    } catch (e) {
      if (e == 'Illegal') {
        return {
          relevance: 0,
          keyword_count: 0,
          value: escape(value)
        };
      } else {
        throw e;
      }
    }
  }

  /*
  Highlighting with language detection. Accepts a string with the code to
  highlight. Returns an object with the following properties:

  - language (detected language)
  - relevance (int)
  - keyword_count (int)
  - value (an HTML string with highlighting markup)
  - second_best (object with the same structure for second-best heuristically
    detected language, may be absent)

  */
  function highlightAuto(text) {
    var result = {
      keyword_count: 0,
      relevance: 0,
      value: escape(text)
    };
    var second_best = result;
    for (var key in languages) {
      if (!languages.hasOwnProperty(key))
        continue;
      var current = highlight(key, text);
      current.language = key;
      if (current.keyword_count + current.relevance > second_best.keyword_count + second_best.relevance) {
        second_best = current;
      }
      if (current.keyword_count + current.relevance > result.keyword_count + result.relevance) {
        second_best = result;
        result = current;
      }
    }
    if (second_best.language) {
      result.second_best = second_best;
    }
    return result;
  }

  /*
  Post-processing of the highlighted markup:

  - replace TABs with something more useful
  - replace real line-breaks with '<br>' for non-pre containers

  */
  function fixMarkup(value, tabReplace, useBR) {
    if (tabReplace) {
      value = value.replace(/^((<[^>]+>|\t)+)/gm, function(match, p1, offset, s) {
        return p1.replace(/\t/g, tabReplace);
      });
    }
    if (useBR) {
      value = value.replace(/\n/g, '<br>');
    }
    return value;
  }

  /*
  Applies highlighting to a DOM node containing code. Accepts a DOM node and
  two optional parameters for fixMarkup.
  */
  function highlightBlock(block, tabReplace, useBR) {
    var text = blockText(block, useBR);
    var language = blockLanguage(block);
    if (language == 'no-highlight')
        return;
    var result = language ? highlight(language, text) : highlightAuto(text);
    language = result.language;
    var original = nodeStream(block);
    if (original.length) {
      var pre = document.createElement('pre');
      pre.innerHTML = result.value;
      result.value = mergeStreams(original, nodeStream(pre), text);
    }
    result.value = fixMarkup(result.value, tabReplace, useBR);

    var class_name = block.className;
    if (!class_name.match('(\\s|^)(language-)?' + language + '(\\s|$)')) {
      class_name = class_name ? (class_name + ' ' + language) : language;
    }
    block.innerHTML = result.value;
    block.className = class_name;
    block.result = {
      language: language,
      kw: result.keyword_count,
      re: result.relevance
    };
    if (result.second_best) {
      block.second_best = {
        language: result.second_best.language,
        kw: result.second_best.keyword_count,
        re: result.second_best.relevance
      };
    }
  }

  /*
  Applies highlighting to all <pre><code>..</code></pre> blocks on a page.
  */
  function initHighlighting() {
    if (initHighlighting.called)
      return;
    initHighlighting.called = true;
    Array.prototype.map.call(document.getElementsByTagName('pre'), findCode).
      filter(Boolean).
      forEach(function(code){highlightBlock(code, hljs.tabReplace)});
  }

  /*
  Attaches highlighting to the page load event.
  */
  function initHighlightingOnLoad() {
    window.addEventListener('DOMContentLoaded', initHighlighting, false);
    window.addEventListener('load', initHighlighting, false);
  }

  var languages = {}; // a shortcut to avoid writing "this." everywhere

  /* Interface definition */

  this.LANGUAGES = languages;
  this.highlight = highlight;
  this.highlightAuto = highlightAuto;
  this.fixMarkup = fixMarkup;
  this.highlightBlock = highlightBlock;
  this.initHighlighting = initHighlighting;
  this.initHighlightingOnLoad = initHighlightingOnLoad;

  // Common regexps
  this.IDENT_RE = '[a-zA-Z][a-zA-Z0-9_]*';
  this.UNDERSCORE_IDENT_RE = '[a-zA-Z_][a-zA-Z0-9_]*';
  this.NUMBER_RE = '\\b\\d+(\\.\\d+)?';
  this.C_NUMBER_RE = '(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)'; // 0x..., 0..., decimal, float
  this.BINARY_NUMBER_RE = '\\b(0b[01]+)'; // 0b...
  this.RE_STARTERS_RE = '!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|\\.|-|-=|/|/=|:|;|<|<<|<<=|<=|=|==|===|>|>=|>>|>>=|>>>|>>>=|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~';

  // Common modes
  this.BACKSLASH_ESCAPE = {
    begin: '\\\\[\\s\\S]', relevance: 0
  };
  this.APOS_STRING_MODE = {
    className: 'string',
    begin: '\'', end: '\'',
    illegal: '\\n',
    contains: [this.BACKSLASH_ESCAPE],
    relevance: 0
  };
  this.QUOTE_STRING_MODE = {
    className: 'string',
    begin: '"', end: '"',
    illegal: '\\n',
    contains: [this.BACKSLASH_ESCAPE],
    relevance: 0
  };
  this.C_LINE_COMMENT_MODE = {
    className: 'comment',
    begin: '//', end: '$'
  };
  this.C_BLOCK_COMMENT_MODE = {
    className: 'comment',
    begin: '/\\*', end: '\\*/'
  };
  this.HASH_COMMENT_MODE = {
    className: 'comment',
    begin: '#', end: '$'
  };
  this.NUMBER_MODE = {
    className: 'number',
    begin: this.NUMBER_RE,
    relevance: 0
  };
  this.C_NUMBER_MODE = {
    className: 'number',
    begin: this.C_NUMBER_RE,
    relevance: 0
  };
  this.BINARY_NUMBER_MODE = {
    className: 'number',
    begin: this.BINARY_NUMBER_RE,
    relevance: 0
  };

  // Utility functions
  this.inherit = function(parent, obj) {
    var result = {}
    for (var key in parent)
      result[key] = parent[key];
    if (obj)
      for (var key in obj)
        result[key] = obj[key];
    return result;
  }
}
)()
  , languages = [{name:"javascript",create:/*
Language: JavaScript
*/

function(hljs) {
  return {
    keywords: {
      keyword:
        'in if for while finally var new function do return void else break catch ' +
        'instanceof with throw case default try this switch continue typeof delete ' +
        'let yield const',
      literal:
        'true false null undefined NaN Infinity'
    },
    contains: [
      hljs.APOS_STRING_MODE,
      hljs.QUOTE_STRING_MODE,
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      hljs.C_NUMBER_MODE,
      { // "value" container
        begin: '(' + hljs.RE_STARTERS_RE + '|\\b(case|return|throw)\\b)\\s*',
        keywords: 'return throw case',
        contains: [
          hljs.C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE,
          {
            className: 'regexp',
            begin: '/', end: '/[gim]*',
            illegal: '\\n',
            contains: [{begin: '\\\\/'}]
          },
          { // E4X
            begin: '<', end: '>;',
            subLanguage: 'xml'
          }
        ],
        relevance: 0
      },
      {
        className: 'function',
        beginWithKeyword: true, end: '{',
        keywords: 'function',
        contains: [
          {
            className: 'title', begin: '[A-Za-z$_][0-9A-Za-z$_]*'
          },
          {
            className: 'params',
            begin: '\\(', end: '\\)',
            contains: [
              hljs.C_LINE_COMMENT_MODE,
              hljs.C_BLOCK_COMMENT_MODE
            ],
            illegal: '["\'\\(]'
          }
        ],
        illegal: '\\[|%'
      }
    ]
  };
}
},{name:"ruby",create:/*
Language: Ruby
Author: Anton Kovalyov <anton@kovalyov.net>
Contributors: Peter Leonov <gojpeg@yandex.ru>, Vasily Polovnyov <vast@whiteants.net>, Loren Segal <lsegal@soen.ca>
*/

function(hljs) {
  var RUBY_IDENT_RE = '[a-zA-Z_][a-zA-Z0-9_]*(\\!|\\?)?';
  var RUBY_METHOD_RE = '[a-zA-Z_]\\w*[!?=]?|[-+~]\\@|<<|>>|=~|===?|<=>|[<>]=?|\\*\\*|[-/+%^&*~`|]|\\[\\]=?';
  var RUBY_KEYWORDS = {
    keyword:
      'and false then defined module in return redo if BEGIN retry end for true self when ' +
      'next until do begin unless END rescue nil else break undef not super class case ' +
      'require yield alias while ensure elsif or include'
  };
  var YARDOCTAG = {
    className: 'yardoctag',
    begin: '@[A-Za-z]+'
  };
  var COMMENTS = [
    {
      className: 'comment',
      begin: '#', end: '$',
      contains: [YARDOCTAG]
    },
    {
      className: 'comment',
      begin: '^\\=begin', end: '^\\=end',
      contains: [YARDOCTAG],
      relevance: 10
    },
    {
      className: 'comment',
      begin: '^__END__', end: '\\n$'
    }
  ];
  var SUBST = {
    className: 'subst',
    begin: '#\\{', end: '}',
    lexems: RUBY_IDENT_RE,
    keywords: RUBY_KEYWORDS
  };
  var STR_CONTAINS = [hljs.BACKSLASH_ESCAPE, SUBST];
  var STRINGS = [
    {
      className: 'string',
      begin: '\'', end: '\'',
      contains: STR_CONTAINS,
      relevance: 0
    },
    {
      className: 'string',
      begin: '"', end: '"',
      contains: STR_CONTAINS,
      relevance: 0
    },
    {
      className: 'string',
      begin: '%[qw]?\\(', end: '\\)',
      contains: STR_CONTAINS
    },
    {
      className: 'string',
      begin: '%[qw]?\\[', end: '\\]',
      contains: STR_CONTAINS
    },
    {
      className: 'string',
      begin: '%[qw]?{', end: '}',
      contains: STR_CONTAINS
    },
    {
      className: 'string',
      begin: '%[qw]?<', end: '>',
      contains: STR_CONTAINS,
      relevance: 10
    },
    {
      className: 'string',
      begin: '%[qw]?/', end: '/',
      contains: STR_CONTAINS,
      relevance: 10
    },
    {
      className: 'string',
      begin: '%[qw]?%', end: '%',
      contains: STR_CONTAINS,
      relevance: 10
    },
    {
      className: 'string',
      begin: '%[qw]?-', end: '-',
      contains: STR_CONTAINS,
      relevance: 10
    },
    {
      className: 'string',
      begin: '%[qw]?\\|', end: '\\|',
      contains: STR_CONTAINS,
      relevance: 10
    }
  ];
  var FUNCTION = {
    className: 'function',
    beginWithKeyword: true, end: ' |$|;',
    keywords: 'def',
    contains: [
      {
        className: 'title',
        begin: RUBY_METHOD_RE,
        lexems: RUBY_IDENT_RE,
        keywords: RUBY_KEYWORDS
      },
      {
        className: 'params',
        begin: '\\(', end: '\\)',
        lexems: RUBY_IDENT_RE,
        keywords: RUBY_KEYWORDS
      }
    ].concat(COMMENTS)
  };

  var RUBY_DEFAULT_CONTAINS = COMMENTS.concat(STRINGS.concat([
    {
      className: 'class',
      beginWithKeyword: true, end: '$|;',
      keywords: 'class module',
      contains: [
        {
          className: 'title',
          begin: '[A-Za-z_]\\w*(::\\w+)*(\\?|\\!)?',
          relevance: 0
        },
        {
          className: 'inheritance',
          begin: '<\\s*',
          contains: [{
            className: 'parent',
            begin: '(' + hljs.IDENT_RE + '::)?' + hljs.IDENT_RE
          }]
        }
      ].concat(COMMENTS)
    },
    FUNCTION,
    {
      className: 'constant',
      begin: '(::)?(\\b[A-Z]\\w*(::)?)+',
      relevance: 0
    },
    {
      className: 'symbol',
      begin: ':',
      contains: STRINGS.concat([{begin: RUBY_IDENT_RE}]),
      relevance: 0
    },
    {
      className: 'number',
      begin: '(\\b0[0-7_]+)|(\\b0x[0-9a-fA-F_]+)|(\\b[1-9][0-9_]*(\\.[0-9_]+)?)|[0_]\\b',
      relevance: 0
    },
    {
      className: 'number',
      begin: '\\?\\w'
    },
    {
      className: 'variable',
      begin: '(\\$\\W)|((\\$|\\@\\@?)(\\w+))'
    },
    { // regexp container
      begin: '(' + hljs.RE_STARTERS_RE + ')\\s*',
      contains: COMMENTS.concat([
        {
          className: 'regexp',
          begin: '/', end: '/[a-z]*',
          illegal: '\\n',
          contains: [hljs.BACKSLASH_ESCAPE]
        }
      ]),
      relevance: 0
    }
  ]));
  SUBST.contains = RUBY_DEFAULT_CONTAINS;
  FUNCTION.contains[1].contains = RUBY_DEFAULT_CONTAINS;

  return {
    lexems: RUBY_IDENT_RE,
    keywords: RUBY_KEYWORDS,
    contains: RUBY_DEFAULT_CONTAINS
  };
}
},{name:"python",create:/*
Language: Python
*/

function(hljs) {
  var STRINGS = [
    {
      className: 'string',
      begin: '(u|b)?r?\'\'\'', end: '\'\'\'',
      relevance: 10
    },
    {
      className: 'string',
      begin: '(u|b)?r?"""', end: '"""',
      relevance: 10
    },
    {
      className: 'string',
      begin: '(u|r|ur)\'', end: '\'',
      contains: [hljs.BACKSLASH_ESCAPE],
      relevance: 10
    },
    {
      className: 'string',
      begin: '(u|r|ur)"', end: '"',
      contains: [hljs.BACKSLASH_ESCAPE],
      relevance: 10
    },
    {
      className: 'string',
      begin: '(b|br)\'', end: '\'',
      contains: [hljs.BACKSLASH_ESCAPE]
    },
    {
      className: 'string',
      begin: '(b|br)"', end: '"',
      contains: [hljs.BACKSLASH_ESCAPE]
    }
  ].concat([
    hljs.APOS_STRING_MODE,
    hljs.QUOTE_STRING_MODE
  ]);
  var TITLE = {
    className: 'title', begin: hljs.UNDERSCORE_IDENT_RE
  };
  var PARAMS = {
    className: 'params',
    begin: '\\(', end: '\\)',
    contains: ['self', hljs.C_NUMBER_MODE].concat(STRINGS)
  };
  var FUNC_CLASS_PROTO = {
    beginWithKeyword: true, end: ':',
    illegal: '[${=;\\n]',
    contains: [TITLE, PARAMS],
    relevance: 10
  };

  return {
    keywords: {
      keyword:
        'and elif is global as in if from raise for except finally print import pass return ' +
        'exec else break not with class assert yield try while continue del or def lambda ' +
        'nonlocal|10',
      built_in:
        'None True False Ellipsis NotImplemented'
    },
    illegal: '(</|->|\\?)',
    contains: STRINGS.concat([
      hljs.HASH_COMMENT_MODE,
      hljs.inherit(FUNC_CLASS_PROTO, {className: 'function', keywords: 'def'}),
      hljs.inherit(FUNC_CLASS_PROTO, {className: 'class', keywords: 'class'}),
      hljs.C_NUMBER_MODE,
      {
        className: 'decorator',
        begin: '@', end: '$'
      },
      {
        begin: '\\b(print|exec)\\(' // don’t highlight keywords-turned-functions in Python 3
      }
    ])
  };
}
},{name:"bash",create:/*
Language: Bash
Author: vah <vahtenberg@gmail.com>
*/

function(hljs) {
  var BASH_LITERAL = 'true false';
  var VAR1 = {
    className: 'variable', begin: '\\$[a-zA-Z0-9_]+\\b'
  };
  var VAR2 = {
    className: 'variable', begin: '\\${([^}]|\\\\})+}'
  };
  var QUOTE_STRING = {
    className: 'string',
    begin: '"', end: '"',
    illegal: '\\n',
    contains: [hljs.BACKSLASH_ESCAPE, VAR1, VAR2],
    relevance: 0
  };
  var APOS_STRING = {
    className: 'string',
    begin: '\'', end: '\'',
    contains: [{begin: '\'\''}],
    relevance: 0
  };
  var TEST_CONDITION = {
    className: 'test_condition',
    begin: '', end: '',
    contains: [QUOTE_STRING, APOS_STRING, VAR1, VAR2],
    keywords: {
      literal: BASH_LITERAL
    },
    relevance: 0
  };

  return {
    keywords: {
      keyword: 'if then else fi for break continue while in do done echo exit return set declare',
      literal: BASH_LITERAL
    },
    contains: [
      {
        className: 'shebang',
        begin: '(#!\\/bin\\/bash)|(#!\\/bin\\/sh)',
        relevance: 10
      },
      VAR1,
      VAR2,
      hljs.HASH_COMMENT_MODE,
      QUOTE_STRING,
      APOS_STRING,
      hljs.inherit(TEST_CONDITION, {begin: '\\[ ', end: ' \\]', relevance: 0}),
      hljs.inherit(TEST_CONDITION, {begin: '\\[\\[ ', end: ' \\]\\]'})
    ]
  };
}
},{name:"java",create:/*
Language: Java
Author: Vsevolod Solovyov <vsevolod.solovyov@gmail.com>
*/

function(hljs) {
  return {
    keywords:
      'false synchronized int abstract float private char boolean static null if const ' +
      'for true while long throw strictfp finally protected import native final return void ' +
      'enum else break transient new catch instanceof byte super volatile case assert short ' +
      'package default double public try this switch continue throws',
    contains: [
      {
        className: 'javadoc',
        begin: '/\\*\\*', end: '\\*/',
        contains: [{
          className: 'javadoctag', begin: '@[A-Za-z]+'
        }],
        relevance: 10
      },
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      hljs.APOS_STRING_MODE,
      hljs.QUOTE_STRING_MODE,
      {
        className: 'class',
        beginWithKeyword: true, end: '{',
        keywords: 'class interface',
        illegal: ':',
        contains: [
          {
            beginWithKeyword: true,
            keywords: 'extends implements',
            relevance: 10
          },
          {
            className: 'title',
            begin: hljs.UNDERSCORE_IDENT_RE
          }
        ]
      },
      hljs.C_NUMBER_MODE,
      {
        className: 'annotation', begin: '@[A-Za-z]+'
      }
    ]
  };
}
},{name:"php",create:/*
Language: PHP
Author: Victor Karamzin <Victor.Karamzin@enterra-inc.com>
Contributors: Evgeny Stepanischev <imbolk@gmail.com>, Ivan Sagalaev <maniac@softwaremaniacs.org>
*/

function(hljs) {
  var VARIABLE = {
    className: 'variable', begin: '\\$+[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*'
  };
  var STRINGS = [
    hljs.inherit(hljs.APOS_STRING_MODE, {illegal: null}),
    hljs.inherit(hljs.QUOTE_STRING_MODE, {illegal: null}),
    {
      className: 'string',
      begin: 'b"', end: '"',
      contains: [hljs.BACKSLASH_ESCAPE]
    },
    {
      className: 'string',
      begin: 'b\'', end: '\'',
      contains: [hljs.BACKSLASH_ESCAPE]
    }
  ];
  var NUMBERS = [hljs.BINARY_NUMBER_MODE, hljs.C_NUMBER_MODE];
  var TITLE = {
    className: 'title', begin: hljs.UNDERSCORE_IDENT_RE
  };
  return {
    case_insensitive: true,
    keywords:
      'and include_once list abstract global private echo interface as static endswitch ' +
      'array null if endwhile or const for endforeach self var while isset public ' +
      'protected exit foreach throw elseif include __FILE__ empty require_once do xor ' +
      'return implements parent clone use __CLASS__ __LINE__ else break print eval new ' +
      'catch __METHOD__ case exception php_user_filter default die require __FUNCTION__ ' +
      'enddeclare final try this switch continue endfor endif declare unset true false ' +
      'namespace trait goto instanceof insteadof __DIR__ __NAMESPACE__ __halt_compiler',
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.HASH_COMMENT_MODE,
      {
        className: 'comment',
        begin: '/\\*', end: '\\*/',
        contains: [{
            className: 'phpdoc',
            begin: '\\s@[A-Za-z]+'
        }]
      },
      {
          className: 'comment',
          excludeBegin: true,
          begin: '__halt_compiler.+?;', endsWithParent: true
      },
      {
        className: 'string',
        begin: '<<<[\'"]?\\w+[\'"]?$', end: '^\\w+;',
        contains: [hljs.BACKSLASH_ESCAPE]
      },
      {
        className: 'preprocessor',
        begin: '<\\?php',
        relevance: 10
      },
      {
        className: 'preprocessor',
        begin: '\\?>'
      },
      VARIABLE,
      {
        className: 'function',
        beginWithKeyword: true, end: '{',
        keywords: 'function',
        illegal: '\\$|\\[|%',
        contains: [
          TITLE,
          {
            className: 'params',
            begin: '\\(', end: '\\)',
            contains: [
              'self',
              VARIABLE,
              hljs.C_BLOCK_COMMENT_MODE
            ].concat(STRINGS).concat(NUMBERS)
          }
        ]
      },
      {
        className: 'class',
        beginWithKeyword: true, end: '{',
        keywords: 'class',
        illegal: '[:\\(\\$]',
        contains: [
          {
            beginWithKeyword: true, endsWithParent: true,
            keywords: 'extends',
            contains: [TITLE]
          },
          TITLE
        ]
      },
      {
        begin: '=>' // No markup, just a relevance booster
      }
    ].concat(STRINGS).concat(NUMBERS)
  };
}
},{name:"perl",create:/*
Language: Perl
Author: Peter Leonov <gojpeg@yandex.ru>
*/

function(hljs) {
  var PERL_KEYWORDS = 'getpwent getservent quotemeta msgrcv scalar kill dbmclose undef lc ' +
    'ma syswrite tr send umask sysopen shmwrite vec qx utime local oct semctl localtime ' +
    'readpipe do return format read sprintf dbmopen pop getpgrp not getpwnam rewinddir qq' +
    'fileno qw endprotoent wait sethostent bless s|0 opendir continue each sleep endgrent ' +
    'shutdown dump chomp connect getsockname die socketpair close flock exists index shmget' +
    'sub for endpwent redo lstat msgctl setpgrp abs exit select print ref gethostbyaddr ' +
    'unshift fcntl syscall goto getnetbyaddr join gmtime symlink semget splice x|0 ' +
    'getpeername recv log setsockopt cos last reverse gethostbyname getgrnam study formline ' +
    'endhostent times chop length gethostent getnetent pack getprotoent getservbyname rand ' +
    'mkdir pos chmod y|0 substr endnetent printf next open msgsnd readdir use unlink ' +
    'getsockopt getpriority rindex wantarray hex system getservbyport endservent int chr ' +
    'untie rmdir prototype tell listen fork shmread ucfirst setprotoent else sysseek link ' +
    'getgrgid shmctl waitpid unpack getnetbyname reset chdir grep split require caller ' +
    'lcfirst until warn while values shift telldir getpwuid my getprotobynumber delete and ' +
    'sort uc defined srand accept package seekdir getprotobyname semop our rename seek if q|0 ' +
    'chroot sysread setpwent no crypt getc chown sqrt write setnetent setpriority foreach ' +
    'tie sin msgget map stat getlogin unless elsif truncate exec keys glob tied closedir' +
    'ioctl socket readlink eval xor readline binmode setservent eof ord bind alarm pipe ' +
    'atan2 getgrent exp time push setgrent gt lt or ne m|0 break given say state when';
  var SUBST = {
    className: 'subst',
    begin: '[$@]\\{', end: '\\}',
    keywords: PERL_KEYWORDS,
    relevance: 10
  };
  var VAR1 = {
    className: 'variable',
    begin: '\\$\\d'
  };
  var VAR2 = {
    className: 'variable',
    begin: '[\\$\\%\\@\\*](\\^\\w\\b|#\\w+(\\:\\:\\w+)*|[^\\s\\w{]|{\\w+}|\\w+(\\:\\:\\w*)*)'
  };
  var STRING_CONTAINS = [hljs.BACKSLASH_ESCAPE, SUBST, VAR1, VAR2];
  var METHOD = {
    begin: '->',
    contains: [
      {begin: hljs.IDENT_RE},
      {begin: '{', end: '}'}
    ]
  };
  var COMMENT = {
    className: 'comment',
    begin: '^(__END__|__DATA__)', end: '\\n$',
    relevance: 5
  }
  var PERL_DEFAULT_CONTAINS = [
    VAR1, VAR2,
    hljs.HASH_COMMENT_MODE,
    COMMENT,
    {
      className: 'comment',
      begin: '^\\=\\w', end: '\\=cut', endsWithParent: true
    },
    METHOD,
    {
      className: 'string',
      begin: 'q[qwxr]?\\s*\\(', end: '\\)',
      contains: STRING_CONTAINS,
      relevance: 5
    },
    {
      className: 'string',
      begin: 'q[qwxr]?\\s*\\[', end: '\\]',
      contains: STRING_CONTAINS,
      relevance: 5
    },
    {
      className: 'string',
      begin: 'q[qwxr]?\\s*\\{', end: '\\}',
      contains: STRING_CONTAINS,
      relevance: 5
    },
    {
      className: 'string',
      begin: 'q[qwxr]?\\s*\\|', end: '\\|',
      contains: STRING_CONTAINS,
      relevance: 5
    },
    {
      className: 'string',
      begin: 'q[qwxr]?\\s*\\<', end: '\\>',
      contains: STRING_CONTAINS,
      relevance: 5
    },
    {
      className: 'string',
      begin: 'qw\\s+q', end: 'q',
      contains: STRING_CONTAINS,
      relevance: 5
    },
    {
      className: 'string',
      begin: '\'', end: '\'',
      contains: [hljs.BACKSLASH_ESCAPE],
      relevance: 0
    },
    {
      className: 'string',
      begin: '"', end: '"',
      contains: STRING_CONTAINS,
      relevance: 0
    },
    {
      className: 'string',
      begin: '`', end: '`',
      contains: [hljs.BACKSLASH_ESCAPE]
    },
    {
      className: 'string',
      begin: '{\\w+}',
      relevance: 0
    },
    {
      className: 'string',
      begin: '\-?\\w+\\s*\\=\\>',
      relevance: 0
    },
    {
      className: 'number',
      begin: '(\\b0[0-7_]+)|(\\b0x[0-9a-fA-F_]+)|(\\b[1-9][0-9_]*(\\.[0-9_]+)?)|[0_]\\b',
      relevance: 0
    },
    { // regexp container
      begin: '(' + hljs.RE_STARTERS_RE + '|\\b(split|return|print|reverse|grep)\\b)\\s*',
      keywords: 'split return print reverse grep',
      relevance: 0,
      contains: [
        hljs.HASH_COMMENT_MODE,
        COMMENT,
        {
          className: 'regexp',
          begin: '(s|tr|y)/(\\\\.|[^/])*/(\\\\.|[^/])*/[a-z]*',
          relevance: 10
        },
        {
          className: 'regexp',
          begin: '(m|qr)?/', end: '/[a-z]*',
          contains: [hljs.BACKSLASH_ESCAPE],
          relevance: 0 // allows empty "//" which is a common comment delimiter in other languages
        }
      ]
    },
    {
      className: 'sub',
      beginWithKeyword: true, end: '(\\s*\\(.*?\\))?[;{]',
      keywords: 'sub',
      relevance: 5
    },
    {
      className: 'operator',
      begin: '-\\w\\b',
      relevance: 0
    }
  ];
  SUBST.contains = PERL_DEFAULT_CONTAINS;
  METHOD.contains[1].contains = PERL_DEFAULT_CONTAINS;

  return {
    keywords: PERL_KEYWORDS,
    contains: PERL_DEFAULT_CONTAINS
  };
}
},{name:"cpp",create:/*
Language: C++
Contributors: Evgeny Stepanischev <imbolk@gmail.com>
*/

function(hljs) {
  var CPP_KEYWORDS = {
    keyword: 'false int float while private char catch export virtual operator sizeof ' +
      'dynamic_cast|10 typedef const_cast|10 const struct for static_cast|10 union namespace ' +
      'unsigned long throw volatile static protected bool template mutable if public friend ' +
      'do return goto auto void enum else break new extern using true class asm case typeid ' +
      'short reinterpret_cast|10 default double register explicit signed typename try this ' +
      'switch continue wchar_t inline delete alignof char16_t char32_t constexpr decltype ' +
      'noexcept nullptr static_assert thread_local restrict _Bool complex',
    built_in: 'std string cin cout cerr clog stringstream istringstream ostringstream ' +
      'auto_ptr deque list queue stack vector map set bitset multiset multimap unordered_set ' +
      'unordered_map unordered_multiset unordered_multimap array shared_ptr'
  };
  return {
    keywords: CPP_KEYWORDS,
    illegal: '</',
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      hljs.QUOTE_STRING_MODE,
      {
        className: 'string',
        begin: '\'\\\\?.', end: '\'',
        illegal: '.'
      },
      {
        className: 'number',
        begin: '\\b(\\d+(\\.\\d*)?|\\.\\d+)(u|U|l|L|ul|UL|f|F)'
      },
      hljs.C_NUMBER_MODE,
      {
        className: 'preprocessor',
        begin: '#', end: '$'
      },
      {
        className: 'stl_container',
        begin: '\\b(deque|list|queue|stack|vector|map|set|bitset|multiset|multimap|unordered_map|unordered_set|unordered_multiset|unordered_multimap|array)\\s*<', end: '>',
        keywords: CPP_KEYWORDS,
        relevance: 10,
        contains: ['self']
      }
    ]
  };
}
},{name:"objectivec",create:/*
Language: Objective C
Author: Valerii Hiora <valerii.hiora@gmail.com>
Contributors: Angel G. Olloqui <angelgarcia.mail@gmail.com>
*/

function(hljs) {
  var OBJC_KEYWORDS = {
    keyword:
      'int float while private char catch export sizeof typedef const struct for union ' +
      'unsigned long volatile static protected bool mutable if public do return goto void ' +
      'enum else break extern class asm case short default double throw register explicit ' +
      'signed typename try this switch continue wchar_t inline readonly assign property ' +
      'protocol self synchronized end synthesize id optional required implementation ' +
      'nonatomic interface super unichar finally dynamic IBOutlet IBAction selector strong ' +
      'weak readonly',
    literal:
    	'false true FALSE TRUE nil YES NO NULL',
    built_in:
      'NSString NSDictionary CGRect CGPoint UIButton UILabel UITextView UIWebView MKMapView ' +
      'UISegmentedControl NSObject UITableViewDelegate UITableViewDataSource NSThread ' +
      'UIActivityIndicator UITabbar UIToolBar UIBarButtonItem UIImageView NSAutoreleasePool ' +
      'UITableView BOOL NSInteger CGFloat NSException NSLog NSMutableString NSMutableArray ' +
      'NSMutableDictionary NSURL NSIndexPath CGSize UITableViewCell UIView UIViewController ' +
      'UINavigationBar UINavigationController UITabBarController UIPopoverController ' +
      'UIPopoverControllerDelegate UIImage NSNumber UISearchBar NSFetchedResultsController ' +
      'NSFetchedResultsChangeType UIScrollView UIScrollViewDelegate UIEdgeInsets UIColor ' +
      'UIFont UIApplication NSNotFound NSNotificationCenter NSNotification ' +
      'UILocalNotification NSBundle NSFileManager NSTimeInterval NSDate NSCalendar ' +
      'NSUserDefaults UIWindow NSRange NSArray NSError NSURLRequest NSURLConnection class ' +
      'UIInterfaceOrientation MPMoviePlayerController dispatch_once_t ' +
      'dispatch_queue_t dispatch_sync dispatch_async dispatch_once'
  };
  return {
    keywords: OBJC_KEYWORDS,
    illegal: '</',
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      hljs.C_NUMBER_MODE,
      hljs.QUOTE_STRING_MODE,
      {
        className: 'string',
        begin: '\'',
        end: '[^\\\\]\'',
        illegal: '[^\\\\][^\']'
      },

      {
        className: 'preprocessor',
        begin: '#import',
        end: '$',
        contains: [
        {
          className: 'title',
          begin: '\"',
          end: '\"'
        },
        {
          className: 'title',
          begin: '<',
          end: '>'
        }
        ]
      },
      {
        className: 'preprocessor',
        begin: '#',
        end: '$'
      },
      {
        className: 'class',
        beginWithKeyword: true,
        end: '({|$)',
        keywords: 'interface class protocol implementation',
        contains: [{
          className: 'id',
          begin: hljs.UNDERSCORE_IDENT_RE
        }
        ]
      },
      {
        className: 'variable',
        begin: '\\.'+hljs.UNDERSCORE_IDENT_RE
      }
    ]
  };
}
},{name:"cs",create:/*
Language: C#
Author: Jason Diamond <jason@diamond.name>
*/

function(hljs) {
  return {
    keywords:
      // Normal keywords.
      'abstract as base bool break byte case catch char checked class const continue decimal ' +
      'default delegate do double else enum event explicit extern false finally fixed float ' +
      'for foreach goto if implicit in int interface internal is lock long namespace new null ' +
      'object operator out override params private protected public readonly ref return sbyte ' +
      'sealed short sizeof stackalloc static string struct switch this throw true try typeof ' +
      'uint ulong unchecked unsafe ushort using virtual volatile void while ' +
      // Contextual keywords.
      'ascending descending from get group into join let orderby partial select set value var '+
      'where yield',
    contains: [
      {
        className: 'comment',
        begin: '///', end: '$', returnBegin: true,
        contains: [
          {
            className: 'xmlDocTag',
            begin: '///|<!--|-->'
          },
          {
            className: 'xmlDocTag',
            begin: '</?', end: '>'
          }
        ]
      },
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      {
        className: 'preprocessor',
        begin: '#', end: '$',
        keywords: 'if else elif endif define undef warning error line region endregion pragma checksum'
      },
      {
        className: 'string',
        begin: '@"', end: '"',
        contains: [{begin: '""'}]
      },
      hljs.APOS_STRING_MODE,
      hljs.QUOTE_STRING_MODE,
      hljs.C_NUMBER_MODE
    ]
  };
}
},{name:"sql",create:/*
Language: SQL
*/

function(hljs) {
  return {
    case_insensitive: true,
    illegal: '[^\\s]',
    contains: [
      {
        className: 'operator',
        begin: '(begin|start|commit|rollback|savepoint|lock|alter|create|drop|rename|call|delete|do|handler|insert|load|replace|select|truncate|update|set|show|pragma|grant)\\b', end: ';', endsWithParent: true,
        keywords: {
          keyword: 'all partial global month current_timestamp using go revoke smallint ' +
            'indicator end-exec disconnect zone with character assertion to add current_user ' +
            'usage input local alter match collate real then rollback get read timestamp ' +
            'session_user not integer bit unique day minute desc insert execute like ilike|2 ' +
            'level decimal drop continue isolation found where constraints domain right ' +
            'national some module transaction relative second connect escape close system_user ' +
            'for deferred section cast current sqlstate allocate intersect deallocate numeric ' +
            'public preserve full goto initially asc no key output collation group by union ' +
            'session both last language constraint column of space foreign deferrable prior ' +
            'connection unknown action commit view or first into float year primary cascaded ' +
            'except restrict set references names table outer open select size are rows from ' +
            'prepare distinct leading create only next inner authorization schema ' +
            'corresponding option declare precision immediate else timezone_minute external ' +
            'varying translation true case exception join hour default double scroll value ' +
            'cursor descriptor values dec fetch procedure delete and false int is describe ' +
            'char as at in varchar null trailing any absolute current_time end grant ' +
            'privileges when cross check write current_date pad begin temporary exec time ' +
            'update catalog user sql date on identity timezone_hour natural whenever interval ' +
            'work order cascade diagnostics nchar having left call do handler load replace ' +
            'truncate start lock show pragma',
          aggregate: 'count sum min max avg'
        },
        contains: [
          {
            className: 'string',
            begin: '\'', end: '\'',
            contains: [hljs.BACKSLASH_ESCAPE, {begin: '\'\''}],
            relevance: 0
          },
          {
            className: 'string',
            begin: '"', end: '"',
            contains: [hljs.BACKSLASH_ESCAPE, {begin: '""'}],
            relevance: 0
          },
          {
            className: 'string',
            begin: '`', end: '`',
            contains: [hljs.BACKSLASH_ESCAPE]
          },
          hljs.C_NUMBER_MODE
        ]
      },
      hljs.C_BLOCK_COMMENT_MODE,
      {
        className: 'comment',
        begin: '--', end: '$'
      }
    ]
  };
}
},{name:"xml",create:/*
Language: HTML, XML
*/

function(hljs) {
  var XML_IDENT_RE = '[A-Za-z0-9\\._:-]+';
  var TAG_INTERNALS = {
    endsWithParent: true,
    contains: [
      {
        className: 'attribute',
        begin: XML_IDENT_RE,
        relevance: 0
      },
      {
        begin: '="', returnBegin: true, end: '"',
        contains: [{
            className: 'value',
            begin: '"', endsWithParent: true
        }]
      },
      {
        begin: '=\'', returnBegin: true, end: '\'',
        contains: [{
          className: 'value',
          begin: '\'', endsWithParent: true
        }]
      },
      {
        begin: '=',
        contains: [{
          className: 'value',
          begin: '[^\\s/>]+'
        }]
      }
    ]
  };
  return {
    case_insensitive: true,
    contains: [
      {
        className: 'pi',
        begin: '<\\?', end: '\\?>',
        relevance: 10
      },
      {
        className: 'doctype',
        begin: '<!DOCTYPE', end: '>',
        relevance: 10,
        contains: [{begin: '\\[', end: '\\]'}]
      },
      {
        className: 'comment',
        begin: '<!--', end: '-->',
        relevance: 10
      },
      {
        className: 'cdata',
        begin: '<\\!\\[CDATA\\[', end: '\\]\\]>',
        relevance: 10
      },
      {
        className: 'tag',
        /*
        The lookahead pattern (?=...) ensures that 'begin' only matches
        '<style' as a single word, followed by a whitespace or an
        ending braket. The '$' is needed for the lexem to be recognized
        by hljs.subMode() that tests lexems outside the stream.
        */
        begin: '<style(?=\\s|>|$)', end: '>',
        keywords: {title: 'style'},
        contains: [TAG_INTERNALS],
        starts: {
          end: '</style>', returnEnd: true,
          subLanguage: 'css'
        }
      },
      {
        className: 'tag',
        // See the comment in the <style tag about the lookahead pattern
        begin: '<script(?=\\s|>|$)', end: '>',
        keywords: {title: 'script'},
        contains: [TAG_INTERNALS],
        starts: {
          end: '</script>', returnEnd: true,
          subLanguage: 'javascript'
        }
      },
      {
        begin: '<%', end: '%>',
        subLanguage: 'vbscript'
      },
      {
        className: 'tag',
        begin: '</?', end: '/?>',
        contains: [
          {
            className: 'title', begin: '[^ />]+'
          },
          TAG_INTERNALS
        ]
      }
    ]
  };
}
},{name:"css",create:/*
Language: CSS
*/

function(hljs) {
  var FUNCTION = {
    className: 'function',
    begin: hljs.IDENT_RE + '\\(', end: '\\)',
    contains: [hljs.NUMBER_MODE, hljs.APOS_STRING_MODE, hljs.QUOTE_STRING_MODE]
  };
  return {
    case_insensitive: true,
    illegal: '[=/|\']',
    contains: [
      hljs.C_BLOCK_COMMENT_MODE,
      {
        className: 'id', begin: '\\#[A-Za-z0-9_-]+'
      },
      {
        className: 'class', begin: '\\.[A-Za-z0-9_-]+',
        relevance: 0
      },
      {
        className: 'attr_selector',
        begin: '\\[', end: '\\]',
        illegal: '$'
      },
      {
        className: 'pseudo',
        begin: ':(:)?[a-zA-Z0-9\\_\\-\\+\\(\\)\\"\\\']+'
      },
      {
        className: 'at_rule',
        begin: '@(font-face|page)',
        lexems: '[a-z-]+',
        keywords: 'font-face page'
      },
      {
        className: 'at_rule',
        begin: '@', end: '[{;]', // at_rule eating first "{" is a good thing
                                 // because it doesn’t let it to be parsed as
                                 // a rule set but instead drops parser into
                                 // the default mode which is how it should be.
        excludeEnd: true,
        keywords: 'import page media charset',
        contains: [
          FUNCTION,
          hljs.APOS_STRING_MODE, hljs.QUOTE_STRING_MODE,
          hljs.NUMBER_MODE
        ]
      },
      {
        className: 'tag', begin: hljs.IDENT_RE,
        relevance: 0
      },
      {
        className: 'rules',
        begin: '{', end: '}',
        illegal: '[^\\s]',
        relevance: 0,
        contains: [
          hljs.C_BLOCK_COMMENT_MODE,
          {
            className: 'rule',
            begin: '[^\\s]', returnBegin: true, end: ';', endsWithParent: true,
            contains: [
              {
                className: 'attribute',
                begin: '[A-Z\\_\\.\\-]+', end: ':',
                excludeEnd: true,
                illegal: '[^\\s]',
                starts: {
                  className: 'value',
                  endsWithParent: true, excludeEnd: true,
                  contains: [
                    FUNCTION,
                    hljs.NUMBER_MODE,
                    hljs.QUOTE_STRING_MODE,
                    hljs.APOS_STRING_MODE,
                    hljs.C_BLOCK_COMMENT_MODE,
                    {
                      className: 'hexcolor', begin: '\\#[0-9A-F]+'
                    },
                    {
                      className: 'important', begin: '!important'
                    }
                  ]
                }
              }
            ]
          }
        ]
      }
    ]
  };
}
},{name:"scala",create:/*
Language: Scala
Author: Jan Berkel <jan.berkel@gmail.com>
*/

function(hljs) {
  var ANNOTATION = {
    className: 'annotation', begin: '@[A-Za-z]+'
  };
  var STRING = {
    className: 'string',
    begin: 'u?r?"""', end: '"""',
    relevance: 10
  };
  return {
    keywords:
      'type yield lazy override def with val var false true sealed abstract private trait ' +
      'object null if for while throw finally protected extends import final return else ' +
      'break new catch super class case package default try this match continue throws',
    contains: [
      {
        className: 'javadoc',
        begin: '/\\*\\*', end: '\\*/',
        contains: [{
          className: 'javadoctag',
          begin: '@[A-Za-z]+'
        }],
        relevance: 10
      },
      hljs.C_LINE_COMMENT_MODE, hljs.C_BLOCK_COMMENT_MODE,
      hljs.APOS_STRING_MODE, hljs.QUOTE_STRING_MODE, STRING,
      {
        className: 'class',
        begin: '((case )?class |object |trait )', end: '({|$)', // beginWithKeyword won't work because a single "case" shouldn't start this mode
        illegal: ':',
        keywords: 'case class trait object',
        contains: [
          {
            beginWithKeyword: true,
            keywords: 'extends with',
            relevance: 10
          },
          {
            className: 'title',
            begin: hljs.UNDERSCORE_IDENT_RE
          },
          {
            className: 'params',
            begin: '\\(', end: '\\)',
            contains: [
              hljs.APOS_STRING_MODE, hljs.QUOTE_STRING_MODE, STRING,
              ANNOTATION
            ]
          }
        ]
      },
      hljs.C_NUMBER_MODE,
      ANNOTATION
    ]
  };
}
},{name:"coffeescript",create:/*
Language: CoffeeScript
Author: Dmytrii Nagirniak <dnagir@gmail.com>
Contributors: Oleg Efimov <efimovov@gmail.com>
Description: CoffeeScript is a programming language that transcompiles to JavaScript. For info about language see http://coffeescript.org/
*/

function(hljs) {
  var KEYWORDS = {
    keyword:
      // JS keywords
      'in if for while finally new do return else break catch instanceof throw try this ' +
      'switch continue typeof delete debugger super ' +
      // Coffee keywords
      'then unless until loop of by when and or is isnt not',
    literal:
      // JS literals
      'true false null undefined ' +
      // Coffee literals
      'yes no on off ',
    reserved: 'case default function var void with const let enum export import native ' +
      '__hasProp __extends __slice __bind __indexOf'
  };
  var JS_IDENT_RE = '[A-Za-z$_][0-9A-Za-z$_]*';
  var TITLE = {className: 'title', begin: JS_IDENT_RE};
  var SUBST = {
    className: 'subst',
    begin: '#\\{', end: '}',
    keywords: KEYWORDS,
    contains: [hljs.BINARY_NUMBER_MODE, hljs.C_NUMBER_MODE]
  };

  return {
    keywords: KEYWORDS,
    contains: [
      // Numbers
      hljs.BINARY_NUMBER_MODE,
      hljs.C_NUMBER_MODE,
      // Strings
      hljs.APOS_STRING_MODE,
      {
        className: 'string',
        begin: '"""', end: '"""',
        contains: [hljs.BACKSLASH_ESCAPE, SUBST]
      },
      {
        className: 'string',
        begin: '"', end: '"',
        contains: [hljs.BACKSLASH_ESCAPE, SUBST],
        relevance: 0
      },
      // Comments
      {
        className: 'comment',
        begin: '###', end: '###'
      },
      hljs.HASH_COMMENT_MODE,
      {
        className: 'regexp',
        begin: '///', end: '///',
        contains: [hljs.HASH_COMMENT_MODE]
      },
      {
        className: 'regexp', begin: '//[gim]*'
      },
      {
        className: 'regexp',
        begin: '/\\S(\\\\.|[^\\n])*/[gim]*' // \S is required to parse x / 2 / 3 as two divisions
      },
      {
        begin: '`', end: '`',
        excludeBegin: true, excludeEnd: true,
        subLanguage: 'javascript'
      },
      {
        className: 'function',
        begin: JS_IDENT_RE + '\\s*=\\s*(\\(.+\\))?\\s*[-=]>',
        returnBegin: true,
        contains: [
          TITLE,
          {
            className: 'params',
            begin: '\\(', end: '\\)'
          }
        ]
      },
      {
        className: 'class',
        beginWithKeyword: true, keywords: 'class',
        end: '$',
        illegal: ':',
        contains: [
          {
            beginWithKeyword: true, keywords: 'extends',
            endsWithParent: true,
            illegal: ':',
            contains: [TITLE]
          },
          TITLE
        ]
      },
      {
        className: 'property',
        begin: '@' + JS_IDENT_RE
      }
    ]
  };
}
},{name:"lisp",create:/*
Language: Lisp
Description: Generic lisp syntax
Author: Vasily Polovnyov <vast@whiteants.net>
*/

function(hljs) {
  var LISP_IDENT_RE = '[a-zA-Z_\\-\\+\\*\\/\\<\\=\\>\\&\\#][a-zA-Z0-9_\\-\\+\\*\\/\\<\\=\\>\\&\\#]*';
  var LISP_SIMPLE_NUMBER_RE = '(\\-|\\+)?\\d+(\\.\\d+|\\/\\d+)?((d|e|f|l|s)(\\+|\\-)?\\d+)?';
  var LITERAL = {
    className: 'literal',
    begin: '\\b(t{1}|nil)\\b'
  };
  var NUMBERS = [
    {
      className: 'number', begin: LISP_SIMPLE_NUMBER_RE
    },
    {
      className: 'number', begin: '#b[0-1]+(/[0-1]+)?'
    },
    {
      className: 'number', begin: '#o[0-7]+(/[0-7]+)?'
    },
    {
      className: 'number', begin: '#x[0-9a-f]+(/[0-9a-f]+)?'
    },
    {
      className: 'number', begin: '#c\\(' + LISP_SIMPLE_NUMBER_RE + ' +' + LISP_SIMPLE_NUMBER_RE, end: '\\)'
    }
  ]
  var STRING = {
    className: 'string',
    begin: '"', end: '"',
    contains: [hljs.BACKSLASH_ESCAPE],
    relevance: 0
  };
  var COMMENT = {
    className: 'comment',
    begin: ';', end: '$'
  };
  var VARIABLE = {
    className: 'variable',
    begin: '\\*', end: '\\*'
  };
  var KEYWORD = {
    className: 'keyword',
    begin: '[:&]' + LISP_IDENT_RE
  };
  var QUOTED_LIST = {
    begin: '\\(', end: '\\)',
    contains: ['self', LITERAL, STRING].concat(NUMBERS)
  };
  var QUOTED1 = {
    className: 'quoted',
    begin: '[\'`]\\(', end: '\\)',
    contains: NUMBERS.concat([STRING, VARIABLE, KEYWORD, QUOTED_LIST])
  };
  var QUOTED2 = {
    className: 'quoted',
    begin: '\\(quote ', end: '\\)',
    keywords: {title: 'quote'},
    contains: NUMBERS.concat([STRING, VARIABLE, KEYWORD, QUOTED_LIST])
  };
  var LIST = {
    className: 'list',
    begin: '\\(', end: '\\)'
  };
  var BODY = {
    className: 'body',
    endsWithParent: true, excludeEnd: true
  };
  LIST.contains = [{className: 'title', begin: LISP_IDENT_RE}, BODY];
  BODY.contains = [QUOTED1, QUOTED2, LIST, LITERAL].concat(NUMBERS).concat([STRING, COMMENT, VARIABLE, KEYWORD]);

  return {
    illegal: '[^\\s]',
    contains: NUMBERS.concat([
      LITERAL,
      STRING,
      COMMENT,
      QUOTED1, QUOTED2,
      LIST
    ])
  };
}
},{name:"clojure",create:/*
Language: Clojure
Description: Clojure syntax (based on lisp.js)
Author: mfornos
*/

function(hljs) {
  var keywords = {
    built_in:
      // Clojure keywords
      'def cond apply if-not if-let if not not= = &lt; < > &lt;= <= >= == + / * - rem '+
      'quot neg? pos? delay? symbol? keyword? true? false? integer? empty? coll? list? '+
      'set? ifn? fn? associative? sequential? sorted? counted? reversible? number? decimal? '+
      'class? distinct? isa? float? rational? reduced? ratio? odd? even? char? seq? vector? '+
      'string? map? nil? contains? zero? instance? not-every? not-any? libspec? -> ->> .. . '+
      'inc compare do dotimes mapcat take remove take-while drop letfn drop-last take-last '+
      'drop-while while intern condp case reduced cycle split-at split-with repeat replicate '+
      'iterate range merge zipmap declare line-seq sort comparator sort-by dorun doall nthnext '+
      'nthrest partition eval doseq await await-for let agent atom send send-off release-pending-sends '+
      'add-watch mapv filterv remove-watch agent-error restart-agent set-error-handler error-handler '+
      'set-error-mode! error-mode shutdown-agents quote var fn loop recur throw try monitor-enter '+
      'monitor-exit defmacro defn defn- macroexpand macroexpand-1 for doseq dosync dotimes and or '+
      'when when-not when-let comp juxt partial sequence memoize constantly complement identity assert '+
      'peek pop doto proxy defstruct first rest cons defprotocol cast coll deftype defrecord last butlast '+
      'sigs reify second ffirst fnext nfirst nnext defmulti defmethod meta with-meta ns in-ns create-ns import '+
      'intern refer keys select-keys vals key val rseq name namespace promise into transient persistent! conj! '+
      'assoc! dissoc! pop! disj! import use class type num float double short byte boolean bigint biginteger '+
      'bigdec print-method print-dup throw-if throw printf format load compile get-in update-in pr pr-on newline '+
      'flush read slurp read-line subvec with-open memfn time ns assert re-find re-groups rand-int rand mod locking '+
      'assert-valid-fdecl alias namespace resolve ref deref refset swap! reset! set-validator! compare-and-set! alter-meta! '+
      'reset-meta! commute get-validator alter ref-set ref-history-count ref-min-history ref-max-history ensure sync io! '+
      'new next conj set! memfn to-array future future-call into-array aset gen-class reduce merge map filter find empty '+
      'hash-map hash-set sorted-map sorted-map-by sorted-set sorted-set-by vec vector seq flatten reverse assoc dissoc list '+
      'disj get union difference intersection extend extend-type extend-protocol int nth delay count concat chunk chunk-buffer '+
      'chunk-append chunk-first chunk-rest max min dec unchecked-inc-int unchecked-inc unchecked-dec-inc unchecked-dec unchecked-negate '+
      'unchecked-add-int unchecked-add unchecked-subtract-int unchecked-subtract chunk-next chunk-cons chunked-seq? prn vary-meta '+
      'lazy-seq spread list* str find-keyword keyword symbol gensym force rationalize'
   };

  var CLJ_IDENT_RE = '[a-zA-Z_0-9\\!\\.\\?\\-\\+\\*\\/\\<\\=\\>\\&\\#\\$\';]+';
  var SIMPLE_NUMBER_RE = '[\\s:\\(\\{]+\\d+(\\.\\d+)?';

  var NUMBER = {
    className: 'number', begin: SIMPLE_NUMBER_RE,
    relevance: 0
  };
  var STRING = {
    className: 'string',
    begin: '"', end: '"',
    contains: [hljs.BACKSLASH_ESCAPE],
    relevance: 0
  };
  var COMMENT = {
    className: 'comment',
    begin: ';', end: '$',
    relevance: 0
  };
  var COLLECTION = {
    className: 'collection',
    begin: '[\\[\\{]', end: '[\\]\\}]'
  };
  var HINT = {
    className: 'comment',
    begin: '\\^' + CLJ_IDENT_RE
  };
  var HINT_COL = {
    className: 'comment',
    begin: '\\^\\{', end: '\\}'
  };
  var KEY = {
    className: 'attribute',
    begin: '[:]' + CLJ_IDENT_RE
  };
  var LIST = {
    className: 'list',
    begin: '\\(', end: '\\)',
    relevance: 0
  };
  var BODY = {
    endsWithParent: true, excludeEnd: true,
    keywords: {literal: 'true false nil'},
    relevance: 0
  };
  var TITLE = {
    keywords: keywords,
    lexems: CLJ_IDENT_RE,
    className: 'title', begin: CLJ_IDENT_RE,
    starts: BODY
  };

  LIST.contains = [{className: 'comment', begin: 'comment'}, TITLE];
  BODY.contains = [LIST, STRING, HINT, HINT_COL, COMMENT, KEY, COLLECTION, NUMBER];
  COLLECTION.contains = [LIST, STRING, HINT, COMMENT, KEY, COLLECTION, NUMBER];

  return {
    illegal: '\\S',
    contains: [
      COMMENT,
      LIST
    ]
  }
}
},{name:"http",create:/*
  Language: HTTP
  Description: HTTP request and response headers with automatic body highlighting
  Author: Ivan Sagalaev <maniac@softwaremaniacs.org>
*/

function(hljs) {
  return {
    illegal: '\\S',
    contains: [
      {
        className: 'status',
        begin: '^HTTP/[0-9\\.]+', end: '$',
        contains: [{className: 'number', begin: '\\b\\d{3}\\b'}]
      },
      {
        className: 'request',
        begin: '^[A-Z]+ (.*?) HTTP/[0-9\\.]+$', returnBegin: true, end: '$',
        contains: [
          {
            className: 'string',
            begin: ' ', end: ' ',
            excludeBegin: true, excludeEnd: true
          }
        ]
      },
      {
        className: 'attribute',
        begin: '^\\w', end: ': ', excludeEnd: true,
        illegal: '\\n|\\s|=',
        starts: {className: 'string', end: '$'}
      },
      {
        begin: '\\n\\n',
        starts: {subLanguage: '', endsWithParent: true}
      }
    ]
  };
}
}]
  ;

for (var i = 0; i < languages.length; ++i) {
  hljs.LANGUAGES[languages[i].name] = languages[i].create(hljs);
}

module.exports = {
  styles: {"far":".hljs-far{}.hljs-far pre code{display:block;padding:0.5em;background:#000080;}.hljs-far pre code,.hljs-far pre .subst{color:#0FF;}.hljs-far pre .string,.hljs-far pre .ruby .string,.hljs-far pre .haskell .type,.hljs-far pre .tag .value,.hljs-far pre .css .rules .value,.hljs-far pre .css .rules .value .number,.hljs-far pre .preprocessor,.hljs-far pre .ruby .symbol,.hljs-far pre .ruby .symbol .string,.hljs-far pre .built_in,.hljs-far pre .sql .aggregate,.hljs-far pre .django .template_tag,.hljs-far pre .django .variable,.hljs-far pre .smalltalk .class,.hljs-far pre .addition,.hljs-far pre .apache .tag,.hljs-far pre .apache .cbracket,.hljs-far pre .tex .command,.hljs-far pre .clojure .title{color:#FF0;}.hljs-far pre .keyword,.hljs-far pre .css .id,.hljs-far pre .title,.hljs-far pre .haskell .type,.hljs-far pre .vbscript .built_in,.hljs-far pre .sql .aggregate,.hljs-far pre .rsl .built_in,.hljs-far pre .smalltalk .class,.hljs-far pre .xml .tag .title,.hljs-far pre .winutils,.hljs-far pre .flow,.hljs-far pre .change,.hljs-far pre .envvar,.hljs-far pre .bash .variable,.hljs-far pre .tex .special,.hljs-far pre .clojure .built_in{color:#FFF;}.hljs-far pre .comment,.hljs-far pre .phpdoc,.hljs-far pre .javadoc,.hljs-far pre .java .annotation,.hljs-far pre .template_comment,.hljs-far pre .deletion,.hljs-far pre .apache .sqbracket,.hljs-far pre .tex .formula{color:#888;}.hljs-far pre .number,.hljs-far pre .date,.hljs-far pre .regexp,.hljs-far pre .literal,.hljs-far pre .smalltalk .symbol,.hljs-far pre .smalltalk .char,.hljs-far pre .clojure .attribute{color:#0F0;}.hljs-far pre .python .decorator,.hljs-far pre .django .filter .argument,.hljs-far pre .smalltalk .localvars,.hljs-far pre .smalltalk .array,.hljs-far pre .attr_selector,.hljs-far pre .pseudo,.hljs-far pre .xml .pi,.hljs-far pre .diff .header,.hljs-far pre .chunk,.hljs-far pre .shebang,.hljs-far pre .nginx .built_in,.hljs-far pre .input_number{color:#008080;}.hljs-far pre .keyword,.hljs-far pre .css .id,.hljs-far pre .title,.hljs-far pre .haskell .type,.hljs-far pre .vbscript .built_in,.hljs-far pre .sql .aggregate,.hljs-far pre .rsl .built_in,.hljs-far pre .smalltalk .class,.hljs-far pre .winutils,.hljs-far pre .flow,.hljs-far pre .apache .tag,.hljs-far pre .nginx .built_in,.hljs-far pre .tex .command,.hljs-far pre .tex .special,.hljs-far pre .request,.hljs-far pre .status{font-weight:bold;}","dark":".hljs-dark{}.hljs-dark pre code{display:block;padding:0.5em;background:#444;}.hljs-dark pre .keyword,.hljs-dark pre .literal,.hljs-dark pre .change,.hljs-dark pre .winutils,.hljs-dark pre .flow,.hljs-dark pre .lisp .title,.hljs-dark pre .clojure .built_in,.hljs-dark pre .nginx .title,.hljs-dark pre .tex .special{color:white;}.hljs-dark pre code,.hljs-dark pre .subst{color:#DDD;}.hljs-dark pre .string,.hljs-dark pre .title,.hljs-dark pre .haskell .type,.hljs-dark pre .ini .title,.hljs-dark pre .tag .value,.hljs-dark pre .css .rules .value,.hljs-dark pre .preprocessor,.hljs-dark pre .ruby .symbol,.hljs-dark pre .ruby .symbol .string,.hljs-dark pre .ruby .class .parent,.hljs-dark pre .built_in,.hljs-dark pre .sql .aggregate,.hljs-dark pre .django .template_tag,.hljs-dark pre .django .variable,.hljs-dark pre .smalltalk .class,.hljs-dark pre .javadoc,.hljs-dark pre .ruby .string,.hljs-dark pre .django .filter .argument,.hljs-dark pre .smalltalk .localvars,.hljs-dark pre .smalltalk .array,.hljs-dark pre .attr_selector,.hljs-dark pre .pseudo,.hljs-dark pre .addition,.hljs-dark pre .stream,.hljs-dark pre .envvar,.hljs-dark pre .apache .tag,.hljs-dark pre .apache .cbracket,.hljs-dark pre .tex .command,.hljs-dark pre .input_number{color:#D88;}.hljs-dark pre .comment,.hljs-dark pre .java .annotation,.hljs-dark pre .python .decorator,.hljs-dark pre .template_comment,.hljs-dark pre .pi,.hljs-dark pre .doctype,.hljs-dark pre .deletion,.hljs-dark pre .shebang,.hljs-dark pre .apache .sqbracket,.hljs-dark pre .tex .formula{color:#777;}.hljs-dark pre .keyword,.hljs-dark pre .literal,.hljs-dark pre .title,.hljs-dark pre .css .id,.hljs-dark pre .phpdoc,.hljs-dark pre .haskell .type,.hljs-dark pre .vbscript .built_in,.hljs-dark pre .sql .aggregate,.hljs-dark pre .rsl .built_in,.hljs-dark pre .smalltalk .class,.hljs-dark pre .diff .header,.hljs-dark pre .chunk,.hljs-dark pre .winutils,.hljs-dark pre .bash .variable,.hljs-dark pre .apache .tag,.hljs-dark pre .tex .special,.hljs-dark pre .request,.hljs-dark pre .status{font-weight:bold;}.hljs-dark pre .coffeescript .javascript,.hljs-dark pre .javascript .xml,.hljs-dark pre .tex .formula,.hljs-dark pre .xml .javascript,.hljs-dark pre .xml .vbscript,.hljs-dark pre .xml .css,.hljs-dark pre .xml .cdata{opacity:0.5;}","ascetic":".hljs-ascetic{}.hljs-ascetic pre code{display:block;padding:0.5em;background:white;color:black;}.hljs-ascetic pre .string,.hljs-ascetic pre .tag .value,.hljs-ascetic pre .filter .argument,.hljs-ascetic pre .addition,.hljs-ascetic pre .change,.hljs-ascetic pre .apache .tag,.hljs-ascetic pre .apache .cbracket,.hljs-ascetic pre .nginx .built_in,.hljs-ascetic pre .tex .formula{color:#888;}.hljs-ascetic pre .comment,.hljs-ascetic pre .template_comment,.hljs-ascetic pre .shebang,.hljs-ascetic pre .doctype,.hljs-ascetic pre .pi,.hljs-ascetic pre .javadoc,.hljs-ascetic pre .deletion,.hljs-ascetic pre .apache .sqbracket{color:#CCC;}.hljs-ascetic pre .keyword,.hljs-ascetic pre .tag .title,.hljs-ascetic pre .ini .title,.hljs-ascetic pre .lisp .title,.hljs-ascetic pre .clojure .title,.hljs-ascetic pre .http .title,.hljs-ascetic pre .nginx .title,.hljs-ascetic pre .css .tag,.hljs-ascetic pre .winutils,.hljs-ascetic pre .flow,.hljs-ascetic pre .apache .tag,.hljs-ascetic pre .tex .command,.hljs-ascetic pre .request,.hljs-ascetic pre .status{font-weight:bold;}","googlecode":".hljs-googlecode{}.hljs-googlecode pre code{display:block;padding:0.5em;background:white;color:black;}.hljs-googlecode pre .comment,.hljs-googlecode pre .template_comment,.hljs-googlecode pre .javadoc,.hljs-googlecode pre .comment *{color:#800;}.hljs-googlecode pre .keyword,.hljs-googlecode pre .method,.hljs-googlecode pre .list .title,.hljs-googlecode pre .clojure .built_in,.hljs-googlecode pre .nginx .title,.hljs-googlecode pre .tag .title,.hljs-googlecode pre .setting .value,.hljs-googlecode pre .winutils,.hljs-googlecode pre .tex .command,.hljs-googlecode pre .http .title,.hljs-googlecode pre .request,.hljs-googlecode pre .status{color:#008;}.hljs-googlecode pre .envvar,.hljs-googlecode pre .tex .special{color:#660;}.hljs-googlecode pre .string,.hljs-googlecode pre .tag .value,.hljs-googlecode pre .cdata,.hljs-googlecode pre .filter .argument,.hljs-googlecode pre .attr_selector,.hljs-googlecode pre .apache .cbracket,.hljs-googlecode pre .date,.hljs-googlecode pre .regexp{color:#080;}.hljs-googlecode pre .sub .identifier,.hljs-googlecode pre .pi,.hljs-googlecode pre .tag,.hljs-googlecode pre .tag .keyword,.hljs-googlecode pre .decorator,.hljs-googlecode pre .ini .title,.hljs-googlecode pre .shebang,.hljs-googlecode pre .input_number,.hljs-googlecode pre .hexcolor,.hljs-googlecode pre .rules .value,.hljs-googlecode pre .css .value .number,.hljs-googlecode pre .literal,.hljs-googlecode pre .symbol,.hljs-googlecode pre .ruby .symbol .string,.hljs-googlecode pre .number,.hljs-googlecode pre .css .function,.hljs-googlecode pre .clojure .attribute{color:#066;}.hljs-googlecode pre .class .title,.hljs-googlecode pre .haskell .type,.hljs-googlecode pre .smalltalk .class,.hljs-googlecode pre .javadoctag,.hljs-googlecode pre .yardoctag,.hljs-googlecode pre .phpdoc,.hljs-googlecode pre .typename,.hljs-googlecode pre .tag .attribute,.hljs-googlecode pre .doctype,.hljs-googlecode pre .class .id,.hljs-googlecode pre .built_in,.hljs-googlecode pre .setting,.hljs-googlecode pre .params,.hljs-googlecode pre .variable,.hljs-googlecode pre .clojure .title{color:#606;}.hljs-googlecode pre .css .tag,.hljs-googlecode pre .rules .property,.hljs-googlecode pre .pseudo,.hljs-googlecode pre .subst{color:#000;}.hljs-googlecode pre .css .class,.hljs-googlecode pre .css .id{color:#9B703F;}.hljs-googlecode pre .value .important{color:#ff7700;font-weight:bold;}.hljs-googlecode pre .rules .keyword{color:#C5AF75;}.hljs-googlecode pre .annotation,.hljs-googlecode pre .apache .sqbracket,.hljs-googlecode pre .nginx .built_in{color:#9B859D;}.hljs-googlecode pre .preprocessor,.hljs-googlecode pre .preprocessor *{color:#444;}.hljs-googlecode pre .tex .formula{background-color:#EEE;font-style:italic;}.hljs-googlecode pre .diff .header,.hljs-googlecode pre .chunk{color:#808080;font-weight:bold;}.hljs-googlecode pre .diff .change{background-color:#BCCFF9;}.hljs-googlecode pre .addition{background-color:#BAEEBA;}.hljs-googlecode pre .deletion{background-color:#FFC8BD;}.hljs-googlecode pre .comment .yardoctag{font-weight:bold;}","solarized_light":".hljs-solarized_light{}.hljs-solarized_light pre code{display:block;padding:0.5em;background:#fdf6e3;color:#657b83;}.hljs-solarized_light pre .comment,.hljs-solarized_light pre .template_comment,.hljs-solarized_light pre .diff .header,.hljs-solarized_light pre .doctype,.hljs-solarized_light pre .pi,.hljs-solarized_light pre .lisp .string,.hljs-solarized_light pre .javadoc{color:#93a1a1;font-style:italic;}.hljs-solarized_light pre .keyword,.hljs-solarized_light pre .winutils,.hljs-solarized_light pre .method,.hljs-solarized_light pre .addition,.hljs-solarized_light pre .css .tag,.hljs-solarized_light pre .request,.hljs-solarized_light pre .status,.hljs-solarized_light pre .nginx .title{color:#859900;}.hljs-solarized_light pre .number,.hljs-solarized_light pre .command,.hljs-solarized_light pre .string,.hljs-solarized_light pre .tag .value,.hljs-solarized_light pre .phpdoc,.hljs-solarized_light pre .tex .formula,.hljs-solarized_light pre .regexp,.hljs-solarized_light pre .hexcolor{color:#2aa198;}.hljs-solarized_light pre .title,.hljs-solarized_light pre .localvars,.hljs-solarized_light pre .chunk,.hljs-solarized_light pre .decorator,.hljs-solarized_light pre .built_in,.hljs-solarized_light pre .identifier,.hljs-solarized_light pre .vhdl .literal,.hljs-solarized_light pre .id{color:#268bd2;}.hljs-solarized_light pre .attribute,.hljs-solarized_light pre .variable,.hljs-solarized_light pre .lisp .body,.hljs-solarized_light pre .smalltalk .number,.hljs-solarized_light pre .constant,.hljs-solarized_light pre .class .title,.hljs-solarized_light pre .parent,.hljs-solarized_light pre .haskell .type{color:#b58900;}.hljs-solarized_light pre .preprocessor,.hljs-solarized_light pre .preprocessor .keyword,.hljs-solarized_light pre .shebang,.hljs-solarized_light pre .symbol,.hljs-solarized_light pre .symbol .string,.hljs-solarized_light pre .diff .change,.hljs-solarized_light pre .special,.hljs-solarized_light pre .attr_selector,.hljs-solarized_light pre .important,.hljs-solarized_light pre .subst,.hljs-solarized_light pre .cdata,.hljs-solarized_light pre .clojure .title{color:#cb4b16;}.hljs-solarized_light pre .deletion{color:#dc322f;}.hljs-solarized_light pre .tex .formula{background:#eee8d5;}","github":".hljs-github{}.hljs-github pre code{display:block;padding:0.5em;color:#333;background:#f8f8ff;}.hljs-github pre .comment,.hljs-github pre .template_comment,.hljs-github pre .diff .header,.hljs-github pre .javadoc{color:#998;font-style:italic;}.hljs-github pre .keyword,.hljs-github pre .css .rule .keyword,.hljs-github pre .winutils,.hljs-github pre .javascript .title,.hljs-github pre .nginx .title,.hljs-github pre .subst,.hljs-github pre .request,.hljs-github pre .status{color:#333;font-weight:bold;}.hljs-github pre .number,.hljs-github pre .hexcolor,.hljs-github pre .ruby .constant{color:#099;}.hljs-github pre .string,.hljs-github pre .tag .value,.hljs-github pre .phpdoc,.hljs-github pre .tex .formula{color:#dd1144;}.hljs-github pre .title,.hljs-github pre .id{color:#900;font-weight:bold;}.hljs-github pre .javascript .title,.hljs-github pre .lisp .title,.hljs-github pre .clojure .title,.hljs-github pre .subst{font-weight:normal;}.hljs-github pre .class .title,.hljs-github pre .haskell .type,.hljs-github pre .vhdl .literal,.hljs-github pre .tex .command{color:#458;font-weight:bold;}.hljs-github pre .tag,.hljs-github pre .tag .title,.hljs-github pre .rules .property,.hljs-github pre .django .tag .keyword{color:#000080;font-weight:normal;}.hljs-github pre .attribute,.hljs-github pre .variable,.hljs-github pre .lisp .body{color:#008080;}.hljs-github pre .regexp{color:#009926;}.hljs-github pre .class{color:#458;font-weight:bold;}.hljs-github pre .symbol,.hljs-github pre .ruby .symbol .string,.hljs-github pre .lisp .keyword,.hljs-github pre .tex .special,.hljs-github pre .input_number{color:#990073;}.hljs-github pre .built_in,.hljs-github pre .lisp .title,.hljs-github pre .clojure .built_in{color:#0086b3;}.hljs-github pre .preprocessor,.hljs-github pre .pi,.hljs-github pre .doctype,.hljs-github pre .shebang,.hljs-github pre .cdata{color:#999;font-weight:bold;}.hljs-github pre .deletion{background:#ffdddd;}.hljs-github pre .addition{background:#ddffdd;}.hljs-github pre .diff .change{background:#0086b3;}.hljs-github pre .chunk{color:#aaaaaa;}","tomorrow-night":".hljs-tomorrow-night{}.hljs-tomorrow-night .tomorrow-comment,.hljs-tomorrow-night pre .comment,.hljs-tomorrow-night pre .title{color:#969896;}.hljs-tomorrow-night .tomorrow-red,.hljs-tomorrow-night pre .variable,.hljs-tomorrow-night pre .attribute,.hljs-tomorrow-night pre .tag,.hljs-tomorrow-night pre .regexp,.hljs-tomorrow-night pre .ruby .constant,.hljs-tomorrow-night pre .xml .tag .title,.hljs-tomorrow-night pre .xml .pi,.hljs-tomorrow-night pre .xml .doctype,.hljs-tomorrow-night pre .html .doctype,.hljs-tomorrow-night pre .css .id,.hljs-tomorrow-night pre .css .class,.hljs-tomorrow-night pre .css .pseudo{color:#cc6666;}.hljs-tomorrow-night .tomorrow-orange,.hljs-tomorrow-night pre .number,.hljs-tomorrow-night pre .preprocessor,.hljs-tomorrow-night pre .built_in,.hljs-tomorrow-night pre .literal,.hljs-tomorrow-night pre .params,.hljs-tomorrow-night pre .constant{color:#de935f;}.hljs-tomorrow-night .tomorrow-yellow,.hljs-tomorrow-night pre .class,.hljs-tomorrow-night pre .ruby .class .title,.hljs-tomorrow-night pre .css .rules .attribute{color:#f0c674;}.hljs-tomorrow-night .tomorrow-green,.hljs-tomorrow-night pre .string,.hljs-tomorrow-night pre .value,.hljs-tomorrow-night pre .inheritance,.hljs-tomorrow-night pre .header,.hljs-tomorrow-night pre .ruby .symbol,.hljs-tomorrow-night pre .xml .cdata{color:#b5bd68;}.hljs-tomorrow-night .tomorrow-aqua,.hljs-tomorrow-night pre .css .hexcolor{color:#8abeb7;}.hljs-tomorrow-night .tomorrow-blue,.hljs-tomorrow-night pre .function,.hljs-tomorrow-night pre .python .decorator,.hljs-tomorrow-night pre .python .title,.hljs-tomorrow-night pre .ruby .function .title,.hljs-tomorrow-night pre .ruby .title .keyword,.hljs-tomorrow-night pre .perl .sub,.hljs-tomorrow-night pre .javascript .title,.hljs-tomorrow-night pre .coffeescript .title{color:#81a2be;}.hljs-tomorrow-night .tomorrow-purple,.hljs-tomorrow-night pre .keyword,.hljs-tomorrow-night pre .javascript .function{color:#b294bb;}.hljs-tomorrow-night pre code{display:block;background:#1d1f21;color:#c5c8c6;padding:0.5em;}.hljs-tomorrow-night pre .coffeescript .javascript,.hljs-tomorrow-night pre .javascript .xml,.hljs-tomorrow-night pre .tex .formula,.hljs-tomorrow-night pre .xml .javascript,.hljs-tomorrow-night pre .xml .vbscript,.hljs-tomorrow-night pre .xml .css,.hljs-tomorrow-night pre .xml .cdata{opacity:0.5;}","solarized_dark":".hljs-solarized_dark{}.hljs-solarized_dark pre code{display:block;padding:0.5em;background:#002b36;color:#839496;}.hljs-solarized_dark pre .comment,.hljs-solarized_dark pre .template_comment,.hljs-solarized_dark pre .diff .header,.hljs-solarized_dark pre .doctype,.hljs-solarized_dark pre .pi,.hljs-solarized_dark pre .lisp .string,.hljs-solarized_dark pre .javadoc{color:#586e75;font-style:italic;}.hljs-solarized_dark pre .keyword,.hljs-solarized_dark pre .winutils,.hljs-solarized_dark pre .method,.hljs-solarized_dark pre .addition,.hljs-solarized_dark pre .css .tag,.hljs-solarized_dark pre .request,.hljs-solarized_dark pre .status,.hljs-solarized_dark pre .nginx .title{color:#859900;}.hljs-solarized_dark pre .number,.hljs-solarized_dark pre .command,.hljs-solarized_dark pre .string,.hljs-solarized_dark pre .tag .value,.hljs-solarized_dark pre .phpdoc,.hljs-solarized_dark pre .tex .formula,.hljs-solarized_dark pre .regexp,.hljs-solarized_dark pre .hexcolor{color:#2aa198;}.hljs-solarized_dark pre .title,.hljs-solarized_dark pre .localvars,.hljs-solarized_dark pre .chunk,.hljs-solarized_dark pre .decorator,.hljs-solarized_dark pre .built_in,.hljs-solarized_dark pre .identifier,.hljs-solarized_dark pre .vhdl .literal,.hljs-solarized_dark pre .id{color:#268bd2;}.hljs-solarized_dark pre .attribute,.hljs-solarized_dark pre .variable,.hljs-solarized_dark pre .lisp .body,.hljs-solarized_dark pre .smalltalk .number,.hljs-solarized_dark pre .constant,.hljs-solarized_dark pre .class .title,.hljs-solarized_dark pre .parent,.hljs-solarized_dark pre .haskell .type{color:#b58900;}.hljs-solarized_dark pre .preprocessor,.hljs-solarized_dark pre .preprocessor .keyword,.hljs-solarized_dark pre .shebang,.hljs-solarized_dark pre .symbol,.hljs-solarized_dark pre .symbol .string,.hljs-solarized_dark pre .diff .change,.hljs-solarized_dark pre .special,.hljs-solarized_dark pre .attr_selector,.hljs-solarized_dark pre .important,.hljs-solarized_dark pre .subst,.hljs-solarized_dark pre .cdata,.hljs-solarized_dark pre .clojure .title{color:#cb4b16;}.hljs-solarized_dark pre .deletion{color:#dc322f;}.hljs-solarized_dark pre .tex .formula{background:#073642;}","vs":".hljs-vs{}.hljs-vs pre code{display:block;padding:0.5em;}.hljs-vs pre .comment,.hljs-vs pre .annotation,.hljs-vs pre .template_comment,.hljs-vs pre .diff .header,.hljs-vs pre .chunk,.hljs-vs pre .apache .cbracket{color:#008000;}.hljs-vs pre .keyword,.hljs-vs pre .id,.hljs-vs pre .built_in,.hljs-vs pre .smalltalk .class,.hljs-vs pre .winutils,.hljs-vs pre .bash .variable,.hljs-vs pre .tex .command,.hljs-vs pre .request,.hljs-vs pre .status,.hljs-vs pre .nginx .title,.hljs-vs pre .xml .tag,.hljs-vs pre .xml .tag .value{color:#0000ff;}.hljs-vs pre .string,.hljs-vs pre .title,.hljs-vs pre .parent,.hljs-vs pre .tag .value,.hljs-vs pre .rules .value,.hljs-vs pre .rules .value .number,.hljs-vs pre .ruby .symbol,.hljs-vs pre .ruby .symbol .string,.hljs-vs pre .aggregate,.hljs-vs pre .template_tag,.hljs-vs pre .django .variable,.hljs-vs pre .addition,.hljs-vs pre .flow,.hljs-vs pre .stream,.hljs-vs pre .apache .tag,.hljs-vs pre .date,.hljs-vs pre .tex .formula{color:#a31515;}.hljs-vs pre .ruby .string,.hljs-vs pre .decorator,.hljs-vs pre .filter .argument,.hljs-vs pre .localvars,.hljs-vs pre .array,.hljs-vs pre .attr_selector,.hljs-vs pre .pseudo,.hljs-vs pre .pi,.hljs-vs pre .doctype,.hljs-vs pre .deletion,.hljs-vs pre .envvar,.hljs-vs pre .shebang,.hljs-vs pre .preprocessor,.hljs-vs pre .userType,.hljs-vs pre .apache .sqbracket,.hljs-vs pre .nginx .built_in,.hljs-vs pre .tex .special,.hljs-vs pre .input_number{color:#2b91af;}.hljs-vs pre .phpdoc,.hljs-vs pre .javadoc,.hljs-vs pre .xmlDocTag{color:#808080;}.hljs-vs pre .vhdl .typename{font-weight:bold;}.hljs-vs pre .vhdl .string{color:#666666;}.hljs-vs pre .vhdl .literal{color:#a31515;}.hljs-vs pre .vhdl .attribute{color:#00B0E8;}.hljs-vs pre .xml .attribute{color:#ff0000;}","sunburst":".hljs-sunburst{}.hljs-sunburst pre code{display:block;padding:0.5em;background:#000;color:#f8f8f8;}.hljs-sunburst pre .comment,.hljs-sunburst pre .template_comment,.hljs-sunburst pre .javadoc{color:#aeaeae;font-style:italic;}.hljs-sunburst pre .keyword,.hljs-sunburst pre .ruby .function .keyword,.hljs-sunburst pre .request,.hljs-sunburst pre .status,.hljs-sunburst pre .nginx .title{color:#E28964;}.hljs-sunburst pre .function .keyword,.hljs-sunburst pre .sub .keyword,.hljs-sunburst pre .method,.hljs-sunburst pre .list .title{color:#99CF50;}.hljs-sunburst pre .string,.hljs-sunburst pre .tag .value,.hljs-sunburst pre .cdata,.hljs-sunburst pre .filter .argument,.hljs-sunburst pre .attr_selector,.hljs-sunburst pre .apache .cbracket,.hljs-sunburst pre .date,.hljs-sunburst pre .tex .command{color:#65B042;}.hljs-sunburst pre .subst{color:#DAEFA3;}.hljs-sunburst pre .regexp{color:#E9C062;}.hljs-sunburst pre .title,.hljs-sunburst pre .sub .identifier,.hljs-sunburst pre .pi,.hljs-sunburst pre .tag,.hljs-sunburst pre .tag .keyword,.hljs-sunburst pre .decorator,.hljs-sunburst pre .shebang,.hljs-sunburst pre .input_number{color:#89BDFF;}.hljs-sunburst pre .class .title,.hljs-sunburst pre .haskell .type,.hljs-sunburst pre .smalltalk .class,.hljs-sunburst pre .javadoctag,.hljs-sunburst pre .yardoctag,.hljs-sunburst pre .phpdoc{text-decoration:underline;}.hljs-sunburst pre .symbol,.hljs-sunburst pre .ruby .symbol .string,.hljs-sunburst pre .number{color:#3387CC;}.hljs-sunburst pre .params,.hljs-sunburst pre .variable,.hljs-sunburst pre .clojure .attribute{color:#3E87E3;}.hljs-sunburst pre .css .tag,.hljs-sunburst pre .rules .property,.hljs-sunburst pre .pseudo,.hljs-sunburst pre .tex .special{color:#CDA869;}.hljs-sunburst pre .css .class{color:#9B703F;}.hljs-sunburst pre .rules .keyword{color:#C5AF75;}.hljs-sunburst pre .rules .value{color:#CF6A4C;}.hljs-sunburst pre .css .id{color:#8B98AB;}.hljs-sunburst pre .annotation,.hljs-sunburst pre .apache .sqbracket,.hljs-sunburst pre .nginx .built_in{color:#9B859D;}.hljs-sunburst pre .preprocessor{color:#8996A8;}.hljs-sunburst pre .hexcolor,.hljs-sunburst pre .css .value .number{color:#DD7B3B;}.hljs-sunburst pre .css .function{color:#DAD085;}.hljs-sunburst pre .diff .header,.hljs-sunburst pre .chunk,.hljs-sunburst pre .tex .formula{background-color:#0E2231;color:#F8F8F8;font-style:italic;}.hljs-sunburst pre .diff .change{background-color:#4A410D;color:#F8F8F8;}.hljs-sunburst pre .addition{background-color:#253B22;color:#F8F8F8;}.hljs-sunburst pre .deletion{background-color:#420E09;color:#F8F8F8;}.hljs-sunburst pre .coffeescript .javascript,.hljs-sunburst pre .javascript .xml,.hljs-sunburst pre .tex .formula,.hljs-sunburst pre .xml .javascript,.hljs-sunburst pre .xml .vbscript,.hljs-sunburst pre .xml .css,.hljs-sunburst pre .xml .cdata{opacity:0.5;}","arta":".hljs-arta{}.hljs-arta pre code{display:block;padding:0.5em;background:#222;}.hljs-arta pre .profile .header *,.hljs-arta pre .ini .title,.hljs-arta pre .nginx .title{color:#fff;}.hljs-arta pre .comment,.hljs-arta pre .javadoc,.hljs-arta pre .preprocessor,.hljs-arta pre .preprocessor .title,.hljs-arta pre .shebang,.hljs-arta pre .profile .summary,.hljs-arta pre .diff,.hljs-arta pre .pi,.hljs-arta pre .doctype,.hljs-arta pre .tag,.hljs-arta pre .template_comment,.hljs-arta pre .css .rules,.hljs-arta pre .tex .special{color:#444;}.hljs-arta pre .string,.hljs-arta pre .symbol,.hljs-arta pre .diff .change,.hljs-arta pre .regexp,.hljs-arta pre .xml .attribute,.hljs-arta pre .smalltalk .char,.hljs-arta pre .xml .value,.hljs-arta pre .ini .value,.hljs-arta pre .clojure .attribute{color:#ffcc33;}.hljs-arta pre .number,.hljs-arta pre .addition{color:#00cc66;}.hljs-arta pre .built_in,.hljs-arta pre .literal,.hljs-arta pre .vhdl .typename,.hljs-arta pre .go .constant,.hljs-arta pre .go .typename,.hljs-arta pre .ini .keyword,.hljs-arta pre .lua .title,.hljs-arta pre .perl .variable,.hljs-arta pre .php .variable,.hljs-arta pre .mel .variable,.hljs-arta pre .django .variable,.hljs-arta pre .css .funtion,.hljs-arta pre .smalltalk .method,.hljs-arta pre .hexcolor,.hljs-arta pre .important,.hljs-arta pre .flow,.hljs-arta pre .inheritance,.hljs-arta pre .parser3 .variable{color:#32AAEE;}.hljs-arta pre .keyword,.hljs-arta pre .tag .title,.hljs-arta pre .css .tag,.hljs-arta pre .css .class,.hljs-arta pre .css .id,.hljs-arta pre .css .pseudo,.hljs-arta pre .css .attr_selector,.hljs-arta pre .lisp .title,.hljs-arta pre .clojure .built_in,.hljs-arta pre .winutils,.hljs-arta pre .tex .command,.hljs-arta pre .request,.hljs-arta pre .status{color:#6644aa;}.hljs-arta pre .title,.hljs-arta pre .ruby .constant,.hljs-arta pre .vala .constant,.hljs-arta pre .parent,.hljs-arta pre .deletion,.hljs-arta pre .template_tag,.hljs-arta pre .css .keyword,.hljs-arta pre .objectivec .class .id,.hljs-arta pre .smalltalk .class,.hljs-arta pre .lisp .keyword,.hljs-arta pre .apache .tag,.hljs-arta pre .nginx .variable,.hljs-arta pre .envvar,.hljs-arta pre .bash .variable,.hljs-arta pre .go .built_in,.hljs-arta pre .vbscript .built_in,.hljs-arta pre .lua .built_in,.hljs-arta pre .rsl .built_in,.hljs-arta pre .tail,.hljs-arta pre .avrasm .label,.hljs-arta pre .tex .formula,.hljs-arta pre .tex .formula *{color:#bb1166;}.hljs-arta pre .yardoctag,.hljs-arta pre .phpdoc,.hljs-arta pre .profile .header,.hljs-arta pre .ini .title,.hljs-arta pre .apache .tag,.hljs-arta pre .parser3 .title{font-weight:bold;}.hljs-arta pre .coffeescript .javascript,.hljs-arta pre .javascript .xml,.hljs-arta pre .tex .formula,.hljs-arta pre .xml .javascript,.hljs-arta pre .xml .vbscript,.hljs-arta pre .xml .css,.hljs-arta pre .xml .cdata{opacity:0.6;}.hljs-arta pre code,.hljs-arta pre .javascript,.hljs-arta pre .css,.hljs-arta pre .xml,.hljs-arta pre .subst,.hljs-arta pre .diff .chunk,.hljs-arta pre .css .value,.hljs-arta pre .css .attribute,.hljs-arta pre .lisp .string,.hljs-arta pre .lisp .number,.hljs-arta pre .tail .params,.hljs-arta pre .container,.hljs-arta pre .haskell *,.hljs-arta pre .erlang *,.hljs-arta pre .erlang_repl *{color:#aaa;}","tomorrow-night-eighties":".hljs-tomorrow-night-eighties{}.hljs-tomorrow-night-eighties .tomorrow-comment,.hljs-tomorrow-night-eighties pre .comment,.hljs-tomorrow-night-eighties pre .title{color:#999999;}.hljs-tomorrow-night-eighties .tomorrow-red,.hljs-tomorrow-night-eighties pre .variable,.hljs-tomorrow-night-eighties pre .attribute,.hljs-tomorrow-night-eighties pre .tag,.hljs-tomorrow-night-eighties pre .regexp,.hljs-tomorrow-night-eighties pre .ruby .constant,.hljs-tomorrow-night-eighties pre .xml .tag .title,.hljs-tomorrow-night-eighties pre .xml .pi,.hljs-tomorrow-night-eighties pre .xml .doctype,.hljs-tomorrow-night-eighties pre .html .doctype,.hljs-tomorrow-night-eighties pre .css .id,.hljs-tomorrow-night-eighties pre .css .class,.hljs-tomorrow-night-eighties pre .css .pseudo{color:#f2777a;}.hljs-tomorrow-night-eighties .tomorrow-orange,.hljs-tomorrow-night-eighties pre .number,.hljs-tomorrow-night-eighties pre .preprocessor,.hljs-tomorrow-night-eighties pre .built_in,.hljs-tomorrow-night-eighties pre .literal,.hljs-tomorrow-night-eighties pre .params,.hljs-tomorrow-night-eighties pre .constant{color:#f99157;}.hljs-tomorrow-night-eighties .tomorrow-yellow,.hljs-tomorrow-night-eighties pre .class,.hljs-tomorrow-night-eighties pre .ruby .class .title,.hljs-tomorrow-night-eighties pre .css .rules .attribute{color:#ffcc66;}.hljs-tomorrow-night-eighties .tomorrow-green,.hljs-tomorrow-night-eighties pre .string,.hljs-tomorrow-night-eighties pre .value,.hljs-tomorrow-night-eighties pre .inheritance,.hljs-tomorrow-night-eighties pre .header,.hljs-tomorrow-night-eighties pre .ruby .symbol,.hljs-tomorrow-night-eighties pre .xml .cdata{color:#99cc99;}.hljs-tomorrow-night-eighties .tomorrow-aqua,.hljs-tomorrow-night-eighties pre .css .hexcolor{color:#66cccc;}.hljs-tomorrow-night-eighties .tomorrow-blue,.hljs-tomorrow-night-eighties pre .function,.hljs-tomorrow-night-eighties pre .python .decorator,.hljs-tomorrow-night-eighties pre .python .title,.hljs-tomorrow-night-eighties pre .ruby .function .title,.hljs-tomorrow-night-eighties pre .ruby .title .keyword,.hljs-tomorrow-night-eighties pre .perl .sub,.hljs-tomorrow-night-eighties pre .javascript .title,.hljs-tomorrow-night-eighties pre .coffeescript .title{color:#6699cc;}.hljs-tomorrow-night-eighties .tomorrow-purple,.hljs-tomorrow-night-eighties pre .keyword,.hljs-tomorrow-night-eighties pre .javascript .function{color:#cc99cc;}.hljs-tomorrow-night-eighties pre code{display:block;background:#2d2d2d;color:#cccccc;padding:0.5em;}.hljs-tomorrow-night-eighties pre .coffeescript .javascript,.hljs-tomorrow-night-eighties pre .javascript .xml,.hljs-tomorrow-night-eighties pre .tex .formula,.hljs-tomorrow-night-eighties pre .xml .javascript,.hljs-tomorrow-night-eighties pre .xml .vbscript,.hljs-tomorrow-night-eighties pre .xml .css,.hljs-tomorrow-night-eighties pre .xml .cdata{opacity:0.5;}","default":".hljs-default{}.hljs-default pre code{display:block;padding:0.5em;background:#F0F0F0;}.hljs-default pre code,.hljs-default pre .subst,.hljs-default pre .tag .title,.hljs-default pre .lisp .title,.hljs-default pre .clojure .built_in,.hljs-default pre .nginx .title{color:black;}.hljs-default pre .string,.hljs-default pre .title,.hljs-default pre .constant,.hljs-default pre .parent,.hljs-default pre .tag .value,.hljs-default pre .rules .value,.hljs-default pre .rules .value .number,.hljs-default pre .preprocessor,.hljs-default pre .ruby .symbol,.hljs-default pre .ruby .symbol .string,.hljs-default pre .aggregate,.hljs-default pre .template_tag,.hljs-default pre .django .variable,.hljs-default pre .smalltalk .class,.hljs-default pre .addition,.hljs-default pre .flow,.hljs-default pre .stream,.hljs-default pre .bash .variable,.hljs-default pre .apache .tag,.hljs-default pre .apache .cbracket,.hljs-default pre .tex .command,.hljs-default pre .tex .special,.hljs-default pre .erlang_repl .function_or_atom,.hljs-default pre .markdown .header{color:#800;}.hljs-default pre .comment,.hljs-default pre .annotation,.hljs-default pre .template_comment,.hljs-default pre .diff .header,.hljs-default pre .chunk,.hljs-default pre .markdown .blockquote{color:#888;}.hljs-default pre .number,.hljs-default pre .date,.hljs-default pre .regexp,.hljs-default pre .literal,.hljs-default pre .smalltalk .symbol,.hljs-default pre .smalltalk .char,.hljs-default pre .go .constant,.hljs-default pre .change,.hljs-default pre .markdown .bullet,.hljs-default pre .markdown .link_url{color:#080;}.hljs-default pre .label,.hljs-default pre .javadoc,.hljs-default pre .ruby .string,.hljs-default pre .decorator,.hljs-default pre .filter .argument,.hljs-default pre .localvars,.hljs-default pre .array,.hljs-default pre .attr_selector,.hljs-default pre .important,.hljs-default pre .pseudo,.hljs-default pre .pi,.hljs-default pre .doctype,.hljs-default pre .deletion,.hljs-default pre .envvar,.hljs-default pre .shebang,.hljs-default pre .apache .sqbracket,.hljs-default pre .nginx .built_in,.hljs-default pre .tex .formula,.hljs-default pre .erlang_repl .reserved,.hljs-default pre .input_number,.hljs-default pre .markdown .link_label,.hljs-default pre .vhdl .attribute,.hljs-default pre .clojure .attribute,.hljs-default pre .coffeescript .property{color:#8888ff;}.hljs-default pre .keyword,.hljs-default pre .id,.hljs-default pre .phpdoc,.hljs-default pre .title,.hljs-default pre .built_in,.hljs-default pre .aggregate,.hljs-default pre .css .tag,.hljs-default pre .javadoctag,.hljs-default pre .phpdoc,.hljs-default pre .yardoctag,.hljs-default pre .smalltalk .class,.hljs-default pre .winutils,.hljs-default pre .bash .variable,.hljs-default pre .apache .tag,.hljs-default pre .go .typename,.hljs-default pre .tex .command,.hljs-default pre .markdown .strong,.hljs-default pre .request,.hljs-default pre .status{font-weight:bold;}.hljs-default pre .markdown .emphasis{font-style:italic;}.hljs-default pre .nginx .built_in{font-weight:normal;}.hljs-default pre .coffeescript .javascript,.hljs-default pre .javascript .xml,.hljs-default pre .tex .formula,.hljs-default pre .xml .javascript,.hljs-default pre .xml .vbscript,.hljs-default pre .xml .css,.hljs-default pre .xml .cdata{opacity:0.5;}","magula":".hljs-magula{}.hljs-magula pre code{display:block;padding:0.5em;background-color:#f4f4f4;}.hljs-magula pre code,.hljs-magula pre .subst,.hljs-magula pre .lisp .title,.hljs-magula pre .clojure .built_in{color:black;}.hljs-magula pre .string,.hljs-magula pre .title,.hljs-magula pre .parent,.hljs-magula pre .tag .value,.hljs-magula pre .rules .value,.hljs-magula pre .rules .value .number,.hljs-magula pre .preprocessor,.hljs-magula pre .ruby .symbol,.hljs-magula pre .ruby .symbol .string,.hljs-magula pre .aggregate,.hljs-magula pre .template_tag,.hljs-magula pre .django .variable,.hljs-magula pre .smalltalk .class,.hljs-magula pre .addition,.hljs-magula pre .flow,.hljs-magula pre .stream,.hljs-magula pre .bash .variable,.hljs-magula pre .apache .cbracket{color:#050;}.hljs-magula pre .comment,.hljs-magula pre .annotation,.hljs-magula pre .template_comment,.hljs-magula pre .diff .header,.hljs-magula pre .chunk{color:#777;}.hljs-magula pre .number,.hljs-magula pre .date,.hljs-magula pre .regexp,.hljs-magula pre .literal,.hljs-magula pre .smalltalk .symbol,.hljs-magula pre .smalltalk .char,.hljs-magula pre .change,.hljs-magula pre .tex .special{color:#800;}.hljs-magula pre .label,.hljs-magula pre .javadoc,.hljs-magula pre .ruby .string,.hljs-magula pre .decorator,.hljs-magula pre .filter .argument,.hljs-magula pre .localvars,.hljs-magula pre .array,.hljs-magula pre .attr_selector,.hljs-magula pre .pseudo,.hljs-magula pre .pi,.hljs-magula pre .doctype,.hljs-magula pre .deletion,.hljs-magula pre .envvar,.hljs-magula pre .shebang,.hljs-magula pre .apache .sqbracket,.hljs-magula pre .nginx .built_in,.hljs-magula pre .tex .formula,.hljs-magula pre .input_number,.hljs-magula pre .clojure .attribute{color:#00e;}.hljs-magula pre .keyword,.hljs-magula pre .id,.hljs-magula pre .phpdoc,.hljs-magula pre .title,.hljs-magula pre .built_in,.hljs-magula pre .aggregate,.hljs-magula pre .smalltalk .class,.hljs-magula pre .winutils,.hljs-magula pre .bash .variable,.hljs-magula pre .apache .tag,.hljs-magula pre .xml .tag,.hljs-magula pre .tex .command,.hljs-magula pre .request,.hljs-magula pre .status{font-weight:bold;color:navy;}.hljs-magula pre .nginx .built_in{font-weight:normal;}.hljs-magula pre .coffeescript .javascript,.hljs-magula pre .javascript .xml,.hljs-magula pre .tex .formula,.hljs-magula pre .xml .javascript,.hljs-magula pre .xml .vbscript,.hljs-magula pre .xml .css,.hljs-magula pre .xml .cdata{opacity:0.5;}.hljs-magula pre .apache .tag{font-weight:bold;color:blue;}","tomorrow":".hljs-tomorrow{}.hljs-tomorrow .tomorrow-comment,.hljs-tomorrow pre .comment,.hljs-tomorrow pre .title{color:#8e908c;}.hljs-tomorrow .tomorrow-red,.hljs-tomorrow pre .variable,.hljs-tomorrow pre .attribute,.hljs-tomorrow pre .tag,.hljs-tomorrow pre .regexp,.hljs-tomorrow pre .ruby .constant,.hljs-tomorrow pre .xml .tag .title,.hljs-tomorrow pre .xml .pi,.hljs-tomorrow pre .xml .doctype,.hljs-tomorrow pre .html .doctype,.hljs-tomorrow pre .css .id,.hljs-tomorrow pre .css .class,.hljs-tomorrow pre .css .pseudo{color:#c82829;}.hljs-tomorrow .tomorrow-orange,.hljs-tomorrow pre .number,.hljs-tomorrow pre .preprocessor,.hljs-tomorrow pre .built_in,.hljs-tomorrow pre .literal,.hljs-tomorrow pre .params,.hljs-tomorrow pre .constant{color:#f5871f;}.hljs-tomorrow .tomorrow-yellow,.hljs-tomorrow pre .class,.hljs-tomorrow pre .ruby .class .title,.hljs-tomorrow pre .css .rules .attribute{color:#eab700;}.hljs-tomorrow .tomorrow-green,.hljs-tomorrow pre .string,.hljs-tomorrow pre .value,.hljs-tomorrow pre .inheritance,.hljs-tomorrow pre .header,.hljs-tomorrow pre .ruby .symbol,.hljs-tomorrow pre .xml .cdata{color:#718c00;}.hljs-tomorrow .tomorrow-aqua,.hljs-tomorrow pre .css .hexcolor{color:#3e999f;}.hljs-tomorrow .tomorrow-blue,.hljs-tomorrow pre .function,.hljs-tomorrow pre .python .decorator,.hljs-tomorrow pre .python .title,.hljs-tomorrow pre .ruby .function .title,.hljs-tomorrow pre .ruby .title .keyword,.hljs-tomorrow pre .perl .sub,.hljs-tomorrow pre .javascript .title,.hljs-tomorrow pre .coffeescript .title{color:#4271ae;}.hljs-tomorrow .tomorrow-purple,.hljs-tomorrow pre .keyword,.hljs-tomorrow pre .javascript .function{color:#8959a8;}.hljs-tomorrow pre code{display:block;background:white;color:#4d4d4c;padding:0.5em;}.hljs-tomorrow pre .coffeescript .javascript,.hljs-tomorrow pre .javascript .xml,.hljs-tomorrow pre .tex .formula,.hljs-tomorrow pre .xml .javascript,.hljs-tomorrow pre .xml .vbscript,.hljs-tomorrow pre .xml .css,.hljs-tomorrow pre .xml .cdata{opacity:0.5;}","xcode":".hljs-xcode{}.hljs-xcode pre code{display:block;padding:0.5em;background:#fff;color:black;}.hljs-xcode pre .comment,.hljs-xcode pre .template_comment,.hljs-xcode pre .javadoc,.hljs-xcode pre .comment *{color:#006a00;}.hljs-xcode pre .keyword,.hljs-xcode pre .literal,.hljs-xcode pre .nginx .title{color:#aa0d91;}.hljs-xcode pre .method,.hljs-xcode pre .list .title,.hljs-xcode pre .tag .title,.hljs-xcode pre .setting .value,.hljs-xcode pre .winutils,.hljs-xcode pre .tex .command,.hljs-xcode pre .http .title,.hljs-xcode pre .request,.hljs-xcode pre .status{color:#008;}.hljs-xcode pre .envvar,.hljs-xcode pre .tex .special{color:#660;}.hljs-xcode pre .string{color:#c41a16;}.hljs-xcode pre .tag .value,.hljs-xcode pre .cdata,.hljs-xcode pre .filter .argument,.hljs-xcode pre .attr_selector,.hljs-xcode pre .apache .cbracket,.hljs-xcode pre .date,.hljs-xcode pre .regexp{color:#080;}.hljs-xcode pre .sub .identifier,.hljs-xcode pre .pi,.hljs-xcode pre .tag,.hljs-xcode pre .tag .keyword,.hljs-xcode pre .decorator,.hljs-xcode pre .ini .title,.hljs-xcode pre .shebang,.hljs-xcode pre .input_number,.hljs-xcode pre .hexcolor,.hljs-xcode pre .rules .value,.hljs-xcode pre .css .value .number,.hljs-xcode pre .symbol,.hljs-xcode pre .symbol .string,.hljs-xcode pre .number,.hljs-xcode pre .css .function,.hljs-xcode pre .clojure .title,.hljs-xcode pre .clojure .built_in{color:#1c00cf;}.hljs-xcode pre .class .title,.hljs-xcode pre .haskell .type,.hljs-xcode pre .smalltalk .class,.hljs-xcode pre .javadoctag,.hljs-xcode pre .yardoctag,.hljs-xcode pre .phpdoc,.hljs-xcode pre .typename,.hljs-xcode pre .tag .attribute,.hljs-xcode pre .doctype,.hljs-xcode pre .class .id,.hljs-xcode pre .built_in,.hljs-xcode pre .setting,.hljs-xcode pre .params,.hljs-xcode pre .clojure .attribute{color:#5c2699;}.hljs-xcode pre .variable{color:#3f6e74;}.hljs-xcode pre .css .tag,.hljs-xcode pre .rules .property,.hljs-xcode pre .pseudo,.hljs-xcode pre .subst{color:#000;}.hljs-xcode pre .css .class,.hljs-xcode pre .css .id{color:#9B703F;}.hljs-xcode pre .value .important{color:#ff7700;font-weight:bold;}.hljs-xcode pre .rules .keyword{color:#C5AF75;}.hljs-xcode pre .annotation,.hljs-xcode pre .apache .sqbracket,.hljs-xcode pre .nginx .built_in{color:#9B859D;}.hljs-xcode pre .preprocessor,.hljs-xcode pre .preprocessor *{color:#643820;}.hljs-xcode pre .tex .formula{background-color:#EEE;font-style:italic;}.hljs-xcode pre .diff .header,.hljs-xcode pre .chunk{color:#808080;font-weight:bold;}.hljs-xcode pre .diff .change{background-color:#BCCFF9;}.hljs-xcode pre .addition{background-color:#BAEEBA;}.hljs-xcode pre .deletion{background-color:#FFC8BD;}.hljs-xcode pre .comment .yardoctag{font-weight:bold;}.hljs-xcode pre .method .id{color:#000;}","rainbow":".hljs-rainbow{}.hljs-rainbow pre ::-moz-selection{background:#FF5E99;color:#fff;text-shadow:none;}.hljs-rainbow pre ::selection{background:#FF5E99;color:#fff;text-shadow:none;}.hljs-rainbow pre code{display:block;padding:0.5em;background:#474949;color:#D1D9E1;}.hljs-rainbow pre .body,.hljs-rainbow pre .collection{color:#D1D9E1;}.hljs-rainbow pre .comment,.hljs-rainbow pre .template_comment,.hljs-rainbow pre .diff .header,.hljs-rainbow pre .doctype,.hljs-rainbow pre .lisp .string,.hljs-rainbow pre .javadoc{color:#969896;font-style:italic;}.hljs-rainbow pre .keyword,.hljs-rainbow pre .clojure .attribute,.hljs-rainbow pre .winutils,.hljs-rainbow pre .javascript .title,.hljs-rainbow pre .addition,.hljs-rainbow pre .css .tag{color:#cc99cc;}.hljs-rainbow pre .number{color:#f99157;}.hljs-rainbow pre .command,.hljs-rainbow pre .string,.hljs-rainbow pre .tag .value,.hljs-rainbow pre .phpdoc,.hljs-rainbow pre .tex .formula,.hljs-rainbow pre .regexp,.hljs-rainbow pre .hexcolor{color:#8abeb7;}.hljs-rainbow pre .title,.hljs-rainbow pre .localvars,.hljs-rainbow pre .function .title,.hljs-rainbow pre .chunk,.hljs-rainbow pre .decorator,.hljs-rainbow pre .built_in,.hljs-rainbow pre .lisp .title,.hljs-rainbow pre .identifier{color:#b5bd68;}.hljs-rainbow pre .class .keyword{color:#f2777a;}.hljs-rainbow pre .variable,.hljs-rainbow pre .lisp .body,.hljs-rainbow pre .smalltalk .number,.hljs-rainbow pre .constant,.hljs-rainbow pre .class .title,.hljs-rainbow pre .parent,.hljs-rainbow pre .haskell .label,.hljs-rainbow pre .id,.hljs-rainbow pre .lisp .title,.hljs-rainbow pre .clojure .title .built_in{color:#ffcc66;}.hljs-rainbow pre .tag .title,.hljs-rainbow pre .rules .property,.hljs-rainbow pre .django .tag .keyword,.hljs-rainbow pre .clojure .title .built_in{font-weight:bold;}.hljs-rainbow pre .attribute,.hljs-rainbow pre .clojure .title{color:#81a2be;}.hljs-rainbow pre .preprocessor,.hljs-rainbow pre .pi,.hljs-rainbow pre .shebang,.hljs-rainbow pre .symbol,.hljs-rainbow pre .symbol .string,.hljs-rainbow pre .diff .change,.hljs-rainbow pre .special,.hljs-rainbow pre .attr_selector,.hljs-rainbow pre .important,.hljs-rainbow pre .subst,.hljs-rainbow pre .cdata{color:#f99157;}.hljs-rainbow pre .deletion{color:#dc322f;}.hljs-rainbow pre .tex .formula{background:#eee8d5;}","tomorrow-night-bright":".hljs-tomorrow-night-bright{}.hljs-tomorrow-night-bright .tomorrow-comment,.hljs-tomorrow-night-bright pre .comment,.hljs-tomorrow-night-bright pre .title{color:#969896;}.hljs-tomorrow-night-bright .tomorrow-red,.hljs-tomorrow-night-bright pre .variable,.hljs-tomorrow-night-bright pre .attribute,.hljs-tomorrow-night-bright pre .tag,.hljs-tomorrow-night-bright pre .regexp,.hljs-tomorrow-night-bright pre .ruby .constant,.hljs-tomorrow-night-bright pre .xml .tag .title,.hljs-tomorrow-night-bright pre .xml .pi,.hljs-tomorrow-night-bright pre .xml .doctype,.hljs-tomorrow-night-bright pre .html .doctype,.hljs-tomorrow-night-bright pre .css .id,.hljs-tomorrow-night-bright pre .css .class,.hljs-tomorrow-night-bright pre .css .pseudo{color:#d54e53;}.hljs-tomorrow-night-bright .tomorrow-orange,.hljs-tomorrow-night-bright pre .number,.hljs-tomorrow-night-bright pre .preprocessor,.hljs-tomorrow-night-bright pre .built_in,.hljs-tomorrow-night-bright pre .literal,.hljs-tomorrow-night-bright pre .params,.hljs-tomorrow-night-bright pre .constant{color:#e78c45;}.hljs-tomorrow-night-bright .tomorrow-yellow,.hljs-tomorrow-night-bright pre .class,.hljs-tomorrow-night-bright pre .ruby .class .title,.hljs-tomorrow-night-bright pre .css .rules .attribute{color:#e7c547;}.hljs-tomorrow-night-bright .tomorrow-green,.hljs-tomorrow-night-bright pre .string,.hljs-tomorrow-night-bright pre .value,.hljs-tomorrow-night-bright pre .inheritance,.hljs-tomorrow-night-bright pre .header,.hljs-tomorrow-night-bright pre .ruby .symbol,.hljs-tomorrow-night-bright pre .xml .cdata{color:#b9ca4a;}.hljs-tomorrow-night-bright .tomorrow-aqua,.hljs-tomorrow-night-bright pre .css .hexcolor{color:#70c0b1;}.hljs-tomorrow-night-bright .tomorrow-blue,.hljs-tomorrow-night-bright pre .function,.hljs-tomorrow-night-bright pre .python .decorator,.hljs-tomorrow-night-bright pre .python .title,.hljs-tomorrow-night-bright pre .ruby .function .title,.hljs-tomorrow-night-bright pre .ruby .title .keyword,.hljs-tomorrow-night-bright pre .perl .sub,.hljs-tomorrow-night-bright pre .javascript .title,.hljs-tomorrow-night-bright pre .coffeescript .title{color:#7aa6da;}.hljs-tomorrow-night-bright .tomorrow-purple,.hljs-tomorrow-night-bright pre .keyword,.hljs-tomorrow-night-bright pre .javascript .function{color:#c397d8;}.hljs-tomorrow-night-bright pre code{display:block;background:black;color:#eaeaea;padding:0.5em;}.hljs-tomorrow-night-bright pre .coffeescript .javascript,.hljs-tomorrow-night-bright pre .javascript .xml,.hljs-tomorrow-night-bright pre .tex .formula,.hljs-tomorrow-night-bright pre .xml .javascript,.hljs-tomorrow-night-bright pre .xml .vbscript,.hljs-tomorrow-night-bright pre .xml .css,.hljs-tomorrow-night-bright pre .xml .cdata{opacity:0.5;}","ir_black":".hljs-ir_black{}.hljs-ir_black pre code{display:block;padding:0.5em;background:#000;color:#f8f8f8;}.hljs-ir_black pre .shebang,.hljs-ir_black pre .comment,.hljs-ir_black pre .template_comment,.hljs-ir_black pre .javadoc{color:#7c7c7c;}.hljs-ir_black pre .keyword,.hljs-ir_black pre .tag,.hljs-ir_black pre .tex .command,.hljs-ir_black pre .request,.hljs-ir_black pre .status,.hljs-ir_black pre .clojure .attribute{color:#96CBFE;}.hljs-ir_black pre .sub .keyword,.hljs-ir_black pre .method,.hljs-ir_black pre .list .title,.hljs-ir_black pre .nginx .title{color:#FFFFB6;}.hljs-ir_black pre .string,.hljs-ir_black pre .tag .value,.hljs-ir_black pre .cdata,.hljs-ir_black pre .filter .argument,.hljs-ir_black pre .attr_selector,.hljs-ir_black pre .apache .cbracket,.hljs-ir_black pre .date{color:#A8FF60;}.hljs-ir_black pre .subst{color:#DAEFA3;}.hljs-ir_black pre .regexp{color:#E9C062;}.hljs-ir_black pre .title,.hljs-ir_black pre .sub .identifier,.hljs-ir_black pre .pi,.hljs-ir_black pre .decorator,.hljs-ir_black pre .tex .special,.hljs-ir_black pre .haskell .type,.hljs-ir_black pre .constant,.hljs-ir_black pre .smalltalk .class,.hljs-ir_black pre .javadoctag,.hljs-ir_black pre .yardoctag,.hljs-ir_black pre .phpdoc,.hljs-ir_black pre .nginx .built_in{color:#FFFFB6;}.hljs-ir_black pre .symbol,.hljs-ir_black pre .ruby .symbol .string,.hljs-ir_black pre .number,.hljs-ir_black pre .variable,.hljs-ir_black pre .vbscript,.hljs-ir_black pre .literal{color:#C6C5FE;}.hljs-ir_black pre .css .tag{color:#96CBFE;}.hljs-ir_black pre .css .rules .property,.hljs-ir_black pre .css .id{color:#FFFFB6;}.hljs-ir_black pre .css .class{color:#FFF;}.hljs-ir_black pre .hexcolor{color:#C6C5FE;}.hljs-ir_black pre .number{color:#FF73FD;}.hljs-ir_black pre .coffeescript .javascript,.hljs-ir_black pre .javascript .xml,.hljs-ir_black pre .tex .formula,.hljs-ir_black pre .xml .javascript,.hljs-ir_black pre .xml .vbscript,.hljs-ir_black pre .xml .css,.hljs-ir_black pre .xml .cdata{opacity:0.7;}","tomorrow-night-blue":".hljs-tomorrow-night-blue{}.hljs-tomorrow-night-blue .tomorrow-comment,.hljs-tomorrow-night-blue pre .comment,.hljs-tomorrow-night-blue pre .title{color:#7285b7;}.hljs-tomorrow-night-blue .tomorrow-red,.hljs-tomorrow-night-blue pre .variable,.hljs-tomorrow-night-blue pre .attribute,.hljs-tomorrow-night-blue pre .tag,.hljs-tomorrow-night-blue pre .regexp,.hljs-tomorrow-night-blue pre .ruby .constant,.hljs-tomorrow-night-blue pre .xml .tag .title,.hljs-tomorrow-night-blue pre .xml .pi,.hljs-tomorrow-night-blue pre .xml .doctype,.hljs-tomorrow-night-blue pre .html .doctype,.hljs-tomorrow-night-blue pre .css .id,.hljs-tomorrow-night-blue pre .css .class,.hljs-tomorrow-night-blue pre .css .pseudo{color:#ff9da4;}.hljs-tomorrow-night-blue .tomorrow-orange,.hljs-tomorrow-night-blue pre .number,.hljs-tomorrow-night-blue pre .preprocessor,.hljs-tomorrow-night-blue pre .built_in,.hljs-tomorrow-night-blue pre .literal,.hljs-tomorrow-night-blue pre .params,.hljs-tomorrow-night-blue pre .constant{color:#ffc58f;}.hljs-tomorrow-night-blue .tomorrow-yellow,.hljs-tomorrow-night-blue pre .class,.hljs-tomorrow-night-blue pre .ruby .class .title,.hljs-tomorrow-night-blue pre .css .rules .attribute{color:#ffeead;}.hljs-tomorrow-night-blue .tomorrow-green,.hljs-tomorrow-night-blue pre .string,.hljs-tomorrow-night-blue pre .value,.hljs-tomorrow-night-blue pre .inheritance,.hljs-tomorrow-night-blue pre .header,.hljs-tomorrow-night-blue pre .ruby .symbol,.hljs-tomorrow-night-blue pre .xml .cdata{color:#d1f1a9;}.hljs-tomorrow-night-blue .tomorrow-aqua,.hljs-tomorrow-night-blue pre .css .hexcolor{color:#99ffff;}.hljs-tomorrow-night-blue .tomorrow-blue,.hljs-tomorrow-night-blue pre .function,.hljs-tomorrow-night-blue pre .python .decorator,.hljs-tomorrow-night-blue pre .python .title,.hljs-tomorrow-night-blue pre .ruby .function .title,.hljs-tomorrow-night-blue pre .ruby .title .keyword,.hljs-tomorrow-night-blue pre .perl .sub,.hljs-tomorrow-night-blue pre .javascript .title,.hljs-tomorrow-night-blue pre .coffeescript .title{color:#bbdaff;}.hljs-tomorrow-night-blue .tomorrow-purple,.hljs-tomorrow-night-blue pre .keyword,.hljs-tomorrow-night-blue pre .javascript .function{color:#ebbbff;}.hljs-tomorrow-night-blue pre code{display:block;background:#002451;color:white;padding:0.5em;}.hljs-tomorrow-night-blue pre .coffeescript .javascript,.hljs-tomorrow-night-blue pre .javascript .xml,.hljs-tomorrow-night-blue pre .tex .formula,.hljs-tomorrow-night-blue pre .xml .javascript,.hljs-tomorrow-night-blue pre .xml .vbscript,.hljs-tomorrow-night-blue pre .xml .css,.hljs-tomorrow-night-blue pre .xml .cdata{opacity:0.5;}","idea":".hljs-idea{}.hljs-idea pre code{display:block;padding:0.5em;color:#000;background:#fff;}.hljs-idea pre .subst,.hljs-idea pre .title{font-weight:normal;color:#000;}.hljs-idea pre .comment,.hljs-idea pre .template_comment,.hljs-idea pre .javadoc,.hljs-idea pre .diff .header{color:#808080;font-style:italic;}.hljs-idea pre .annotation,.hljs-idea pre .decorator,.hljs-idea pre .preprocessor,.hljs-idea pre .doctype,.hljs-idea pre .pi,.hljs-idea pre .chunk,.hljs-idea pre .shebang,.hljs-idea pre .apache .cbracket,.hljs-idea pre .input_number,.hljs-idea pre .http .title{color:#808000;}.hljs-idea pre .tag,.hljs-idea pre .pi{background:#efefef;}.hljs-idea pre .tag .title,.hljs-idea pre .id,.hljs-idea pre .attr_selector,.hljs-idea pre .pseudo,.hljs-idea pre .literal,.hljs-idea pre .keyword,.hljs-idea pre .hexcolor,.hljs-idea pre .css .function,.hljs-idea pre .ini .title,.hljs-idea pre .css .class,.hljs-idea pre .list .title,.hljs-idea pre .clojure .title,.hljs-idea pre .nginx .title,.hljs-idea pre .tex .command,.hljs-idea pre .request,.hljs-idea pre .status{font-weight:bold;color:#000080;}.hljs-idea pre .attribute,.hljs-idea pre .rules .keyword,.hljs-idea pre .number,.hljs-idea pre .date,.hljs-idea pre .regexp,.hljs-idea pre .tex .special{font-weight:bold;color:#0000ff;}.hljs-idea pre .number,.hljs-idea pre .regexp{font-weight:normal;}.hljs-idea pre .string,.hljs-idea pre .value,.hljs-idea pre .filter .argument,.hljs-idea pre .css .function .params,.hljs-idea pre .apache .tag{color:#008000;font-weight:bold;}.hljs-idea pre .symbol,.hljs-idea pre .ruby .symbol .string,.hljs-idea pre .char,.hljs-idea pre .tex .formula{color:#000;background:#d0eded;font-style:italic;}.hljs-idea pre .phpdoc,.hljs-idea pre .yardoctag,.hljs-idea pre .javadoctag{text-decoration:underline;}.hljs-idea pre .variable,.hljs-idea pre .envvar,.hljs-idea pre .apache .sqbracket,.hljs-idea pre .nginx .built_in{color:#660e7a;}.hljs-idea pre .addition{background:#baeeba;}.hljs-idea pre .deletion{background:#ffc8bd;}.hljs-idea pre .diff .change{background:#bccff9;}","zenburn":".hljs-zenburn{}.hljs-zenburn pre code{display:block;padding:0.5em;background:#3F3F3F;color:#DCDCDC;}.hljs-zenburn pre .keyword,.hljs-zenburn pre .tag,.hljs-zenburn pre .css .class,.hljs-zenburn pre .css .id,.hljs-zenburn pre .lisp .title,.hljs-zenburn pre .nginx .title,.hljs-zenburn pre .request,.hljs-zenburn pre .status,.hljs-zenburn pre .clojure .attribute{color:#E3CEAB;}.hljs-zenburn pre .django .template_tag,.hljs-zenburn pre .django .variable,.hljs-zenburn pre .django .filter .argument{color:#DCDCDC;}.hljs-zenburn pre .number,.hljs-zenburn pre .date{color:#8CD0D3;}.hljs-zenburn pre .dos .envvar,.hljs-zenburn pre .dos .stream,.hljs-zenburn pre .variable,.hljs-zenburn pre .apache .sqbracket{color:#EFDCBC;}.hljs-zenburn pre .dos .flow,.hljs-zenburn pre .diff .change,.hljs-zenburn pre .python .exception,.hljs-zenburn pre .python .built_in,.hljs-zenburn pre .literal,.hljs-zenburn pre .tex .special{color:#EFEFAF;}.hljs-zenburn pre .diff .chunk,.hljs-zenburn pre .subst{color:#8F8F8F;}.hljs-zenburn pre .dos .keyword,.hljs-zenburn pre .python .decorator,.hljs-zenburn pre .title,.hljs-zenburn pre .haskell .type,.hljs-zenburn pre .diff .header,.hljs-zenburn pre .ruby .class .parent,.hljs-zenburn pre .apache .tag,.hljs-zenburn pre .nginx .built_in,.hljs-zenburn pre .tex .command,.hljs-zenburn pre .input_number{color:#efef8f;}.hljs-zenburn pre .dos .winutils,.hljs-zenburn pre .ruby .symbol,.hljs-zenburn pre .ruby .symbol .string,.hljs-zenburn pre .ruby .string{color:#DCA3A3;}.hljs-zenburn pre .diff .deletion,.hljs-zenburn pre .string,.hljs-zenburn pre .tag .value,.hljs-zenburn pre .preprocessor,.hljs-zenburn pre .built_in,.hljs-zenburn pre .sql .aggregate,.hljs-zenburn pre .javadoc,.hljs-zenburn pre .smalltalk .class,.hljs-zenburn pre .smalltalk .localvars,.hljs-zenburn pre .smalltalk .array,.hljs-zenburn pre .css .rules .value,.hljs-zenburn pre .attr_selector,.hljs-zenburn pre .pseudo,.hljs-zenburn pre .apache .cbracket,.hljs-zenburn pre .tex .formula{color:#CC9393;}.hljs-zenburn pre .shebang,.hljs-zenburn pre .diff .addition,.hljs-zenburn pre .comment,.hljs-zenburn pre .java .annotation,.hljs-zenburn pre .template_comment,.hljs-zenburn pre .pi,.hljs-zenburn pre .doctype{color:#7F9F7F;}.hljs-zenburn pre .coffeescript .javascript,.hljs-zenburn pre .javascript .xml,.hljs-zenburn pre .tex .formula,.hljs-zenburn pre .xml .javascript,.hljs-zenburn pre .xml .vbscript,.hljs-zenburn pre .xml .css,.hljs-zenburn pre .xml .cdata{opacity:0.5;}","monokai":".hljs-monokai{}.hljs-monokai pre code{display:block;padding:0.5em;background:#272822;}.hljs-monokai pre .tag,.hljs-monokai pre .tag .title,.hljs-monokai pre .keyword,.hljs-monokai pre .literal,.hljs-monokai pre .change,.hljs-monokai pre .winutils,.hljs-monokai pre .flow,.hljs-monokai pre .lisp .title,.hljs-monokai pre .clojure .built_in,.hljs-monokai pre .nginx .title,.hljs-monokai pre .tex .special{color:#F92672;}.hljs-monokai pre code{color:#DDD;}.hljs-monokai pre code .constant{color:#66D9EF;}.hljs-monokai pre .class .title{color:white;}.hljs-monokai pre .attribute,.hljs-monokai pre .symbol,.hljs-monokai pre .symbol .string,.hljs-monokai pre .value,.hljs-monokai pre .regexp{color:#BF79DB;}.hljs-monokai pre .tag .value,.hljs-monokai pre .string,.hljs-monokai pre .subst,.hljs-monokai pre .title,.hljs-monokai pre .haskell .type,.hljs-monokai pre .preprocessor,.hljs-monokai pre .ruby .class .parent,.hljs-monokai pre .built_in,.hljs-monokai pre .sql .aggregate,.hljs-monokai pre .django .template_tag,.hljs-monokai pre .django .variable,.hljs-monokai pre .smalltalk .class,.hljs-monokai pre .javadoc,.hljs-monokai pre .django .filter .argument,.hljs-monokai pre .smalltalk .localvars,.hljs-monokai pre .smalltalk .array,.hljs-monokai pre .attr_selector,.hljs-monokai pre .pseudo,.hljs-monokai pre .addition,.hljs-monokai pre .stream,.hljs-monokai pre .envvar,.hljs-monokai pre .apache .tag,.hljs-monokai pre .apache .cbracket,.hljs-monokai pre .tex .command,.hljs-monokai pre .input_number{color:#A6E22E;}.hljs-monokai pre .comment,.hljs-monokai pre .java .annotation,.hljs-monokai pre .python .decorator,.hljs-monokai pre .template_comment,.hljs-monokai pre .pi,.hljs-monokai pre .doctype,.hljs-monokai pre .deletion,.hljs-monokai pre .shebang,.hljs-monokai pre .apache .sqbracket,.hljs-monokai pre .tex .formula{color:#75715E;}.hljs-monokai pre .keyword,.hljs-monokai pre .literal,.hljs-monokai pre .css .id,.hljs-monokai pre .phpdoc,.hljs-monokai pre .title,.hljs-monokai pre .haskell .type,.hljs-monokai pre .vbscript .built_in,.hljs-monokai pre .sql .aggregate,.hljs-monokai pre .rsl .built_in,.hljs-monokai pre .smalltalk .class,.hljs-monokai pre .diff .header,.hljs-monokai pre .chunk,.hljs-monokai pre .winutils,.hljs-monokai pre .bash .variable,.hljs-monokai pre .apache .tag,.hljs-monokai pre .tex .special,.hljs-monokai pre .request,.hljs-monokai pre .status{font-weight:bold;}.hljs-monokai pre .coffeescript .javascript,.hljs-monokai pre .javascript .xml,.hljs-monokai pre .tex .formula,.hljs-monokai pre .xml .javascript,.hljs-monokai pre .xml .vbscript,.hljs-monokai pre .xml .css,.hljs-monokai pre .xml .cdata{opacity:0.5;}"},
  engine: hljs
};

})()
},{}],4:[function(require,module,exports){
/* Automatically generated */

module.exports = {
  documentStyles: "html.remark-container,body.remark-container{height:100%;}.remark-container{background:#d7d8d2;margin:0;overflow:hidden;}.remark-container:focus{outline-style:solid;outline-width:1px;}.remark-slideshow-area{position:absolute;height:100%;width:100%;}.remark-slideshow{background:#fff;overflow:hidden;position:absolute;-webkit-transform-origin:top left;-moz-transform-origin:top left;transform-origin:top-left;-moz-box-shadow:0 0 30px #888;-webkit-box-shadow:0 0 30px #888;box-shadow:0 0 30px #888;}.remark-slide{height:100%;width:100%;}.remark-slide>.left{text-align:left;}.remark-slide>.center{text-align:center;}.remark-slide>.right{text-align:right;}.remark-slide>.top{vertical-align:top;}.remark-slide>.middle{vertical-align:middle;}.remark-slide>.bottom{vertical-align:bottom;}.remark-slide .remark-slide-content{background-position:center;background-repeat:no-repeat;display:table-cell;padding:1em 4em 1em 4em;}.remark-slide .remark-slide-content .left{display:block;text-align:left;}.remark-slide .remark-slide-content .center{display:block;text-align:center;}.remark-slide .remark-slide-content .right{display:block;text-align:right;}.remark-position{bottom:12px;opacity:0.5;position:absolute;right:20px;}.remark-backdrop{position:absolute;top:0;bottom:0;left:0;right:0;display:none;opacity:0.95;background:#000;}.remark-help{bottom:0;top:0;right:0;left:0;display:none;position:absolute;z-index:1000;-webkit-transform-origin:top left;-moz-transform-origin:top left;transform-origin:top-left;}.remark-help .remark-help-content{color:white;font-family:Helvetica,arial,freesans,clean,sans-serif;font-size:12pt;position:absolute;top:10%;bottom:10%;left:10%;height:10%;}.remark-help .remark-help-content td{color:white;font-size:12pt;padding:10px;}.remark-help .remark-help-content td:first-child{padding-left:0;}.remark-help .remark-help-content .key{background:white;color:black;min-width:1em;display:inline-block;padding:3px 6px;text-align:center;border-radius:4px;}.remark-help .dismiss{top:85%;}.remark-container.remark-help-mode .remark-help{display:block;}.remark-container.remark-help-mode .remark-backdrop{display:block;}.remark-preview-area{bottom:2%;left:2%;display:none;opacity:0.5;position:absolute;height:47.25%;width:48%;}.remark-preview-area .remark-slideshow:empty{display:none;}.remark-notes-area{background:#e7e8e2;bottom:0;display:none;left:52%;overflow:hidden;padding:1.5em;position:absolute;right:0;top:0;}.remark-toolbar{color:#979892;padding-bottom:1em;}.remark-toolbar .remark-toolbar-link{border:2px solid #d7d8d2;color:#979892;display:inline-block;padding:2px 2px;text-decoration:none;text-align:center;min-width:20px;}.remark-toolbar .remark-toolbar-link:hover{border-color:#979892;color:#676862;}.remark-container.remark-presenter-mode .remark-slideshow-area{top:2%;left:2%;height:47.25%;width:48%;}.remark-container.remark-presenter-mode .remark-preview-area{display:block;}.remark-container.remark-presenter-mode .remark-notes-area{display:block;}",
  containerLayout: "<div class=\"remark-notes-area\">\n  <div class=\"remark-toolbar\">\n    <a class=\"remark-toolbar-link\" href=\"#increase\">+</a>\n    <a class=\"remark-toolbar-link\" href=\"#decrease\">-</a>\n  </div>\n  <div class=\"remark-notes\"></div>\n</div>\n<div class=\"remark-slideshow-area\">\n  <div class=\"remark-slideshow\">\n    <div class=\"remark-position\"></div>\n  </div>\n</div>\n<div class=\"remark-preview-area\">\n  <div class=\"remark-slideshow\"></div>\n</div>\n<div class=\"remark-backdrop\"></div>\n<div class=\"remark-help\">\n  <div class=\"remark-help-content\">\n    <h1>Help</h1>\n    <p><b>Keyboard shortcuts</b></p>\n    <table class=\"light-keys\">\n      <tr>\n        <td>\n          <span class=\"key\"><b>&uarr;</b></span>,\n          <span class=\"key\"><b>&larr;</b></span>,\n          <span class=\"key\">Pg Up</span>,\n          <span class=\"key\">K</span>\n        </td>\n        <td>Go to previous slide</td>\n      </tr>\n      <tr>\n        <td>\n          <span class=\"key\"><b>&darr;</b></span>,\n          <span class=\"key\"><b>&rarr;</b></span>,\n          <span class=\"key\">Pg Dn</span>,\n          <span class=\"key\">Space</span>,\n          <span class=\"key\">J</span>\n        </td>\n        <td>Go to next slide</td>\n      </tr>\n      <tr>\n        <td>\n          <span class=\"key\">Home</span>\n        </td>\n        <td>Go to first slide</td>\n      </tr>\n      <tr>\n        <td>\n          <span class=\"key\">End</span>\n        </td>\n        <td>Go to last slide</td>\n      </tr>\n      <tr>\n        <td>\n          <span class=\"key\">C</span>\n        </td>\n        <td>Clone slideshow</td>\n      </tr>\n      <tr>\n        <td>\n          <span class=\"key\">P</span>\n        </td>\n        <td>Toggle presenter mode</td>\n      </tr>\n      <tr>\n        <td>\n          <span class=\"key\">?</span>\n        </td>\n        <td>Toggle this help</td>\n      </tr>\n    </table>\n  </div>\n  <div class=\"content dismiss\">\n    <table class=\"light-keys\">\n      <tr>\n        <td>\n          <span class=\"key\">Esc</span>\n        </td>\n        <td>Back to slideshow</td>\n      </tr>\n    </table>\n  </div>\n</div>\n"
};

},{}],5:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            if (ev.source === window && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],6:[function(require,module,exports){
(function(process){if (!process.EventEmitter) process.EventEmitter = function () {};

var EventEmitter = exports.EventEmitter = process.EventEmitter;
var isArray = typeof Array.isArray === 'function'
    ? Array.isArray
    : function (xs) {
        return Object.prototype.toString.call(xs) === '[object Array]'
    }
;
function indexOf (xs, x) {
    if (xs.indexOf) return xs.indexOf(x);
    for (var i = 0; i < xs.length; i++) {
        if (x === xs[i]) return i;
    }
    return -1;
}

// By default EventEmitters will print a warning if more than
// 10 listeners are added to it. This is a useful default which
// helps finding memory leaks.
//
// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
var defaultMaxListeners = 10;
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!this._events) this._events = {};
  this._events.maxListeners = n;
};


EventEmitter.prototype.emit = function(type) {
  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events || !this._events.error ||
        (isArray(this._events.error) && !this._events.error.length))
    {
      if (arguments[1] instanceof Error) {
        throw arguments[1]; // Unhandled 'error' event
      } else {
        throw new Error("Uncaught, unspecified 'error' event.");
      }
      return false;
    }
  }

  if (!this._events) return false;
  var handler = this._events[type];
  if (!handler) return false;

  if (typeof handler == 'function') {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        var args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
    return true;

  } else if (isArray(handler)) {
    var args = Array.prototype.slice.call(arguments, 1);

    var listeners = handler.slice();
    for (var i = 0, l = listeners.length; i < l; i++) {
      listeners[i].apply(this, args);
    }
    return true;

  } else {
    return false;
  }
};

// EventEmitter is defined in src/node_events.cc
// EventEmitter.prototype.emit() is also defined there.
EventEmitter.prototype.addListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('addListener only takes instances of Function');
  }

  if (!this._events) this._events = {};

  // To avoid recursion in the case that type == "newListeners"! Before
  // adding it to the listeners, first emit "newListeners".
  this.emit('newListener', type, listener);

  if (!this._events[type]) {
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  } else if (isArray(this._events[type])) {

    // Check for listener leak
    if (!this._events[type].warned) {
      var m;
      if (this._events.maxListeners !== undefined) {
        m = this._events.maxListeners;
      } else {
        m = defaultMaxListeners;
      }

      if (m && m > 0 && this._events[type].length > m) {
        this._events[type].warned = true;
        console.error('(node) warning: possible EventEmitter memory ' +
                      'leak detected. %d listeners added. ' +
                      'Use emitter.setMaxListeners() to increase limit.',
                      this._events[type].length);
        console.trace();
      }
    }

    // If we've already got an array, just append.
    this._events[type].push(listener);
  } else {
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  var self = this;
  self.on(type, function g() {
    self.removeListener(type, g);
    listener.apply(this, arguments);
  });

  return this;
};

EventEmitter.prototype.removeListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('removeListener only takes instances of Function');
  }

  // does not use listeners(), so no side effect of creating _events[type]
  if (!this._events || !this._events[type]) return this;

  var list = this._events[type];

  if (isArray(list)) {
    var i = indexOf(list, listener);
    if (i < 0) return this;
    list.splice(i, 1);
    if (list.length == 0)
      delete this._events[type];
  } else if (this._events[type] === listener) {
    delete this._events[type];
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  if (arguments.length === 0) {
    this._events = {};
    return this;
  }

  // does not use listeners(), so no side effect of creating _events[type]
  if (type && this._events && this._events[type]) this._events[type] = null;
  return this;
};

EventEmitter.prototype.listeners = function(type) {
  if (!this._events) this._events = {};
  if (!this._events[type]) this._events[type] = [];
  if (!isArray(this._events[type])) {
    this._events[type] = [this._events[type]];
  }
  return this._events[type];
};

})(require("__browserify_process"))
},{"__browserify_process":5}],2:[function(require,module,exports){
var EventEmitter = require('events').EventEmitter
  , highlighter = require('./highlighter')
  , Slideshow = require('./models/slideshow')
  , SlideshowView = require('./views/slideshowView')
  , Controller = require('./controller')
  ;

// Expose highlighter to allow enumerating available styles and
// including external language grammars
module.exports.highlighter = highlighter;

// Creates slideshow initialized from options
module.exports.create = function (options) {
  var events
    , slideshow
    , slideshowView
    , controller
    ;

  options = applyDefaults(options);

  events = new EventEmitter();
  events.setMaxListeners(0);

  slideshow = new Slideshow(events, options);
  slideshowView = new SlideshowView(events, options.container, slideshow);
  controller = new Controller(events, slideshowView);

  return slideshow;
};

function applyDefaults (options) {
  var sourceElement;

  options = options || {};

  if (!options.hasOwnProperty('source')) {
    sourceElement = document.getElementById('source');
    if (sourceElement) {
      options.source = sourceElement.innerHTML;
      sourceElement.style.display = 'none';
    }
  }

  if (!(options.container instanceof window.HTMLElement)) {
    options.container = document.body;
  }

  return options;
}

},{"events":6,"./highlighter":3,"./models/slideshow":7,"./views/slideshowView":8,"./controller":9}],9:[function(require,module,exports){
module.exports = Controller;

function Controller (events, slideshowView) {
  addNavigationEventListeners(events, slideshowView);
  addKeyboardEventListeners(events);
  addMouseEventListeners(events);
  addTouchEventListeners(events);
}

function addNavigationEventListeners (events, slideshowView) {
  if (slideshowView.isEmbedded()) {
    events.emit('gotoSlide', 1);
  }
  else {
    events.on('hashchange', navigateByHash);
    events.on('slideChanged', updateHash);

    navigateByHash();
  }

  events.on('message', navigateByMessage);

  function navigateByHash () {
    var slideNoOrName = (window.location.hash || '').substr(1);
    events.emit('gotoSlide', slideNoOrName);
  }

  function updateHash (slideNoOrName) {
    window.location.hash = '#' + slideNoOrName;
  }

  function navigateByMessage(message) {
    var cap;

    if ((cap = /^gotoSlide:(\d+)$/.exec(message.data)) !== null) {
      events.emit('gotoSlide', parseInt(cap[1], 10));
    }
  }
}

function addKeyboardEventListeners (events) {
  events.on('keydown', function (event) {
    switch (event.keyCode) {
      case 33: // Page up
      case 37: // Left
      case 38: // Up
        events.emit('gotoPreviousSlide');
        break;
      case 32: // Space
      case 34: // Page down
      case 39: // Right
      case 40: // Down
        events.emit('gotoNextSlide');
        break;
      case 36: // Home
        events.emit('gotoFirstSlide');
        break;
      case 35: // End
        events.emit('gotoLastSlide');
        break;
      case 27: // Escape
        events.emit('hideOverlay');
        break;
    }
  });

  events.on('keypress', function (event) {
    switch (String.fromCharCode(event.which)) {
      case 'j':
        events.emit('gotoNextSlide');
        break;
      case 'k':
        events.emit('gotoPreviousSlide');
        break;
      case 'c':
        events.emit('createClone');
        break;
      case 'p':
        events.emit('togglePresenterMode');
        break;
      case '?':
        events.emit('toggleHelp');
        break;
    }
  });
}

function addMouseEventListeners (events) {
  events.on('mousewheel', function (event) {
    if (event.wheelDeltaY > 0) {
      events.emit('gotoPreviousSlide');
    }
    else if (event.wheelDeltaY < 0) {
      events.emit('gotoNextSlide');
    }
  });
}

function addTouchEventListeners (events) {
  var touch
    , startX
    , endX
    ;

  var isTap = function () {
    return Math.abs(startX - endX) < 10;
  };

  var handleTap = function () {
    events.emit('tap', endX);
  };

  var handleSwipe = function () {
    if (startX > endX) {
      events.emit('gotoNextSlide');
    }
    else {
      events.emit('gotoPreviousSlide');
    }
  };

  events.on('touchstart', function (event) {
    touch = event.touches[0];
    startX = touch.clientX;
  });

  events.on('touchend', function (event) {
    if (event.target.nodeName.toUpperCase() === 'A') {
      return;
    }

    touch = event.changedTouches[0];
    endX = touch.clientX;

    if (isTap()) {
      handleTap();
    }
    else {
      handleSwipe();
    }
  });

  events.on('touchmove', function (event) {
    event.preventDefault();
  });
}

},{}],7:[function(require,module,exports){
var EventEmitter = require('events').EventEmitter
  , Navigation = require('./slideshow/navigation')
  , utils = require('../utils')
  , Slide = require('./slide')
  , Parser = require('../parser')
  ;

module.exports = Slideshow;

Slideshow.prototype = new EventEmitter();
Slideshow.prototype.setMaxListeners(0);

function Slideshow (events, options) {
  var self = this
    , slides = []
    ;

  options = options || {};

  // Extend slideshow functionality
  Navigation.call(self, events);

  self.loadFromString = loadFromString;
  self.getSlides = getSlides;
  self.getSlideCount = getSlideCount;
  self.getSlideByName = getSlideByName;

  self.getRatio = getOrDefault('ratio', '4:3');
  self.getHighlightStyle = getOrDefault('highlightStyle', 'default');
  self.getHighlightLanguage = getOrDefault('highlightLanguage', '');

  loadFromString(options.source);

  function loadFromString (source) {
    source = source || '';

    slides = createSlides(source);
    expandVariables(slides);

    events.emit('slidesChanged');
  }

  function getSlides () {
    return slides.map(function (slide) { return slide; });
  }

  function getSlideCount () {
    return slides.length;
  }

  function getSlideByName (name) {
    return slides.byName[name];
  }

  function getOrDefault (key, defaultValue) {
    return function () {
      if (options[key] === undefined) {
        return defaultValue;
      }

      return options[key];
    };
  }
}

function createSlides (slideshowSource) {
  var parser = new Parser()
   ,  parsedSlides = parser.parse(slideshowSource)
    , slides = []
    , byName = {}
    , layoutSlide
    ;

  slides.byName = {};

  parsedSlides.forEach(function (slide, i) {
    var template, slideViewModel;

    if (slide.properties.continued === 'true' && i > 0) {
      template = slides[slides.length - 1];
    }
    else if (byName[slide.properties.template]) {
      template = byName[slide.properties.template];
    }
    else if (slide.properties.layout === 'false') {
      layoutSlide = undefined;
    }
    else if (layoutSlide && slide.properties.layout !== 'true') {
      template = layoutSlide;
    }

    slideViewModel = new Slide(i + 1, slide, template);

    if (slide.properties.layout === 'true') {
      layoutSlide = slideViewModel;
    }

    if (slide.properties.name) {
      byName[slide.properties.name] = slideViewModel;
    }

    if (slide.properties.layout !== 'true') {
      slides.push(slideViewModel);
      if (slide.properties.name) {
        slides.byName[slide.properties.name] = slideViewModel;
      }
    }
  });

  return slides;
}

function expandVariables (slides) {
  slides.forEach(function (slide) {
    slide.expandVariables();
  });
}

},{"events":6,"./slideshow/navigation":10,"../utils":11,"./slide":12,"../parser":13}],8:[function(require,module,exports){
var SlideView = require('./slideView')
  , resources = require('../resources')
  , addClass = require('../utils').addClass
  , toggleClass = require('../utils').toggleClass

  , referenceWidth = 908
  , referenceHeight = 681
  , referenceRatio = referenceWidth / referenceHeight / 1.1
  ;

module.exports = SlideshowView;

function SlideshowView (events, containerElement, slideshow) {
  var self = this;

  self.events = events;
  self.slideshow = slideshow;
  self.dimensions = {};

  self.configureContainerElement(containerElement);
  self.configureChildElements();

  self.updateDimensions();
  self.updateSlideViews();

  events.on('slidesChanged', function () {
    self.updateSlideViews();
  });

  events.on('hideSlide', function (slideIndex) {
    self.hideSlide(slideIndex);
  });

  events.on('showSlide', function (slideIndex) {
    self.showSlide(slideIndex);
  });

  events.on('togglePresenterMode', function () {
    toggleClass(self.containerElement, 'remark-presenter-mode');

    self.presenterMode = !!!self.presenterMode;
    self.updateDimensions();
  });

  events.on('toggleHelp', function () {
    toggleClass(self.containerElement, 'remark-help-mode');
  });
}

SlideshowView.prototype.isEmbedded = function () {
  return this.containerElement !== document.body;
};

SlideshowView.prototype.configureContainerElement = function (element) {
  var self = this;

  self.containerElement = element;

  addClass(element, 'remark-container');

  if (element === document.body) {
    addClass(document.getElementsByTagName('html')[0], 'remark-container');

    forwardEvents(self.events, window, [
      'hashchange', 'resize', 'keydown', 'keypress', 'mousewheel', 'message'
    ]);
    forwardEvents(self.events, document, [
      'touchstart', 'touchmove', 'touchend'
    ]);
  }
  else {
    element.style.position = 'absolute';
    element.tabIndex = -1;

    forwardEvents(self.events, element, [
      'keydown', 'keypress', 'mousewheel',
      'touchstart', 'touchmove', 'touchend'
    ]);
  }

  // Tap event is handled in slideshow view
  // rather than controller as knowledge of
  // container width is needed to determine
  // whether to move backwards or forwards
  self.events.on('tap', function (endX) {
    if (endX < self.getContainerWidth() / 2) {
      self.slideshow.gotoPreviousSlide();
    }
    else {
      self.slideshow.gotoNextSlide();
    }
  });
};

function forwardEvents (target, source, events) {
  events.forEach(function (eventName) {
    source.addEventListener(eventName, function () {
      var args = Array.prototype.slice.call(arguments);
      target.emit.apply(target, [eventName].concat(args));
    });
  });
}

SlideshowView.prototype.configureChildElements = function () {
  var self = this;

  self.containerElement.innerHTML += resources.containerLayout;

  self.elementArea = self.containerElement.getElementsByClassName('remark-slideshow-area')[0];
  self.element = self.elementArea.getElementsByClassName('remark-slideshow')[0];
  self.positionElement = self.element.getElementsByClassName('remark-position')[0];

  self.previewArea = self.containerElement.getElementsByClassName('remark-preview-area')[0];
  self.previewElement = self.previewArea.getElementsByClassName('remark-slideshow')[0];
  self.notesArea = self.containerElement.getElementsByClassName('remark-notes-area')[0];
  self.notesElement = self.notesArea.getElementsByClassName('remark-notes')[0];
  self.toolbarElement = self.notesArea.getElementsByClassName('remark-toolbar')[0];

  var commands = {
    increase: function () {
      self.notesElement.style.fontSize = (parseFloat(self.notesElement.style.fontSize) || 1) + 0.1 + 'em';
    },
    decrease: function () {
      self.notesElement.style.fontSize = (parseFloat(self.notesElement.style.fontSize) || 1) - 0.1 + 'em';
    }
  };

  self.toolbarElement.getElementsByTagName('a').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var command = e.target.hash.substr(1);
      commands[command]();
      e.preventDefault();
    });
  });

  self.backdropElement = self.containerElement.getElementsByClassName('remark-backdrop')[0];
  self.helpElement = self.containerElement.getElementsByClassName('remark-help')[0];

  self.events.on('propertiesChanged', function (changes) {
    if (changes.hasOwnProperty('ratio')) {
      self.updateDimensions();
    }
  });

  self.events.on('resize', onResize);

  function onResize () {
    self.scaleToFit(self.element, self.elementArea);
    self.scaleToFit(self.previewElement, self.previewArea);
    self.scaleToFit(self.helpElement, self.containerElement);
  }
};

SlideshowView.prototype.configurePositionElement = function () {
  var self = this;

  self.positionElement = document.createElement('div');
  self.positionElement.className = 'remark-position';
  self.element.appendChild(self.positionElement);
};

SlideshowView.prototype.updateSlideViews = function () {
  var self = this;

  if (self.slideViews) {
    self.slideViews.forEach(function (slideView) {
      self.element.removeChild(slideView.element);
    });
  }

  self.slideViews = self.slideshow.getSlides().map(function (slide) {
    return new SlideView(self.events, self.slideshow, slide);
  });

  self.slideViews.forEach(function (slideView) {
    self.element.appendChild(slideView.element);
  });

  self.scaleSlideBackgroundImages();

  if (self.slideshow.getCurrentSlideNo() > 0) {
    self.showSlide(self.slideshow.getCurrentSlideNo() - 1);
  }
};

SlideshowView.prototype.scaleSlideBackgroundImages = function () {
  var self = this;

  if (self.slideViews) {
    self.slideViews.forEach(function (slideView) {
      slideView.scaleBackgroundImage(self.dimensions);
    });
  }
};

SlideshowView.prototype.showSlide =  function (slideIndex) {
  var self = this
    , slideView = self.slideViews[slideIndex]
    , nextSlideView = self.slideViews[slideIndex + 1];

  self.slideshow.emit('slidein', slideView.element, slideIndex);
  slideView.show();
  self.positionElement.innerHTML =
    slideIndex + 1 + ' / ' + self.slideViews.length;
  self.notesElement.innerHTML = slideView.notesMarkup;

  if (nextSlideView) {
    self.previewElement.innerHTML = nextSlideView.element.outerHTML;
    self.previewElement.childNodes[0].style.display = 'table';
  }
  else {
    self.previewElement.innerHTML = '';
  }
};

SlideshowView.prototype.hideSlide = function (slideIndex) {
  var self = this
    , slideView = self.slideViews[slideIndex];

  self.slideshow.emit('slideout', slideView.element, slideIndex);
  slideView.hide();
};

SlideshowView.prototype.updateDimensions = function () {
  var self = this
    , ratio = getRatio(self.slideshow)
    , dimensions = getDimensions(ratio)
    ;

  this.ratio = ratio;
  this.dimensions.width = dimensions.width;
  this.dimensions.height = dimensions.height;

  this.element.style.width = this.dimensions.width + 'px';
  this.element.style.height = this.dimensions.height + 'px';
  this.previewElement.style.width = this.dimensions.width + 'px';
  this.previewElement.style.height = this.dimensions.height + 'px';
  this.helpElement.style.width = this.dimensions.width + 'px';
  this.helpElement.style.height = this.dimensions.height + 'px';

  this.scaleSlideBackgroundImages();
  this.scaleToFit(this.element, this.elementArea);
  this.scaleToFit(this.previewElement, this.previewArea);
  this.scaleToFit(this.helpElement, this.containerElement);
};

SlideshowView.prototype.scaleToFit = function (element, container) {
  var self = this
    , containerHeight = container.clientHeight
    , containerWidth = container.clientWidth
    , scale
    , scaledWidth
    , scaledHeight
    , ratio = this.ratio
    , dimensions = this.dimensions
    , direction
    , left
    , top
    ;

  if (containerWidth / ratio.width > containerHeight / ratio.height) {
    scale = containerHeight / dimensions.height;
  }
  else {
    scale = containerWidth / dimensions.width;
  }

  scaledWidth = dimensions.width * scale;
  scaledHeight = dimensions.height * scale;

  left = (containerWidth - scaledWidth) / 2;
  top = (containerHeight - scaledHeight) / 2;

  element.style['-webkit-transform'] = 'scale(' + scale + ')';
  element.style.MozTransform = 'scale(' + scale + ')';
  element.style.left = left + 'px';
  element.style.top = top + 'px';
};

function getRatio (slideshow) {
  var ratioComponents = slideshow.getRatio().split(':')
    , ratio
    ;

  ratio = {
    width: parseInt(ratioComponents[0], 10)
  , height: parseInt(ratioComponents[1], 10)
  };

  ratio.ratio = ratio.width / ratio.height;

  return ratio;
}

function getDimensions (ratio) {
  return {
    width: Math.floor(referenceWidth / referenceRatio * ratio.ratio)
  , height: referenceHeight
  };
}

},{"./slideView":14,"../resources":4,"../utils":11}],10:[function(require,module,exports){
module.exports = Navigation;

function Navigation (events) {
  var self = this
    , currentSlideNo = 0
    ;

  self.getCurrentSlideNo = getCurrentSlideNo;
  self.gotoSlide = gotoSlide;
  self.gotoPreviousSlide = gotoPreviousSlide;
  self.gotoNextSlide = gotoNextSlide;
  self.gotoFirstSlide = gotoFirstSlide;
  self.gotoLastSlide = gotoLastSlide;

  events.on('gotoSlide', gotoSlide);
  events.on('gotoPreviousSlide', gotoPreviousSlide);
  events.on('gotoNextSlide', gotoNextSlide);
  events.on('gotoFirstSlide', gotoFirstSlide);
  events.on('gotoLastSlide', gotoLastSlide);

  events.on('slidesChanged', function () {
    if (currentSlideNo > self.getSlideCount()) {
      currentSlideNo = self.getSlideCount();
    }
  });

  events.on('createClone', function () {
    if (!self.clone || self.clone.closed) {
      self.clone = window.open(location.href, '_blank', 'location=no');
    }
    else {
      self.clone.focus();
    }
  });

  function getCurrentSlideNo () {
    return currentSlideNo;
  }

  function gotoSlide (slideNoOrName) {
    var slideNo = getSlideNo(slideNoOrName)
      , alreadyOnSlide = slideNo === currentSlideNo
      , slideOutOfRange = slideNo < 1 || slideNo > self.getSlideCount()
      ;

    if (alreadyOnSlide || slideOutOfRange) {
      return;
    }

    if (currentSlideNo !== 0) {
      events.emit('hideSlide', currentSlideNo - 1);
    }

    events.emit('showSlide', slideNo - 1);

    currentSlideNo = slideNo;

    events.emit('slideChanged', slideNoOrName || slideNo);

    if (self.clone && !self.clone.closed) {
      self.clone.postMessage('gotoSlide:' + currentSlideNo, '*');
    }
  }

  function gotoPreviousSlide() {
    self.gotoSlide(currentSlideNo - 1);
  }

  function gotoNextSlide() {
    self.gotoSlide(currentSlideNo + 1);
  }

  function gotoFirstSlide () {
    self.gotoSlide(1);
  }

  function gotoLastSlide () {
    self.gotoSlide(self.getSlideCount());
  }

  function getSlideNo (slideNoOrName) {
    var slideNo
      , slide
      ;

    if (typeof slideNoOrName === 'number') {
      return slideNoOrName;
    }

    slideNo = parseInt(slideNoOrName, 10);
    if (slideNo.toString() === slideNoOrName) {
      return slideNo;
    }

    slide = self.getSlideByName(slideNoOrName);
    if (slide) {
      return slide.getSlideNo();
    }

    return 1;
  }
}

},{}],11:[function(require,module,exports){
exports.addClass = function (element, className) {
  element.className = exports.getClasses(element)
    .concat([className])
    .join(' ');
};

exports.toggleClass = function (element, className) {
  var classes = exports.getClasses(element),
      index = classes.indexOf(className);

  if (index !== -1) {
    classes.splice(index, 1);
  }
  else {
    classes.push(className);
  }

  element.className = classes.join(' ');
};

exports.getClasses = function (element) {
  return element.className
    .split(' ')
    .filter(function (s) { return s !== ''; });
};

forEach([Array, window.NodeList, window.HTMLCollection], extend);

function extend (object) {
  var prototype = object && object.prototype;

  if (!prototype) {
    return;
  }

  prototype.forEach = prototype.forEach || function (f) {
    forEach(this, f);
  };

  prototype.filter = prototype.filter || function (f) {
    var result = [];

    this.forEach(function (element) {
      if (f(element, result.length)) {
        result.push(element);
      }
    });

    return result;
  };

  prototype.map = prototype.map || function (f) {
    var result = [];

    this.forEach(function (element) {
      result.push(f(element, result.length));
    });

    return result;
  };
}

function forEach (list, f) {
  var i;

  for (i = 0; i < list.length; ++i) {
    f(list[i], i);
  }
}

},{}],12:[function(require,module,exports){
module.exports = Slide;

function Slide (slideNo, slide, template) {
  var self = this;

  self.properties = slide.properties || {};
  self.source = slide.source || '';
  self.notes = slide.notes || '';

  self.getSlideNo = function () { return slideNo; };

  if (template) {
    inherit(self, template);
  }
}

function inherit (slide, template) {
  inheritProperties(slide, template);
  inheritSource(slide, template);
}

function inheritProperties (slide, template) {
  var property
    , value
    ;

  for (property in template.properties) {
    if (!template.properties.hasOwnProperty(property) ||
        ignoreProperty(property)) {
      continue;
    }

    value = [template.properties[property]];

    if (property === 'class' && slide.properties[property]) {
      value.push(slide.properties[property]);
    }

    if (property === 'class' || slide.properties[property] === undefined) {
      slide.properties[property] = value.join(', ');
    }
  }
}

function ignoreProperty (property) {
  return property === 'name' ||
    property === 'layout';
}

function inheritSource (slide, template) {
  var expandedVariables;

  slide.properties.content = slide.source;
  slide.source = template.source;

  expandedVariables = slide.expandVariables(/* contentOnly: */ true);

  if (expandedVariables.content === undefined) {
    slide.source += slide.properties.content;
  }

  delete slide.properties.content;
}

Slide.prototype.expandVariables = function (contentOnly) {
  var properties = this.properties
    , expandResult = {}
    ;

  this.source = this.source.replace(/(\\)?(\{\{([^\}\n]+)\}\})/g,
    function (match, escaped, unescapedMatch, property) {
      var propertyName = property.trim()
        , propertyValue
        ;

      if (escaped) {
        return contentOnly ? match[0] : unescapedMatch;
      }

      if (contentOnly && propertyName !== 'content') {
        return match;
      }

      propertyValue = properties[propertyName];

      if (propertyValue !== undefined) {
        expandResult[propertyName] = propertyValue;
        return propertyValue;
      }

      return propertyName === 'content' ? '' : unescapedMatch;
    });

  return expandResult;
};

},{}],13:[function(require,module,exports){
var Lexer = require('./lexer'),
    converter = require('./converter');

module.exports = Parser;

function Parser () { }

Parser.prototype.parse = function (src) {
  var lexer = new Lexer(),
      tokens = lexer.lex(src),
      slides = [],
      slide = createSlide(),
      tag,
      classes;

  tokens.forEach(function (token) {
    switch (token.type) {
      case 'text':
      case 'code':
      case 'fences':
        appendTo(slide, token.text);
        break;
      case 'content_start':
        tag = token.block ? 'div' : 'span';
        classes = token.classes.join(' ');
        appendTo(slide, '&lt;' + tag + ' class="' + classes + '"&gt;');
        break;
      case 'content_end':
        tag = token.block ? 'div' : 'span';
        appendTo(slide, '&lt;/' + tag + '&gt;');
        break;
      case 'separator':
        slides.push(slide);
        slide = createSlide();
        slide.properties.continued = (token.text === '--').toString();
        break;
      case 'notes_separator':
        slide.notes = '';
        break;
    }
  });

  slides.push(slide);

  slides.forEach(function (slide) {
    slide.source = extractProperties(slide.source, slide.properties);
  });

  return slides;
};

function createSlide () {
  return {
    source: '',
    properties: {
      continued: 'false'
    }
  };
}

function appendTo (slide, content) {
  if (slide.notes !== undefined) {
    slide.notes += content;
  }
  else {
    slide.source += content;
  }
}

function extractProperties (source, properties) {
  var propertyFinder = /^\n*([-\w]+):([^$\n]*)/i
    , match
    ;

  while ((match = propertyFinder.exec(source)) !== null) {
    source = source.substr(0, match.index) +
      source.substr(match.index + match[0].length);

    properties[match[1].trim()] = match[2].trim();

    propertyFinder.lastIndex = match.index;
  }

  return source;
}

},{"./lexer":15,"./converter":16}],14:[function(require,module,exports){
var converter = require('../converter')
  , highlighter = require('../highlighter')
  , utils = require('../utils')
  ;

module.exports = SlideView;

function SlideView (events, slideshow, slide) {
  this.events = events;
  this.slideshow = slideshow;
  this.slide = slide;

  this.element = createSlideElement();
  this.contentElement = createContentElement(events, slideshow, slide.source, slide.properties);
  this.notesMarkup = createNotesMarkup(slideshow, slide.notes);

  this.element.appendChild(this.contentElement);
}

SlideView.prototype.show = function () {
  this.element.style.display = 'table';
};

SlideView.prototype.hide = function () {
  this.element.style.display = 'none';
};

SlideView.prototype.scaleBackgroundImage = function (dimensions) {
  var self = this
    , styles = window.getComputedStyle(this.contentElement)
    , backgroundImage = styles.backgroundImage
    , match
    , image
    ;

  if ((match = /^url\(([^\)]+?)\)/.exec(backgroundImage)) !== null) {
    image = new Image();
    image.onload = function () {
      if (image.width > dimensions.width ||
          image.height > dimensions.height) {
        // Background image is larger than slide
        if (!self.originalBackgroundSize) {
          // No custom background size has been set
          self.originalBackgroundSize = self.contentElement.style.backgroundSize;
          self.backgroundSizeSet = true;
          self.contentElement.style.backgroundSize = 'contain';
        }
      }
      else {
        // Revert to previous background size setting
        if (self.backgroundSizeSet) {
          self.contentElement.style.backgroundSize = self.originalBackgroundSize;
          self.backgroundSizeSet = false;
        }
      }
    };
    image.src = match[1];
  }
};

function createSlideElement () {
  var element = document.createElement('div');

  element.className = 'remark-slide';
  element.style.display = 'none';

  return element;
}

function createContentElement (events, slideshow, source, properties) {
  var element = document.createElement('div');

  if (properties.name) {
    element.id = 'slide-' + properties.name;
  }

  styleContentElement(slideshow, element, properties);

  element.innerHTML = converter.convertMarkdown(source);
  element.innerHTML = element.innerHTML.replace(/<p>\s*<\/p>/g, '');

  highlightCodeBlocks(element, slideshow);

  return element;
}

function styleContentElement (slideshow, element, properties) {
  element.className = '';

  setClassFromProperties(element, properties);
  setHighlightStyleFromProperties(element, properties, slideshow);
  setBackgroundFromProperties(element, properties);
}

function createNotesMarkup (slideshow, notes) {
  var element = document.createElement('div');

  element.innerHTML = converter.convertMarkdown(notes);
  element.innerHTML = element.innerHTML.replace(/<p>\s*<\/p>/g, '');

  highlightCodeBlocks(element, slideshow);

  return element.innerHTML;
}

function setBackgroundFromProperties (element, properties) {
  var backgroundImage = properties['background-image'];

  if (backgroundImage) {
    element.style.backgroundImage = backgroundImage;
  }
}

function setHighlightStyleFromProperties (element, properties, slideshow) {
  var highlightStyle = properties['highlight-style'] ||
      slideshow.getHighlightStyle();

  if (highlightStyle) {
    utils.addClass(element, 'hljs-' + highlightStyle);
  }
}

function setClassFromProperties (element, properties) {
  utils.addClass(element, 'remark-slide-content');

  (properties['class'] || '').split(/,| /)
    .filter(function (s) { return s !== ''; })
    .forEach(function (c) { utils.addClass(element, c); });
}

function highlightCodeBlocks (content, slideshow) {
  var codeBlocks = content.getElementsByTagName('code')
    ;

  codeBlocks.forEach(function (block) {
    if (block.className === '') {
      block.className = slideshow.getHighlightLanguage();
    }

    if (block.className !== '') {
      highlighter.engine.highlightBlock(block, '  ');
    }

    utils.addClass(block, 'remark-code');
  });
}

},{"../converter":16,"../highlighter":3,"../utils":11}],15:[function(require,module,exports){
module.exports = Lexer;

var CODE = 1,
    CONTENT = 2,
    FENCES = 3,
    SEPARATOR = 4,
    NOTES_SEPARATOR = 5;

var regexByName = {
    CODE: /(?:^|\n)( {4}[^\n]+\n*)+/,
    CONTENT: /(?:\\)?((?:\.[a-z_\-][a-z\-_0-9]*)+)\[/,
    FENCES: /(?:^|\n) *(`{3,}|~{3,}) *(?:\S+)? *\n(?:[\s\S]+?)\s*\3 *(?:\n+|$)/,
    SEPARATOR: /(?:^|\n)(---?)(?:\n|$)/,
    NOTES_SEPARATOR: /(?:^|\n)(\?{3})(?:\n|$)/
  };

var block = replace(/CODE|CONTENT|FENCES|SEPARATOR|NOTES_SEPARATOR/, regexByName),
    inline = replace(/CODE|CONTENT|FENCES/, regexByName);

function Lexer () { }

Lexer.prototype.lex = function (src) {
  var tokens = lex(src, block),
      i;

  for (i = tokens.length - 2; i >= 0; i--) {
    if (tokens[i].type === 'text' && tokens[i+1].type === 'text') {
      tokens[i].text += tokens[i+1].text;
      tokens.splice(i+1, 1);
    }
  }

  return tokens;
};

function lex (src, regex, tokens) {
  var cap, text;

  tokens = tokens || [];

  while ((cap = regex.exec(src)) !== null) {
    if (cap.index > 0) {
      tokens.push({
        type: 'text',
        text: src.substring(0, cap.index)
      });
    }

    if (cap[CODE]) {
      tokens.push({
        type: 'code',
        text: cap[0]
      });
    }
    else if (cap[FENCES]) {
      tokens.push({
        type: 'fences',
        text: cap[0]
      });
    }
    else if (cap[SEPARATOR]) {
      tokens.push({
        type: 'separator',
        text: cap[SEPARATOR]
      });
    }
    else if (cap[NOTES_SEPARATOR]) {
      tokens.push({
        type: 'notes_separator',
        text: cap[NOTES_SEPARATOR]
      });
    }
    else if (cap[CONTENT]) {
      text = getTextInBrackets(src, cap.index + cap[0].length);
      if (text !== undefined) {
        src = src.substring(text.length + 1);
        tokens.push({
          type: 'content_start',
          classes: cap[CONTENT].substring(1).split('.'),
          block: text.indexOf('\n') !== -1
        });
        lex(text, inline, tokens);
        tokens.push({
          type: 'content_end',
          block: text.indexOf('\n') !== -1
        });
      }
      else {
        tokens.push({
          type: 'text',
          text: cap[0]
        });
      }
    }

    src = src.substring(cap.index + cap[0].length);
  }

  if (src || (!src && tokens.length === 0)) {
    tokens.push({
      type: 'text',
      text: src
    });
  }

  return tokens;
}

function replace (regex, replacements) {
  return new RegExp(regex.source.replace(/\w{2,}/g, function (key) {
    return replacements[key].source;
  }));
}

function getTextInBrackets (src, offset) {
  var depth = 1,
      pos = offset,
      chr;

  while (depth > 0 && pos < src.length) {
    chr = src[pos++];
    depth += (chr === '[' && 1) || (chr === ']' && -1) || 0;
  }

  if (depth === 0) {
    src = src.substr(offset, pos - offset - 1);
    return src;
  }
}

},{}],16:[function(require,module,exports){
var marked = require('marked')
  , converter = module.exports = {}
  ;

marked.setOptions({
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  langPrefix: ''
});

converter.convertMarkdown = function (source) {
  // Unescape block-quotes before conversion (&gt; => >)
  source = source.replace(/(^|\n)( *)&gt;/g, '$1$2>');

  // Perform the actual Markdown conversion
  source = marked(source.replace(/^\s+/, ''));

  // Unescape HTML escaped by the browser; &lt;, &gt;, ...
  source = source.replace(/&[l|g]t;/g,
    function (match) {
      return match === '&lt;' ? '<' : '>';
    });

  // ... and &amp;
  source = source.replace(/&amp;/g, '&');

  // ... and &quot;
  source = source.replace(/&quot;/g, '"');

  return source;
};

},{"marked":17}],17:[function(require,module,exports){
(function(global){/**
 * marked - a markdown parser
 * Copyright (c) 2011-2013, Christopher Jeffrey. (MIT Licensed)
 * https://github.com/chjj/marked
 */

;(function() {

/**
 * Block-Level Grammar
 */

var block = {
  newline: /^\n+/,
  code: /^( {4}[^\n]+\n*)+/,
  fences: noop,
  hr: /^( *[-*_]){3,} *(?:\n+|$)/,
  heading: /^ *(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/,
  nptable: noop,
  lheading: /^([^\n]+)\n *(=|-){3,} *\n*/,
  blockquote: /^( *>[^\n]+(\n[^\n]+)*\n*)+/,
  list: /^( *)(bull) [\s\S]+?(?:hr|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,
  html: /^ *(?:comment|closed|closing) *(?:\n{2,}|\s*$)/,
  def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +["(]([^\n]+)[")])? *(?:\n+|$)/,
  table: noop,
  paragraph: /^((?:[^\n]+\n?(?!hr|heading|lheading|blockquote|tag|def))+)\n*/,
  text: /^[^\n]+/
};

block.bullet = /(?:[*+-]|\d+\.)/;
block.item = /^( *)(bull) [^\n]*(?:\n(?!\1bull )[^\n]*)*/;
block.item = replace(block.item, 'gm')
  (/bull/g, block.bullet)
  ();

block.list = replace(block.list)
  (/bull/g, block.bullet)
  ('hr', /\n+(?=(?: *[-*_]){3,} *(?:\n+|$))/)
  ();

block._tag = '(?!(?:'
  + 'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code'
  + '|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo'
  + '|span|br|wbr|ins|del|img)\\b)\\w+(?!:/|@)\\b';

block.html = replace(block.html)
  ('comment', /<!--[\s\S]*?-->/)
  ('closed', /<(tag)[\s\S]+?<\/\1>/)
  ('closing', /<tag(?:"[^"]*"|'[^']*'|[^'">])*?>/)
  (/tag/g, block._tag)
  ();

block.paragraph = replace(block.paragraph)
  ('hr', block.hr)
  ('heading', block.heading)
  ('lheading', block.lheading)
  ('blockquote', block.blockquote)
  ('tag', '<' + block._tag)
  ('def', block.def)
  ();

/**
 * Normal Block Grammar
 */

block.normal = merge({}, block);

/**
 * GFM Block Grammar
 */

block.gfm = merge({}, block.normal, {
  fences: /^ *(`{3,}|~{3,}) *(\w+)? *\n([\s\S]+?)\s*\1 *(?:\n+|$)/,
  paragraph: /^/
});

block.gfm.paragraph = replace(block.paragraph)
  ('(?!', '(?!' + block.gfm.fences.source.replace('\\1', '\\2') + '|')
  ();

/**
 * GFM + Tables Block Grammar
 */

block.tables = merge({}, block.gfm, {
  nptable: /^ *(\S.*\|.*)\n *([-:]+ *\|[-| :]*)\n((?:.*\|.*(?:\n|$))*)\n*/,
  table: /^ *\|(.+)\n *\|( *[-:]+[-| :]*)\n((?: *\|.*(?:\n|$))*)\n*/
});

/**
 * Block Lexer
 */

function Lexer(options) {
  this.tokens = [];
  this.tokens.links = {};
  this.options = options || marked.defaults;
  this.rules = block.normal;

  if (this.options.gfm) {
    if (this.options.tables) {
      this.rules = block.tables;
    } else {
      this.rules = block.gfm;
    }
  }
}

/**
 * Expose Block Rules
 */

Lexer.rules = block;

/**
 * Static Lex Method
 */

Lexer.lex = function(src, options) {
  var lexer = new Lexer(options);
  return lexer.lex(src);
};

/**
 * Preprocessing
 */

Lexer.prototype.lex = function(src) {
  src = src
    .replace(/\r\n|\r/g, '\n')
    .replace(/\t/g, '    ')
    .replace(/\u00a0/g, ' ')
    .replace(/\u2424/g, '\n');

  return this.token(src, true);
};

/**
 * Lexing
 */

Lexer.prototype.token = function(src, top) {
  var src = src.replace(/^ +$/gm, '')
    , next
    , loose
    , cap
    , bull
    , b
    , item
    , space
    , i
    , l;

  while (src) {
    // newline
    if (cap = this.rules.newline.exec(src)) {
      src = src.substring(cap[0].length);
      if (cap[0].length > 1) {
        this.tokens.push({
          type: 'space'
        });
      }
    }

    // code
    if (cap = this.rules.code.exec(src)) {
      src = src.substring(cap[0].length);
      cap = cap[0].replace(/^ {4}/gm, '');
      this.tokens.push({
        type: 'code',
        text: !this.options.pedantic
          ? cap.replace(/\n+$/, '')
          : cap
      });
      continue;
    }

    // fences (gfm)
    if (cap = this.rules.fences.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'code',
        lang: cap[2],
        text: cap[3]
      });
      continue;
    }

    // heading
    if (cap = this.rules.heading.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'heading',
        depth: cap[1].length,
        text: cap[2]
      });
      continue;
    }

    // table no leading pipe (gfm)
    if (top && (cap = this.rules.nptable.exec(src))) {
      src = src.substring(cap[0].length);

      item = {
        type: 'table',
        header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
        align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
        cells: cap[3].replace(/\n$/, '').split('\n')
      };

      for (i = 0; i < item.align.length; i++) {
        if (/^ *-+: *$/.test(item.align[i])) {
          item.align[i] = 'right';
        } else if (/^ *:-+: *$/.test(item.align[i])) {
          item.align[i] = 'center';
        } else if (/^ *:-+ *$/.test(item.align[i])) {
          item.align[i] = 'left';
        } else {
          item.align[i] = null;
        }
      }

      for (i = 0; i < item.cells.length; i++) {
        item.cells[i] = item.cells[i].split(/ *\| */);
      }

      this.tokens.push(item);

      continue;
    }

    // lheading
    if (cap = this.rules.lheading.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'heading',
        depth: cap[2] === '=' ? 1 : 2,
        text: cap[1]
      });
      continue;
    }

    // hr
    if (cap = this.rules.hr.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'hr'
      });
      continue;
    }

    // blockquote
    if (cap = this.rules.blockquote.exec(src)) {
      src = src.substring(cap[0].length);

      this.tokens.push({
        type: 'blockquote_start'
      });

      cap = cap[0].replace(/^ *> ?/gm, '');

      // Pass `top` to keep the current
      // "toplevel" state. This is exactly
      // how markdown.pl works.
      this.token(cap, top);

      this.tokens.push({
        type: 'blockquote_end'
      });

      continue;
    }

    // list
    if (cap = this.rules.list.exec(src)) {
      src = src.substring(cap[0].length);

      this.tokens.push({
        type: 'list_start',
        ordered: isFinite(cap[2])
      });

      // Get each top-level item.
      cap = cap[0].match(this.rules.item);

      // Get bullet.
      if (this.options.smartLists) {
        bull = block.bullet.exec(cap[0])[0];
      }

      next = false;
      l = cap.length;
      i = 0;

      for (; i < l; i++) {
        item = cap[i];

        // Remove the list item's bullet
        // so it is seen as the next token.
        space = item.length;
        item = item.replace(/^ *([*+-]|\d+\.) +/, '');

        // Outdent whatever the
        // list item contains. Hacky.
        if (~item.indexOf('\n ')) {
          space -= item.length;
          item = !this.options.pedantic
            ? item.replace(new RegExp('^ {1,' + space + '}', 'gm'), '')
            : item.replace(/^ {1,4}/gm, '');
        }

        // Determine whether the next list item belongs here.
        // Backpedal if it does not belong in this list.
        if (this.options.smartLists && i !== l - 1) {
          b = block.bullet.exec(cap[i+1])[0];
          if (bull !== b && !(bull[1] === '.' && b[1] === '.')) {
            src = cap.slice(i + 1).join('\n') + src;
            i = l - 1;
          }
        }

        // Determine whether item is loose or not.
        // Use: /(^|\n)(?! )[^\n]+\n\n(?!\s*$)/
        // for discount behavior.
        loose = next || /\n\n(?!\s*$)/.test(item);
        if (i !== l - 1) {
          next = item[item.length-1] === '\n';
          if (!loose) loose = next;
        }

        this.tokens.push({
          type: loose
            ? 'loose_item_start'
            : 'list_item_start'
        });

        // Recurse.
        this.token(item, false);

        this.tokens.push({
          type: 'list_item_end'
        });
      }

      this.tokens.push({
        type: 'list_end'
      });

      continue;
    }

    // html
    if (cap = this.rules.html.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: this.options.sanitize
          ? 'paragraph'
          : 'html',
        pre: cap[1] === 'pre',
        text: cap[0]
      });
      continue;
    }

    // def
    if (top && (cap = this.rules.def.exec(src))) {
      src = src.substring(cap[0].length);
      this.tokens.links[cap[1].toLowerCase()] = {
        href: cap[2],
        title: cap[3]
      };
      continue;
    }

    // table (gfm)
    if (top && (cap = this.rules.table.exec(src))) {
      src = src.substring(cap[0].length);

      item = {
        type: 'table',
        header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
        align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
        cells: cap[3].replace(/(?: *\| *)?\n$/, '').split('\n')
      };

      for (i = 0; i < item.align.length; i++) {
        if (/^ *-+: *$/.test(item.align[i])) {
          item.align[i] = 'right';
        } else if (/^ *:-+: *$/.test(item.align[i])) {
          item.align[i] = 'center';
        } else if (/^ *:-+ *$/.test(item.align[i])) {
          item.align[i] = 'left';
        } else {
          item.align[i] = null;
        }
      }

      for (i = 0; i < item.cells.length; i++) {
        item.cells[i] = item.cells[i]
          .replace(/^ *\| *| *\| *$/g, '')
          .split(/ *\| */);
      }

      this.tokens.push(item);

      continue;
    }

    // top-level paragraph
    if (top && (cap = this.rules.paragraph.exec(src))) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'paragraph',
        text: cap[1][cap[1].length-1] === '\n'
          ? cap[1].slice(0, -1)
          : cap[1]
      });
      continue;
    }

    // text
    if (cap = this.rules.text.exec(src)) {
      // Top-level should never reach here.
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'text',
        text: cap[0]
      });
      continue;
    }

    if (src) {
      throw new
        Error('Infinite loop on byte: ' + src.charCodeAt(0));
    }
  }

  return this.tokens;
};

/**
 * Inline-Level Grammar
 */

var inline = {
  escape: /^\\([\\`*{}\[\]()#+\-.!_>])/,
  autolink: /^<([^ >]+(@|:\/)[^ >]+)>/,
  url: noop,
  tag: /^<!--[\s\S]*?-->|^<\/?\w+(?:"[^"]*"|'[^']*'|[^'">])*?>/,
  link: /^!?\[(inside)\]\(href\)/,
  reflink: /^!?\[(inside)\]\s*\[([^\]]*)\]/,
  nolink: /^!?\[((?:\[[^\]]*\]|[^\[\]])*)\]/,
  strong: /^__([\s\S]+?)__(?!_)|^\*\*([\s\S]+?)\*\*(?!\*)/,
  em: /^\b_((?:__|[\s\S])+?)_\b|^\*((?:\*\*|[\s\S])+?)\*(?!\*)/,
  code: /^(`+)\s*([\s\S]*?[^`])\s*\1(?!`)/,
  br: /^ {2,}\n(?!\s*$)/,
  del: noop,
  text: /^[\s\S]+?(?=[\\<!\[_*`]| {2,}\n|$)/
};

inline._inside = /(?:\[[^\]]*\]|[^\]]|\](?=[^\[]*\]))*/;
inline._href = /\s*<?([^\s]*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*/;

inline.link = replace(inline.link)
  ('inside', inline._inside)
  ('href', inline._href)
  ();

inline.reflink = replace(inline.reflink)
  ('inside', inline._inside)
  ();

/**
 * Normal Inline Grammar
 */

inline.normal = merge({}, inline);

/**
 * Pedantic Inline Grammar
 */

inline.pedantic = merge({}, inline.normal, {
  strong: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
  em: /^_(?=\S)([\s\S]*?\S)_(?!_)|^\*(?=\S)([\s\S]*?\S)\*(?!\*)/
});

/**
 * GFM Inline Grammar
 */

inline.gfm = merge({}, inline.normal, {
  escape: replace(inline.escape)('])', '~|])')(),
  url: /^(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/,
  del: /^~~(?=\S)([\s\S]*?\S)~~/,
  text: replace(inline.text)
    (']|', '~]|')
    ('|', '|https?://|')
    ()
});

/**
 * GFM + Line Breaks Inline Grammar
 */

inline.breaks = merge({}, inline.gfm, {
  br: replace(inline.br)('{2,}', '*')(),
  text: replace(inline.gfm.text)('{2,}', '*')()
});

/**
 * Inline Lexer & Compiler
 */

function InlineLexer(links, options) {
  this.options = options || marked.defaults;
  this.links = links;
  this.rules = inline.normal;

  if (!this.links) {
    throw new
      Error('Tokens array requires a `links` property.');
  }

  if (this.options.gfm) {
    if (this.options.breaks) {
      this.rules = inline.breaks;
    } else {
      this.rules = inline.gfm;
    }
  } else if (this.options.pedantic) {
    this.rules = inline.pedantic;
  }
}

/**
 * Expose Inline Rules
 */

InlineLexer.rules = inline;

/**
 * Static Lexing/Compiling Method
 */

InlineLexer.output = function(src, links, options) {
  var inline = new InlineLexer(links, options);
  return inline.output(src);
};

/**
 * Lexing/Compiling
 */

InlineLexer.prototype.output = function(src) {
  var out = ''
    , link
    , text
    , href
    , cap;

  while (src) {
    // escape
    if (cap = this.rules.escape.exec(src)) {
      src = src.substring(cap[0].length);
      out += cap[1];
      continue;
    }

    // autolink
    if (cap = this.rules.autolink.exec(src)) {
      src = src.substring(cap[0].length);
      if (cap[2] === '@') {
        text = cap[1][6] === ':'
          ? this.mangle(cap[1].substring(7))
          : this.mangle(cap[1]);
        href = this.mangle('mailto:') + text;
      } else {
        text = escape(cap[1]);
        href = text;
      }
      out += '<a href="'
        + href
        + '">'
        + text
        + '</a>';
      continue;
    }

    // url (gfm)
    if (cap = this.rules.url.exec(src)) {
      src = src.substring(cap[0].length);
      text = escape(cap[1]);
      href = text;
      out += '<a href="'
        + href
        + '">'
        + text
        + '</a>';
      continue;
    }

    // tag
    if (cap = this.rules.tag.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.options.sanitize
        ? escape(cap[0])
        : cap[0];
      continue;
    }

    // link
    if (cap = this.rules.link.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.outputLink(cap, {
        href: cap[2],
        title: cap[3]
      });
      continue;
    }

    // reflink, nolink
    if ((cap = this.rules.reflink.exec(src))
        || (cap = this.rules.nolink.exec(src))) {
      src = src.substring(cap[0].length);
      link = (cap[2] || cap[1]).replace(/\s+/g, ' ');
      link = this.links[link.toLowerCase()];
      if (!link || !link.href) {
        out += cap[0][0];
        src = cap[0].substring(1) + src;
        continue;
      }
      out += this.outputLink(cap, link);
      continue;
    }

    // strong
    if (cap = this.rules.strong.exec(src)) {
      src = src.substring(cap[0].length);
      out += '<strong>'
        + this.output(cap[2] || cap[1])
        + '</strong>';
      continue;
    }

    // em
    if (cap = this.rules.em.exec(src)) {
      src = src.substring(cap[0].length);
      out += '<em>'
        + this.output(cap[2] || cap[1])
        + '</em>';
      continue;
    }

    // code
    if (cap = this.rules.code.exec(src)) {
      src = src.substring(cap[0].length);
      out += '<code>'
        + escape(cap[2], true)
        + '</code>';
      continue;
    }

    // br
    if (cap = this.rules.br.exec(src)) {
      src = src.substring(cap[0].length);
      out += '<br>';
      continue;
    }

    // del (gfm)
    if (cap = this.rules.del.exec(src)) {
      src = src.substring(cap[0].length);
      out += '<del>'
        + this.output(cap[1])
        + '</del>';
      continue;
    }

    // text
    if (cap = this.rules.text.exec(src)) {
      src = src.substring(cap[0].length);
      out += escape(cap[0]);
      continue;
    }

    if (src) {
      throw new
        Error('Infinite loop on byte: ' + src.charCodeAt(0));
    }
  }

  return out;
};

/**
 * Compile Link
 */

InlineLexer.prototype.outputLink = function(cap, link) {
  if (cap[0][0] !== '!') {
    return '<a href="'
      + escape(link.href)
      + '"'
      + (link.title
      ? ' title="'
      + escape(link.title)
      + '"'
      : '')
      + '>'
      + this.output(cap[1])
      + '</a>';
  } else {
    return '<img src="'
      + escape(link.href)
      + '" alt="'
      + escape(cap[1])
      + '"'
      + (link.title
      ? ' title="'
      + escape(link.title)
      + '"'
      : '')
      + '>';
  }
};

/**
 * Mangle Links
 */

InlineLexer.prototype.mangle = function(text) {
  var out = ''
    , l = text.length
    , i = 0
    , ch;

  for (; i < l; i++) {
    ch = text.charCodeAt(i);
    if (Math.random() > 0.5) {
      ch = 'x' + ch.toString(16);
    }
    out += '&#' + ch + ';';
  }

  return out;
};

/**
 * Parsing & Compiling
 */

function Parser(options) {
  this.tokens = [];
  this.token = null;
  this.options = options || marked.defaults;
}

/**
 * Static Parse Method
 */

Parser.parse = function(src, options) {
  var parser = new Parser(options);
  return parser.parse(src);
};

/**
 * Parse Loop
 */

Parser.prototype.parse = function(src) {
  this.inline = new InlineLexer(src.links, this.options);
  this.tokens = src.reverse();

  var out = '';
  while (this.next()) {
    out += this.tok();
  }

  return out;
};

/**
 * Next Token
 */

Parser.prototype.next = function() {
  return this.token = this.tokens.pop();
};

/**
 * Preview Next Token
 */

Parser.prototype.peek = function() {
  return this.tokens[this.tokens.length-1] || 0;
};

/**
 * Parse Text Tokens
 */

Parser.prototype.parseText = function() {
  var body = this.token.text;

  while (this.peek().type === 'text') {
    body += '\n' + this.next().text;
  }

  return this.inline.output(body);
};

/**
 * Parse Current Token
 */

Parser.prototype.tok = function() {
  switch (this.token.type) {
    case 'space': {
      return '';
    }
    case 'hr': {
      return '<hr>\n';
    }
    case 'heading': {
      return '<h'
        + this.token.depth
        + '>'
        + this.inline.output(this.token.text)
        + '</h'
        + this.token.depth
        + '>\n';
    }
    case 'code': {
      if (this.options.highlight) {
        var code = this.options.highlight(this.token.text, this.token.lang);
        if (code != null && code !== this.token.text) {
          this.token.escaped = true;
          this.token.text = code;
        }
      }

      if (!this.token.escaped) {
        this.token.text = escape(this.token.text, true);
      }

      return '<pre><code'
        + (this.token.lang
        ? ' class="'
        + this.options.langPrefix
        + this.token.lang
        + '"'
        : '')
        + '>'
        + this.token.text
        + '</code></pre>\n';
    }
    case 'table': {
      var body = ''
        , heading
        , i
        , row
        , cell
        , j;

      // header
      body += '<thead>\n<tr>\n';
      for (i = 0; i < this.token.header.length; i++) {
        heading = this.inline.output(this.token.header[i]);
        body += this.token.align[i]
          ? '<th align="' + this.token.align[i] + '">' + heading + '</th>\n'
          : '<th>' + heading + '</th>\n';
      }
      body += '</tr>\n</thead>\n';

      // body
      body += '<tbody>\n'
      for (i = 0; i < this.token.cells.length; i++) {
        row = this.token.cells[i];
        body += '<tr>\n';
        for (j = 0; j < row.length; j++) {
          cell = this.inline.output(row[j]);
          body += this.token.align[j]
            ? '<td align="' + this.token.align[j] + '">' + cell + '</td>\n'
            : '<td>' + cell + '</td>\n';
        }
        body += '</tr>\n';
      }
      body += '</tbody>\n';

      return '<table>\n'
        + body
        + '</table>\n';
    }
    case 'blockquote_start': {
      var body = '';

      while (this.next().type !== 'blockquote_end') {
        body += this.tok();
      }

      return '<blockquote>\n'
        + body
        + '</blockquote>\n';
    }
    case 'list_start': {
      var type = this.token.ordered ? 'ol' : 'ul'
        , body = '';

      while (this.next().type !== 'list_end') {
        body += this.tok();
      }

      return '<'
        + type
        + '>\n'
        + body
        + '</'
        + type
        + '>\n';
    }
    case 'list_item_start': {
      var body = '';

      while (this.next().type !== 'list_item_end') {
        body += this.token.type === 'text'
          ? this.parseText()
          : this.tok();
      }

      return '<li>'
        + body
        + '</li>\n';
    }
    case 'loose_item_start': {
      var body = '';

      while (this.next().type !== 'list_item_end') {
        body += this.tok();
      }

      return '<li>'
        + body
        + '</li>\n';
    }
    case 'html': {
      return !this.token.pre && !this.options.pedantic
        ? this.inline.output(this.token.text)
        : this.token.text;
    }
    case 'paragraph': {
      return '<p>'
        + this.inline.output(this.token.text)
        + '</p>\n';
    }
    case 'text': {
      return '<p>'
        + this.parseText()
        + '</p>\n';
    }
  }
};

/**
 * Helpers
 */

function escape(html, encode) {
  return html
    .replace(!encode ? /&(?!#?\w+;)/g : /&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function replace(regex, opt) {
  regex = regex.source;
  opt = opt || '';
  return function self(name, val) {
    if (!name) return new RegExp(regex, opt);
    val = val.source || val;
    val = val.replace(/(^|[^\[])\^/g, '$1');
    regex = regex.replace(name, val);
    return self;
  };
}

function noop() {}
noop.exec = noop;

function merge(obj) {
  var i = 1
    , target
    , key;

  for (; i < arguments.length; i++) {
    target = arguments[i];
    for (key in target) {
      if (Object.prototype.hasOwnProperty.call(target, key)) {
        obj[key] = target[key];
      }
    }
  }

  return obj;
}

/**
 * Marked
 */

function marked(src, opt) {
  try {
    if (opt) opt = merge({}, marked.defaults, opt);
    return Parser.parse(Lexer.lex(src, opt), opt);
  } catch (e) {
    e.message += '\nPlease report this to https://github.com/chjj/marked.';
    if ((opt || marked.defaults).silent) {
      return '<p>An error occured:</p><pre>'
        + escape(e.message + '', true)
        + '</pre>';
    }
    throw e;
  }
}

/**
 * Options
 */

marked.options =
marked.setOptions = function(opt) {
  merge(marked.defaults, opt);
  return marked;
};

marked.defaults = {
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: false,
  silent: false,
  highlight: null,
  langPrefix: 'lang-'
};

/**
 * Expose
 */

marked.Parser = Parser;
marked.parser = Parser.parse;

marked.Lexer = Lexer;
marked.lexer = Lexer.lex;

marked.InlineLexer = InlineLexer;
marked.inlineLexer = InlineLexer.output;

marked.parse = marked;

if (typeof exports === 'object') {
  module.exports = marked;
} else if (typeof define === 'function' && define.amd) {
  define(function() { return marked; });
} else {
  this.marked = marked;
}

}).call(function() {
  return this || (typeof window !== 'undefined' ? window : global);
}());

})(window)
},{}]},{},[1])
;
