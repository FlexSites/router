import express from 'express';
import config from 'config';
import apiProxy from './middleware/api-proxy';
import siteInjector from './middleware/site-injector';
import staticProxy from './middleware/static-proxy';
import hostInjector from './middleware/host-injector';
import prerender from 'prerender-node';

let app = express();

const PORT = config.get('port');


// For Heroku
app.enable('trust proxy');

app.use(prerender);
app.use(hostInjector);
app.use(apiProxy);
app.use(siteInjector);
app.use(staticProxy);

app.listen(PORT, () => {
  console.log(`FlexRouter listening on port: ${PORT}`);
});
