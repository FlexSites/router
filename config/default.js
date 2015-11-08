import { deferConfig as defer } from 'config/defer';
import url from 'url';

module.exports = {
  env: 'development',
  port: '3000',
  isProduction: defer(cfg => {
    return cfg.env === 'production';
  }),
  isDevelopment: defer(cfg => {
    return cfg.env === 'development';
  }),
  isStage: defer(cfg => {
    return cfg.env === 'staging';
  }),
  isTest: defer(cfg => {
    return cfg.env === 'test';
  }),
  devEmail: 'sethtippetts@gmail.com',
  aws: {
    region: 'us-west-2',
    s3: {
      region: defer(cfg => {
        return cfg.aws.region;
      }),
    },
  },
};
