const pool = require('./db');


async function getAllBooks() {
  const [rows] = await pool.query('SELECT id, title, available FROM books');
  return rows;
}

async function getBookById(id) {
  const [rows] = await pool.query('SELECT id, title, available FROM books where id = ?' , [id]);
  return rows[0];
}

module.exports = { getAllBooks , getBookById}