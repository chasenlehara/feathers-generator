const path = require('path');
const debug = require('debug')('feathers-generator:service');

// Metalsmith + middleware
const Metalsmith = require('metalsmith');
const mount = require('./middleware/mount');
const copy = require('metalsmith-copy');
const rename = require('./middleware/rename');

const json = require('../utils/json');
//const ask = require('../utils/ask');

const TEMPLATE_PATH = path.resolve(__dirname, 'templates');

module.exports = function(prompt, done, options) {

  const metalsmith = Metalsmith(TEMPLATE_PATH);
  const SERVICE_PATH = path.resolve(options.path, options.name);

  metalsmith
    .metadata({ options })
    // Read in any existing config files and attach to metadata
    // TODO slajax or EK refactor option args into util fn so not duplicated
    .use(json({
      //meta: path.resolve(__dirname, 'meta.json'),
      default: path.join(options.root, 'config', 'default.json'),
      staging: path.join(options.root, 'config', 'staging.json'),
      production: path.join(options.root, 'config', 'production.json'),
      pkg: path.join(options.root, 'package.json'),
      feathers: path.join(options.path, 'feathers.json')
    }))
    //.use(ask({ callback: prompt })) //disabled until more intelligent
    .clean(false)
    // TODO @slajax - requires forked metalsmith-copy, until upstream npm publish
    .use(copy({ pattern: 'hooks/*', directory: 'hooks', force: true }))
    .use(rename(options))
    .use(mount(options))
    .source(TEMPLATE_PATH)
    .destination(SERVICE_PATH)
    .build(function(error){
      if(error) {
        return done(error);
      }

      let message = `Successfully generated "${options.name}" ${options.template} at ${SERVICE_PATH}`;
      debug(message);
      done(null, message);
    });

};