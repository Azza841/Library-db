const express = require('express');
const {
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
} = require('./queries');

const app = express();
app.use(express.json());   

const isValidInteger = value =>
  (typeof value === 'number' || (typeof value === 'string' && value.trim() !== '')) &&
  Number.isSafeInteger(Number(value));

const isValidId = value => isValidInteger(value) && Number(value) > 0;

const isValidDate = value =>
  typeof value === 'string' &&
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  !Number.isNaN(Date.parse(value)) &&
  new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;

const sendServerError = (res, message, operation, error) => {
  console.error(`${operation} failed:`, error);
  return res.status(500).json({ error: message });
};

//----books---//
app.get('/api/books', async (req, res) => {
  try {
    const { idAuthor, idCategory, Available } = req.query;

    if (idAuthor !== undefined && !isValidId(idAuthor)) {
      return res.status(400).json({ error: 'idAuthor must be a number' });
    }
    if (idCategory !== undefined && !isValidId(idCategory)) {
      return res.status(400).json({ error: 'idCategory must be a number' });
    }
    if (Available !== undefined && Available !== 'true' && Available !== 'false') {
      return res.status(400).json({ error: 'Available must be true or false' });
    }

    const books = await getAllBooks(req.query);
    res.json(books);
  } catch (error) {
    return sendServerError(res, 'Failed to load books', 'GET /api/books', error);
  }
});


app.get('/api/books/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'id must be a number' });
    }
    const book = await getBookById(id);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.json(book);
  } catch (error) {
    return sendServerError(res, 'Failed to load the book', 'GET /api/books/:id', error);
  }
});

app.post('/api/books', async (req, res) => {
  try {
    const body = req.body ?? {};
    const { idBooks, Title, title, Publication_year, publication_year, Editor, editor, idCategory, idAuthor } = body;
    if (
      !isValidId(idBooks) ||
      typeof (Title ?? title) !== 'string' ||
      !(Title ?? title).trim() ||
      !isValidId(idCategory) ||
      !isValidId(idAuthor) ||
      typeof (Publication_year ?? publication_year) === 'undefined' ||
      (typeof (Publication_year ?? publication_year) === 'string' &&
        (Publication_year ?? publication_year).trim() === '') ||
      !isValidInteger(Publication_year ?? publication_year) ||
      typeof (Editor ?? editor) !== 'string'
    ) {
      return res.status(400).json({
        error: 'idBooks, title, publication_year, editor, idCategory and idAuthor are required'
      });
    }
    const id = await createBook(body);
    res.status(201).json({ id, ...body });
  } catch (error) {
    return sendServerError(res, 'Failed to create the book', 'POST /api/books', error);
  }
});

app.put('/api/books/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const body = req.body ?? {};
    const { Title, title, Publication_year, publication_year, Editor, editor, idCategory, idAuthor } = body;
    if (
      !isValidId(req.params.id) ||
      typeof (Title ?? title) !== 'string' ||
      !(Title ?? title).trim() ||
      !isValidId(idCategory) ||
      !isValidId(idAuthor) ||
      !isValidInteger(Publication_year ?? publication_year) ||
      typeof (Editor ?? editor) !== 'string'
    ) {
      return res.status(400).json({
        error: 'A valid id, title, publication_year, editor, idCategory and idAuthor are required'
      });
    }
    const updated = await updateBook(id, body);
    if (updated === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.json({ id, ...body });
  } catch (error) {
    return sendServerError(res, 'Failed to update the book', 'PUT /api/books/:id', error);
  }
});

app.delete('/api/books/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'id must be a number' });
    }
    const deleted = await deleteBook(id);
    if (deleted === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.status(204).send();
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.code === 'ER_ROW_IS_REFERENCED') {
      return res.status(409).json({ error: 'Cannot delete a book that has loan records' });
    }
    return sendServerError(res, 'Failed to delete the book', 'DELETE /api/books/:id', error);
  }
});

//-----members---//
app.get('/api/members', async (req, res) => {
  try {
    res.json(await getAllMembers());
  } catch (error) {
    return sendServerError(res, 'Failed to load members', 'GET /api/members', error);
  }
});

app.get('/api/members/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ error: 'id must be a number' });
    }
    const member = await getMemberById(id);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }
    res.json(member);
  } catch (error) {
    return sendServerError(res, 'Failed to load the member', 'GET /api/members/:id', error);
  }
});

app.post('/api/members', async (req, res) => {
  try {
    const body = req.body ?? {};
    const { idMember, First_name, Last_name, Email } = body;
    if (!isValidId(idMember) || !First_name || !Last_name || !Email) {
      return res.status(400).json({ error: 'idMember, First_name, Last_name and Email are required' });
    }
    const id = await createMember(body);
    res.status(201).json({ id, ...body });
  } catch (error) {
    return sendServerError(res, 'Failed to create the member', 'POST /api/members', error);
  }
});

app.put('/api/members/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const body = req.body ?? {};
    const { First_name, Last_name, Email } = body;
    if (!isValidId(req.params.id) || !First_name || !Last_name || !Email) {
      return res.status(400).json({ error: 'A valid id, a first name, a last name and an email are required' });
    }
    const updated = await updateMember(id, body);
    if (updated === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }
    res.json({ id, First_name, Last_name, Email });
  } catch (error) {
    return sendServerError(res, 'Failed to update the member', 'PUT /api/members/:id', error);
  }
});

app.delete('/api/members/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ error: 'id must be a number' });
    }
    const deleted = await deleteMember(id);
    if (deleted === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }
    res.status(204).send();
  } catch (error) {
    return sendServerError(res, 'Failed to delete the member', 'DELETE /api/members/:id', error);
  }
});
//----loans---//
app.get('/api/loans', async (req, res) => {
  try {
    res.json(await getAllLoans());
  } catch (error) {
    return sendServerError(res, 'Failed to load loans', 'GET /api/loans', error);
  }
});

app.post('/api/loans', async (req, res) => {
  try {
    const body = req.body ?? {};
    const { idMember, idBooks } = body;
    if (!isValidId(idMember) || !isValidId(idBooks)) {
      return res.status(400).json({ error: 'idMember and idBooks must be numbers' });
    }

    const memberId = Number(idMember);
    const bookId = Number(idBooks);
    const created = await createLoan(memberId, bookId);
    if (created === 0) {
      return res.status(400).json({ error: 'Loan could not be created' });
    }
    res.status(201).json({ idMember: memberId, idBooks: bookId });
  } catch (error) {
    return sendServerError(res, 'Failed to create the loan', 'POST /api/loans', error);
  }
});

app.get('/api/loans/:memberId/:bookId', async (req, res) => {
  try {
    const memberId = Number(req.params.memberId);
    const bookId = Number(req.params.bookId);
    if (!isValidId(req.params.memberId) || !isValidId(req.params.bookId)) {
      return res.status(400).json({ error: 'memberId and bookId must be numbers' });
    }
    const loan = await getLoanById(memberId, bookId);
    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }
    res.json(loan);
  } catch (error) {
    return sendServerError(res, 'Failed to load the loan', 'GET /api/loans/:memberId/:bookId', error);
  }
});

app.put('/api/loans/:memberId/:bookId', async (req, res) => {
  try {
    const memberId = Number(req.params.memberId);
    const bookId = Number(req.params.bookId);
    const body = req.body ?? {};
    const { loan_date, return_date } = body;
    if (
      !isValidId(req.params.memberId) ||
      !isValidId(req.params.bookId) ||
      !isValidDate(loan_date) ||
      return_date === undefined ||
      (return_date !== null && !isValidDate(return_date))
    ) {
      return res.status(400).json({
        error: 'Valid memberId, bookId, loan_date, and return_date (or null) are required'
      });
    }
    const updated = await updateLoan(memberId, bookId, body);
    if (updated === 0) {
      return res.status(404).json({ error: 'Loan not found' });
    }
    res.json({ ...body, idMember: memberId, idBooks: bookId });
  } catch (error) {
    return sendServerError(res, 'Failed to update the loan', 'PUT /api/loans/:memberId/:bookId', error);
  }
});

app.delete('/api/loans/:memberId/:bookId', async (req, res) => {
  try {
    const memberId = Number(req.params.memberId);
    const bookId = Number(req.params.bookId);
    if (!isValidId(req.params.memberId) || !isValidId(req.params.bookId)) {
      return res.status(400).json({ error: 'memberId and bookId must be numbers' });
    }
    const deleted = await deleteLoan(memberId, bookId);
    if (deleted === 0) {
      return res.status(404).json({ error: 'Loan not found' });
    }
    res.status(204).send();
  } catch (error) {
    return sendServerError(res, 'Failed to delete the loan', 'DELETE /api/loans/:memberId/:bookId', error);
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});