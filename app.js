import express from 'express'
import bodyParser from 'body-parser'
import sqlite3 from 'sqlite3'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

// Ensure the database directory exists
const dbDirectory = 'dbs'
if (!fs.existsSync(dbDirectory)) fs.mkdirSync(dbDirectory)

// Function to get the database path
const getDbPath = bucketId => path.join(dbDirectory, `${bucketId}.db`)

// Initialize the database
const initDb = bucketId => {
  const dbPath = getDbPath(bucketId)
  const db = new sqlite3.Database(dbPath, err => {
    if (err) console.error('Error opening database', err.message)
    else {
      db.run(`CREATE TABLE IF NOT EXISTS logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                text TEXT,
                location TEXT,
                device TEXT,
                extra TEXT
            );`)
    }
  })
  return db
}

// Middleware to parse JSON bodies
router.use(bodyParser.json())

// Route to serve list.html
router.get('/list', (req, res) => {
  res.sendFile(path.join(__dirname, './public/list.html'))
})

// Route to post logs to a specific bucket
router.post('/b/:bucketId', (req, res) => {
  const { bucketId } = req.params
  const { text, location, device, extra } = req.body
  const db = initDb(bucketId)

  db.run('INSERT INTO logs (text, location, device, extra) VALUES (?, ?, ?, ?)', [text, location, device, JSON.stringify(extra)], function (err) {
    if (err) return res.status(400).json({ "error": err.message })
    res.json({ "message": "Log entry created", "id": this.lastID })
  })
})

// Route to delete a log from a specific bucket
router.delete('/b/:bucketId/:logId', (req, res) => {
  const { bucketId, logId } = req.params
  const db = initDb(bucketId)

  console.log('Deleting log')
  console.log(logId)

  db.run('DELETE FROM logs WHERE id = ?', [logId], function (err) {
    if (err) return res.status(400).json({ "error": err.message })
    res.json({ "message": "Log entry deleted" })
  })
})

// Route to get logs from a specific bucket
router.get('/b/:bucketId', (req, res) => {
  const { bucketId } = req.params
  const db = initDb(bucketId)

  db.all("SELECT * FROM logs", [], (err, rows) => {
    if (err) return res.status(400).json({ "error": err.message })
    res.json({ "message": "success", "data": rows })
  })
})

export default router

if (import.meta.main) { // If this file is run directly, start standalone server
  const app = express()
  const PORT = process.env.PORT || 3333
  app.use('/logger', router)
  app.listen(PORT, () => console.log(`Logger server running on port ${PORT}`))
}