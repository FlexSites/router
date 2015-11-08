import httpProxy from 'http-proxy';
import config from 'config';
import Debug from 'debug';

let log = new Debug('flex:router:api');

const IS_PRODUCTION = config.get('isProduction');
const FLEXSITES_API = config.get('flexsites.api.production');
const FLEXSITES_API_STAGE = config.get('flexsites.api.stage');

let prod = httpProxy.createProxyServer({
  changeOrigin: true,
  target: FLEXSITES_API,
});

let stage = httpProxy.createProxyServer({
  changeOrigin: true,
  target: FLEXSITES_API_STAGE,
});

export default (req, res, next) => {

  // Check that it's an API request.
  if (req.flex.host !== 'api.flexsites.io') return next();

  // If a production API request isn't secure, redirect early.
  if (!req.secure && IS_PRODUCTION) {
    log(`Redirecting insecure request: ${req.hostname}${req.originalUrl}`);
    return res.redirect(`${req.protocol}s://${req.hostname}${req.originalUrl}`, 301);
  }
  let proxy = req.flex.isTest ? stage : prod;

  log(`Proxying API request "${req.originalUrl}" to ${req.flex.isTest ? 'staging' : 'production'}`);

  proxy.web(req, res, {});
  proxy.on('error', next);
};
