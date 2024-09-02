import dotenv from 'dotenv';
import express from 'express';
import pino from 'pino-http';
import cors from 'cors';
import router from './routers/contacts.js';
import errorHandler from './middlewares/errorHandler.js';
import notFoundHandler from './middlewares/notFoundHandler.js';

dotenv.config();

const PORT = Number(process.env.PORT);

export const setupServer = () => {
  const app = express();

  app.use(express.json());
  app.use(cors());

  app.use(
    pino({
      transport: {
        target: 'pino-pretty',
      },
    }),
  );

  app.use(router);

  app.get('/', (req, res) => {
    res.json({
      message: 'Not found',
    });
  });

  app.use('*', notFoundHandler);

  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};
