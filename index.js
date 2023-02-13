import express from 'express';
import cors from 'cors';
import bp from 'body-parser';
import { __dirname, DATE_REGEXP } from './consts.js';
import { buildError, formatDate } from './utils.js';
import { insertUser, getUsers, insertExercise, getLog } from './db-queries.js';

const app = express();

app.use(cors());
app.use(express.static('public'));
app.use(bp.urlencoded({ extended: true }));
app.use(bp.json());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

app.post('/api/users', async (req, res) => {
  const username = req.body?.username;

  if (!username) {
    res.status(400).send(buildError('Provide a username'));
    return;
  }

  try {
    const id = await insertUser(username);
    res.send({
      id,
      username
    });
  } catch (e) {
    res.status(404).send(buildError(e.message));
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const result = await getUsers();
    res.send(result);
  } catch (e) {
    res.status(404).send(buildError(e.message));
  }
});

app.post('/api/users/:_id/exercises', async (req, res) => {
  const userId = Number(req.params._id);
  const duration = Number(req.body?.duration);
  const description = req.body?.description;
  const date = req.body?.date ? req.body.date : formatDate(Date.now());

  const errors = [];

  if (!userId) {
    errors.push('User id should be a number');
  }

  if (!DATE_REGEXP.test(date)) {
    errors.push('Provide a valid date YYYY-MM-DD');
  }

  if (!description) {
    errors.push('Description cannot be empty');
  }

  if (!duration) {
    errors.push('Duration should be a number');
  } else if (duration < 0) {
    errors.push('Duration should be more than 0');
  }

  if (errors.length > 0) {
    res.status(400).send(buildError(errors.join(', ')));
    return;
  }

  try {
    const id = await insertExercise(userId, description, duration, date);
    res.send({
      exerciseId: id,
      userId,
      description,
      duration,
      date
    });
  } catch (e) {
    res.status(404).send(buildError(e.message));
  }
});

app.get('/api/users/:_id/logs', async (req, res) => {
  const userId = Number(req.params._id);
  const { from, to } = req.query;
  const limit = Number(req.query?.limit);

  const errors = [];

  if (from && !DATE_REGEXP.test(from)) {
    errors.push('Enter a valid from date YYYY-MM-DD');
  }

  if (to && !DATE_REGEXP.test(to)) {
    errors.push('Enter a valid to date YYYY-MM-DD');
  }

  if (req.query?.limit && !limit) {
    errors.push('Enter a valid limit value');
  }

  if (errors.length > 0) {
    res.status(400).send(buildError(errors.join(', ')));
    return;
  }

  try {
    const result = await getLog(userId, from, to, limit);
    res.send(result);
  } catch (e) {
    res.status(404).send(buildError(e.message));
  }
});

app.use((req, res) => {
  res.status(404).send(buildError('Invalid request'));
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
