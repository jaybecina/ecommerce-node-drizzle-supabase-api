import dotenv from 'dotenv';
dotenv.config();

import express, { urlencoded } from 'express';
import cors from 'cors';
import routes from './routes';
import serverless from 'serverless-http';

const port = process.env.PORT || 8000;
const app = express();

app.use(urlencoded({ extended: false }));
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Routes
app.use('/api', routes);

app.listen(port, () => {
  console.log(`Server API listening on port ${port}`);
});

export const handler = serverless(app);
