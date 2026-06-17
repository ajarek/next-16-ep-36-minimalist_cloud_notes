require('dotenv').config()
const { db } = require('./lib/db')

async function test() {
  try {
    const notes = await db.note.findMany()
    console.log('Notes count:', notes.length)
  } catch (error) {
    console.error('Error during test:', error.message)
  }
}

test()
