import Promise from 'bluebird';
import { set } from 'object-path';
import superagent from 'superagent';
import config from 'config';
import Debug from 'debug';

let log = new Debug('flex:router:site-injector');

const FLEXSITES_API = config.get('flexsites.api.production');
const FLEXSITES_API_STAGE = config.get('flexsites.api.stage');

var siteMap = { host: {}, _id: {} };
var isObjectId = /[a-f0-9]{24}/i;
export default function(req, res, next) {

  var value = req.get('X-FlexSite') || req.flex.host
    , type = 'host';

  if (isObjectId.test(value)) {
    type = '_id';
  }

  getSite(type, value, !req.flex.isTest)
    .then((site) => {
      if (!site) throw new Error('Invalid site identifier!');
      set(req, 'flex.site', site);
    })
    .then(next)
    .catch(next);
}

function getSite(type, value, isProd) {
  let cachedSite = siteMap[type][value];
  if (cachedSite) return Promise.resolve(cachedSite);

  log(`Cache miss for ${type} ${value}`);
  let query = {};
  query[type] = value;

  let host = isProd ? FLEXSITES_API : FLEXSITES_API_STAGE;

  return request(`${host}/api/v1/sites?filter[where][${type}]=${value}`)
    .then((site = {}) => {
      if (site === null) site = {};
      if (Array.isArray(site)) site = site[0];
      if (site._id) siteMap.host[site.host] = siteMap._id[site._id] = site;
      return site;
    });
}

function request(url) {
  return Promise.fromNode(cb => superagent
    .get(url)
    .end(cb))
  .then(({ body }) => body);
}
