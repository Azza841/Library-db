

const pool = require('./db');
const { getAllBooks , getBookById} = require('./queries');


async function main() {
  try {
    
    console.log('--- Connection test ---');
    const conn = await pool.getConnection();
    console.log('Connected to MySQL ✓');
    conn.release();

    console.log('\n--- All books ---');
    console.log(await getAllBooks());

    console.log('\n--- book 2 ---');
    console.log(await getBookById(2));

  } catch (error) {
    console.error('Something went wrong:', error.message);
  } finally {
    await pool.end();
  }
}

main();