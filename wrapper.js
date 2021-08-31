// Jade 'HTML' wrapper for SocketStream 0.3

var fs = require('fs'),
    jade = require('jade');

exports.init = function(root, config) {

  if (!(config && typeof(config) === 'object')) config = {};

  return {

    name: 'Jade',

    extensions: ['jade'],

    assetType: 'html',

    contentType: 'text/html',

    compile: function(path, options, cb) {
      //console.log("compile:", config, path, options);

      //var locals = {};
      // update to allow serveClient to be passed variables to render in view jade template
      // https://github.com/lge88/ss-jade/commit/6cfde9f88530417a0a2947126169f937a1f48b59
      var locals = (options && options.locals) ? options.locals : {};

      // Merge any locals passed to config.locals
      if (config.locals && typeof(config.locals) === 'object')
        for (var attrname in config.locals) { locals[attrname] = config.locals[attrname]; }

      // If passing optional headers for main view HTML
      if (options && options.headers) locals['SocketStream'] = options.headers;

      var input = fs.readFileSync(path, 'utf8');

      // if options.compileOnly is passed then return the compiled jade to callback for caching
      if (options && options.compileOnly)
        return cb(path, jade.compile(input, {filename: path}), options);

      var parser = jade.compile(input, {filename: path});
      var output = parser(locals);

      return cb(output);
    }
  };
};