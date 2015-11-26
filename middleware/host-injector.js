import { set } from 'object-path';

const HOST_REGEXP = /^(?:https?:\/\/)?(?:www|local|test)?\.?(.*)$/;
const TEST_REGEXP = /^(local|test|stag(e|ing))/;

export default (req, res, next) => {
  let { hostname } = req;
  let host = HOST_REGEXP.exec(hostname)[1];
  if (host === 'host') host = process.env.OVERRIDE_HOST || 'flexsites.io';
  set(req, 'flex.host', host);
  set(req, 'flex.isTest', TEST_REGEXP.test(hostname));
  next();
};
