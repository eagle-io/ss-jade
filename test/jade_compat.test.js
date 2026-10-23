const assert = require('node:assert/strict');
const test = require('node:test');
const pug = require('pug');
const prepareJadeSource = require('../jade_compat').prepareJadeSource;

function render(source, locals) {
  return pug.compile(prepareJadeSource(source))(locals);
}

const cases = [
  ['numbers', { first: 1, second: 2 }, '12'],
  ['a number followed by text', { first: 1, second: 'item' }, '1item'],
  ['text followed by a number', { first: 'item', second: 2 }, 'item2'],
  ['booleans', { first: true, second: false }, 'truefalse'],
  ['null and undefined', { first: null, second: undefined }, 'nullundefined'],
  ['null followed by a number', { first: null, second: 2 }, 'null2'],
  ['escaped strings', { first: '<b>', second: '"&' }, '&lt;b&gt;&quot;&amp;']
];

for (const [name, locals, expected] of cases) {
  test('concatenates adjacent ' + name + ' as Jade strings', function () {
    assert.equal(render('a(title="#{first}#{second}") Link', locals), '<a title="' + expected + '">Link</a>');
  });
}

test('keeps the shipped setup-profile URL concatenation', function () {
  const locals = {
    links: { setupProfile: 'https://example.test/auth/setupprofile/' },
    user: { account: { profileActivateToken: 'example' } }
  };
  assert.equal(
    render('a(href="#{links.setupProfile}#{user.account.profileActivateToken}") Link', locals),
    '<a href="https://example.test/auth/setupprofile/example">Link</a>'
  );
});

test('string-coerces single-expression attributes', function () {
  assert.equal(prepareJadeSource('input(value="#{value}")'), 'input(value="" + (value))');
  assert.equal(render('input(value="#{value}")', { value: 0 }), '<input value="0"/>');
});

for (const [value, expected] of [
  [0, '0'], [true, 'true'], [false, 'false'], [null, 'null'], [undefined, 'undefined'],
  ['<b>"&', '&lt;b&gt;&quot;&amp;']
]) {
  test('preserves Jade single-attribute output for ' + String(value), function () {
    assert.equal(render('input(value="#{value}")', { value }), '<input value="' + expected + '"/>');
  });
}
