import { set } from 'object-path';
import Promise from 'bluebird';
import superagent from 'superagent';
import config from 'config';
import Debug from 'debug';

let log = new Debug('flex:router:site-injector');

const FLEXSITES_API = config.get('flexsites.api.production');
const FLEXSITES_API_STAGE = config.get('flexsites.api.stage');

var siteMap = {};
export default function(req, res, next) {
  getSite(req.flex.host, !req.flex.isTest)
    .then(site => {
      if (!site) throw new Error('Invalid site identifier!');
      set(req, 'flex.site', site);
    })
    .then(next)
    .catch(next);
}

function getSite(value, isProd) {
  let cachedSite = siteMap[value];
  if (cachedSite) return Promise.resolve(cachedSite);

  log(`Cache miss for ${value}`);

  let host = isProd ? FLEXSITES_API : FLEXSITES_API_STAGE;

  return Promise.fromNode(cb =>
    superagent
      .get(`${host}/api/v1/sites?filter[where][host]=${value}`)
      .end(cb)
    )
    .then(({ body }) => {
      if (Array.isArray(body)) body = body[0] || {};
      if (body._id) siteMap[body._id] = body;
      return body;
    });
}
