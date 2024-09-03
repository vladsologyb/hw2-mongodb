import { HttpError } from 'http-errors';

const errorHandler = (err, req, res, next) => {
  if (err instanceof HttpError) {
    return res.status(err.status).send({
      status: err.status,
      message: err.name,
      data: err,
    });
  }
  res.status(500).send({
    status: 500,
    message: 'Something went wrong',
    data: err.message,
  });
};

export default errorHandler;
