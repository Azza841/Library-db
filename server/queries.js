const pool = require('./db');


  /*async function getAllBooks() {
    const [rows] = await pool.query('SELECT 	idBooks, Title, Available FROM Books');
    return rows;
  }*/
 //----books---//
 async function getAllBooks(filters = {}) {
  const conditions = [];   // pieces of the WHERE, e.g. 'title LIKE ?'
  const values = [];       // the values for the ? marks, in the same order

  if (filters.title) {
    conditions.push('title LIKE ?');
    values.push(`%${filters.title}%`);
  }
  if (filters.idAuthor) {
    conditions.push('idAuthor = ?');
    values.push(Number(filters.idAuthor));
  }
  if (filters.idCategory) {
    conditions.push('idCategory = ?');
    values.push(Number(filters.idCategory));
  }
  if (filters.Available !== undefined) {
    conditions.push('Available = ?');
    values.push(filters.Available === 'true' ? 1 : 0);
  }

  let sql = `SELECT idBooks, Title, Publication_year, Editor, Available, idCategory, idAuthor
             FROM Books`;
  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  const sortable = {
    title: 'Title',
    publication_year: 'Publication_year',
    idBooks: 'idBooks'
  };
  if (Object.prototype.hasOwnProperty.call(sortable, filters.sort)) {
    const order = filters.order === 'desc' ? 'DESC' : 'ASC';
    sql += ` ORDER BY ${sortable[filters.sort]} ${order}`;
  }

  const [rows] = await pool.query(sql, values);
  return rows;
}


async function getBookById(id) {
  const [rows] = await pool.query(
    `SELECT idBooks, Title, Publication_year, Editor, Available, idCategory, idAuthor
     FROM Books WHERE idBooks = ?`,
    [id]
  );
  return rows[0];
}

/*async function getBookById(id) {
  const [rows] = await pool.query('SELECT 	idBooks, title, available FROM books where 	idBooks = ?' , [id]);
  return rows[0];
}*/

async function createBook(b) {
  await pool.query(
    `INSERT INTO Books (idBooks, Title, Publication_year, Editor, idCategory, idAuthor)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      b.idBooks,
      b.Title ?? b.title,
      b.Publication_year ?? b.publication_year,
      b.Editor ?? b.editor,
      b.idCategory,
      b.idAuthor
    ]
  );
  return b.idBooks;
}

async function updateBook(id, b) {
  const [result] = await pool.query(
    `UPDATE Books
     SET Title = ?, Publication_year = ?, Editor = ?, idCategory = ?, idAuthor = ?
     WHERE idBooks = ?`,
    [
      b.Title ?? b.title,
      b.Publication_year ?? b.publication_year,
      b.Editor ?? b.editor,
      b.idCategory,
      b.idAuthor,
      id
    ]
  );
  return result.affectedRows;
}

async function deleteBook(id) {
  const [result] = await pool.query('DELETE FROM Books WHERE idBooks = ?', [id]);
  return result.affectedRows;
}
//-----members---//
async function getAllMembers() {
  const [rows] = await pool.query('SELECT * FROM Members');
  return rows;
}

async function getMemberById(id) {
  const [rows] = await pool.query('SELECT * FROM Members WHERE idMember = ?', [id]);
  return rows[0] || null;
}

async function createMember(m) {
  await pool.query(
    'INSERT INTO Members (idMember, First_name, Last_name, Email) VALUES (?, ?, ?, ?)',
    [m.idMember, m.First_name, m.Last_name, m.Email]
  );
  return m.idMember;
}

async function updateMember(id, m) {
  const [result] = await pool.query(
    'UPDATE Members SET First_name = ?, Last_name = ?, Email = ? WHERE idMember = ?',
    [m.First_name, m.Last_name, m.Email, id]
  );
  return result.affectedRows;
}

async function deleteMember(id) {
  const [result] = await pool.query('DELETE FROM Members WHERE idMember = ?', [id]);
  return result.affectedRows;
}
//-----loans---//
async function getAllLoans() {
  const [rows] = await pool.query(
    `SELECT br.idMember, br.idBooks, CONCAT_WS(' ', m.First_name, m.Last_name) AS member,
            b.Title AS book, br.loan_date, br.return_date
     FROM Borrow br
     INNER JOIN Members m ON br.idMember = m.idMember
     INNER JOIN Books b ON br.idBooks = b.idBooks`
  );
  return rows;
}

async function getLoanById(memberId, bookId) {
  const [rows] = await pool.query(
    'SELECT * FROM Borrow WHERE idMember = ? AND idBooks = ?',
    [memberId, bookId]
  );
  return rows[0] || null;
}

// Borrow: TWO changes that must succeed together → transaction
async function createLoan(memberId, bookId) {
  const conn = await pool.getConnection();     // borrow a connection yourself
  try {
    await conn.beginTransaction();
    const [result] = await conn.query(
      'INSERT INTO Borrow (idMember, idBooks, loan_date) VALUES (?, ?, CURDATE())',
      [memberId, bookId]
    );
    await conn.query('UPDATE Books SET Available = FALSE WHERE idBooks = ?', [bookId]);
    await conn.commit();                       // both worked → save
    return result.affectedRows;
  } catch (error) {
    await conn.rollback();                     // one failed → undo both
    throw error;                               // let the route's catch send the 500
  } finally {
    conn.release();                            // ALWAYS give the connection back
  }
}


// PUT: update the loan. If a return_date is now set, the book becomes available again.
async function updateLoan(memberId, bookId, loan) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query(
      'SELECT return_date FROM Borrow WHERE idMember = ? AND idBooks = ?',
      [memberId, bookId]
    );
    if (rows.length === 0) {
      await conn.rollback();
      return 0;                                    // not found
    }

    await conn.query(
      'UPDATE Borrow SET loan_date = ?, return_date = ? WHERE idMember = ? AND idBooks = ?',
      [loan.loan_date, loan.return_date || null, memberId, bookId]
    );

    // newly returned → book available again
    if (loan.return_date && !rows[0].return_date) {
      await conn.query('UPDATE Books SET Available = TRUE WHERE idBooks = ?', [bookId]);
    }

    await conn.commit();
    return 1;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

// DELETE: if the loan was never returned, free the book too.
async function deleteLoan(memberId, bookId) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query(
      'SELECT return_date FROM Borrow WHERE idMember = ? AND idBooks = ?',
      [memberId, bookId]
    );
    if (rows.length === 0) {
      await conn.rollback();
      return 0;
    }

    await conn.query(
      'DELETE FROM Borrow WHERE idMember = ? AND idBooks = ?',
      [memberId, bookId]
    );
    if (!rows[0].return_date) {
      await conn.query('UPDATE Books SET Available = TRUE WHERE idBooks = ?', [bookId]);
    }

    await conn.commit();
    return 1;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}
module.exports = {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getAllMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
  getAllLoans,
  getLoanById,
  createLoan,
  updateLoan,
  deleteLoan
};