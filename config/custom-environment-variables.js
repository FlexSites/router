module.exports = {
  env: 'NODE_ENV',
  port: 'PORT',
  redis: {
    url: 'REDIS_URL',
  },
  devEmail: 'DEV_EMAIL',
  flexsites: {
    api: {
      production: 'FLEXSITES_API',
      stage: 'FLEXSITES_API_STAGE',
    },
    s3: {
      production: 'FLEXSITES_S3',
      stage: 'FLEXSITES_S3_STAGE',
    },
  },
  aws: {
    region: 'AWS_REGION',
    s3: {
      bucket: 'S3_BUCKET',
    },
  },
}
