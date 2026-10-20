// Jade interpolated #{expr} and !{expr} inside quoted attributes.
// Pug 3 leaves those quotes as literal text.

function jadeQuotedValue (body) {
  var re = /#\{([^}]+)\}|!\{([^}]+)\}/g
  var chunks = []
  var last = 0
  var match
  while ((match = re.exec(body))) {
    if (match.index > last) chunks.push(JSON.stringify(body.slice(last, match.index)))
    chunks.push('(' + (match[1] != null ? match[1] : match[2]) + ')')
    last = re.lastIndex
  }
  if (last < body.length) chunks.push(JSON.stringify(body.slice(last)))
  if (!chunks.length) return '""'
  if (chunks.length === 1 && chunks[0].charAt(0) === '(') return chunks[0].slice(1, -1)
  return chunks.join(' + ')
}

function rewriteInsideAttributes (line, depth) {
  var out = ''
  var i = 0
  while (i < line.length) {
    var ch = line.charAt(i)
    if (ch === '(') { depth++; out += ch; i++; continue }
    if (ch === ')') { depth = Math.max(0, depth - 1); out += ch; i++; continue }
    if (depth > 0 && ch === '=') {
      var match = /^=\s*(['"])((?:\\.|(?!\1).)*)\1/.exec(line.slice(i))
      if (match && (match[2].indexOf('#{') !== -1 || match[2].indexOf('!{') !== -1)) {
        out += '=' + jadeQuotedValue(match[2])
        i += match[0].length
        continue
      }
    }
    out += ch
    i++
  }
  return { line: out, depth: depth }
}

function restoreJadeDoctype (line) {
  var match = /^(\s*)doctype\s+5\s*$/.exec(line)
  if (!match) return line
  return match[1] + 'doctype html'
}

function prepareJadeSource (input) {
  var depth = 0
  return String(input).split('\n').map(function (line) {
    line = restoreJadeDoctype(line)
    var mustache = /^(\s*)(\{\{.*)$/.exec(line)
    if (mustache) line = mustache[1] + '| ' + mustache[2]
    var rewritten = rewriteInsideAttributes(line, depth)
    depth = rewritten.depth
    return rewritten.line
  }).join('\n')
}

module.exports = { prepareJadeSource }
