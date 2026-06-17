require('dotenv').config()
const { Pool } = require('@neondatabase/serverless')

async function test() {
  const url = process.env.DATABASE_URL
  console.log('Testing pool with URL length:', url?.length)
  const pool = new Pool({ connectionString: url })
  try {
    const client = await pool.connect()
    console.log('Connected successfully')
    const res = await client.query('SELECT NOW()')
    console.log('Query result:', res.rows[0])
    await client.release()
  } catch (error) {
    console.error('Pool connection error:', error.message)
  } finally {
    await pool.end()
  }
}

test()
