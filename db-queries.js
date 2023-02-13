import db from './init-db.js';

export async function getUsers() {
  const result = [];
  await db.each(
    `
    SELECT
      *
    FROM
      User
    `,
    (error, row) => {
      if (error) {
        throw Error('Could not display users');
      }
      result.push(row);
    }
  );

  if (result.length === 0) {
    throw Error('No users found');
  }

  return result;
}

export async function insertExercise(userId, description, duration, date) {
  const user = await db.get(
    `
    SELECT
      username
    FROM
      User
    WHERE
      id = ?
    `,
    userId
  );

  if (!user) {
    throw Error('User does not exist');
  }

  const result = await db.run(
    `
    INSERT INTO
      Exercise
      (userId, duration, description, date)
    VALUES (?, ?, ?, ?)
    `,
    userId,
    duration,
    description,
    date
  );

  if (result && result.changes > 0) {
    return result.lastID;
  }
}

export async function insertUser(username) {
  let result = await db.get(
    `
    SELECT
      id
    FROM
      User
    WHERE
      username = ?
    `,
    username
  );

  if (result) {
    throw Error('User already exists');
  }

  result = await db.run(
    `
    INSERT INTO
      User
      (username)
    VALUES (?)
    `,
    username
  );

  if (result && result.changes > 0) {
    return result.lastID;
  }
}

export async function getLog(userId, from, to, limit) {
  const logs = [];
  let dateFilter = '';
  let limitFilter = '';

  const user = await db.get(
    `
    SELECT
      username
    FROM
     User
    WHERE id = ?
    `,
    userId
  );

  if (!user) {
    throw Error('User does not exist');
  }

  if (from) {
    dateFilter += `AND date >= "${from}"`;
  }

  if (to) {
    dateFilter += `AND date <= "${to}"`;
  }

  if (limit) {
    limitFilter = `LIMIT ${limit}`;
  }

  await db.each(
    `
    SELECT
      exerciseId AS id, description, duration, date
    FROM
      Exercise
    WHERE userId = ${userId}
    ${dateFilter}
    ORDER BY date ASC
    ${limitFilter}
    `,
    (error, row) => {
      if (error) {
        throw Error('Could not display log');
      }
      logs.push(row);
    }
  );

  const count = await db.get(
    `
    SELECT
      COUNT (exerciseId) as result
    FROM
      Exercise
    WHERE
      userId = ?
    `,
    userId
  );

  return {
    id: userId,
    username: user.username,
    logs,
    count: count?.result || 0, 
  };
}
