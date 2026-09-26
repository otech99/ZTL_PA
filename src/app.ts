import express from 'express';
import routes from './routes';
import { errorMiddleware } from './middlewares/errorMiddleware';

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use(routes);

// deve restare l'ultimo, dopo tutte le rotte
app.use(errorMiddleware);

export default app;
