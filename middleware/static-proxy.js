import config from 'config';
import path from 'path';
import httpProxy from 'http-proxy';
import { get } from 'object-path';
import Debug from 'debug';
import accepts from 'accepts';
import vary from 'vary';

// import contentType from 'content-type';
// import mime from 'mime';

let log = new Debug('flex:router:static');


let s3buckets = config.get('flexsites.s3');

let proxies = {};

function getProxy(target) {
  let proxy = proxies[target];
  if (!proxy) {
    log(`Creating proxy for host: ${target}`);
    proxy = proxies[target] = httpProxy.createProxyServer({
      changeOrigin: true,
      target,
    });
  }
  return proxy;
}

const TEXT_FILE_EXTENSIONS = [
  'js',
  'css',
  'html',
  'json',
  'xml',
  'svg',
  'csv',
];

export default (req, res, next) => {
  req.url = `/${req.flex.site.id}${req.url}`;

  // Cache-Control
  let maxAge = 0;
  if (isRevisioned(req.url)) maxAge = 31556926;
  res.set('Cache-Control', `public, max-age=${maxAge}`);
  vary(res, 'Accept-Encoding');

  // Default object
  let ext = path.extname(req.url);
  if (!ext) {
    res.set('Cache-Control', 'public, max-age=0, must-revalidate');
    ext = '.html';
    req.url += '/index.html';
  }
  ext = ext.substr(1)

  // Content-Type
  // Not sure this is doing anything behind Cloudfront
  // res.set('Content-Type', contentType.format({ type: mime.lookup(ext), parameters: { charset: 'utf-8' }}));


  // Compression
  let accept = accepts(req);
  let method = accept.encoding(['gzip']);

  // TODO: Allow sites to set non-compressed if they feel like hosting elsewhere and sucking at life
  if (!!~TEXT_FILE_EXTENSIONS.indexOf(ext) && method) {
    res.setHeader('Content-Encoding', method);
    req.url += '.gz';
  }

  // Proxy Target
  let envKey = req.flex.isTest ? 'stage' : 'production';
  let proxy = getProxy(get(req, ['flex', 'site', 'assets', envKey], s3buckets[envKey]));
  proxy.web(req, res, {});
  proxy.on('error', next);
};

const REGEX_IS_REV = /-[a-f0-9]{10}\.[a-z0-9]{2,}$/;
function isRevisioned(uri) {
  return REGEX_IS_REV.test(uri);
}
