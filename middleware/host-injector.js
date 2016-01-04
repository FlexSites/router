import { set } from 'object-path';
import Debug from 'debug';

let log = new Debug('flex:router:host-injector');

const TEST_REGEXP = /^(local|test|stag(e|ing))/;

export default (req, res, next) => {
  let { hostname } = req;
  let host = parseHost(hostname);
  if (host === 'host') host = process.env.OVERRIDE_HOST || 'flexsites.io';

  log(`Environment-less host determined "${host}"`);

  set(req, 'flex.host', host);
  set(req, 'flex.isTest', TEST_REGEXP.test(hostname));
  next();
};

function parseHost(str = '') {
  let parts = str.split('.');
  parts[0] = parts[0].replace(/^(local|test|stag(e|ing))/i, '');
  return parts.filter(part => !!part).join('.');
}
