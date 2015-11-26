import config from 'config';
import errorHandler from 'errorhandler';

let middleware = errorHandler;
if (config.get('isProduction')) {
  middleware = (err, req, res, next) => {
    res.status(err.status || 500);
    res.send({
      message: err.message || 'Server error.',
      status: err.status || 500,
    })
  }
}

export default middleware;
