import express from 'express';
import cors from 'cors';
import bp from 'body-parser';
import { buildError } from './utils.js';
import indexRouter from './routes/index.js';
import usersRouter from './routes/users.js';

const app = express();

app.use(cors());
app.use(express.static('public'));
app.use(bp.urlencoded({ extended: true }));
app.use(bp.json());

app.use('/', indexRouter);
app.use('/api/users', usersRouter);

app.use((req, res) => {
  res.status(404).send(buildError('Invalid request'));
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
