import { StatusCodes } from 'http-status-codes';
import express from 'express';
import routes from './routes';
import { errorMiddleware } from './middlewares/errorMiddleware';

// configurazione dell'applicazione Express: lettura del JSON, rotte e gestione degli errori
const app = express();

app.use(express.json());

// verifica rapida che il server sia in esecuzione
app.get('/health', (req, res) => {
  res.status(StatusCodes.OK).json({ status: 'ok' });
});

app.use(routes);

// deve restare l'ultimo, dopo tutte le rotte, per ricevere gli errori di ognuna
app.use(errorMiddleware);

export default app;
