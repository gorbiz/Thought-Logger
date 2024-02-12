const express = require('express')
const bodyParser = require('body-parser')
const sqlite3 = require('sqlite3').verbose()
const fs = require('fs')
const path = require('path')

const app = express()
const PORT = 3000

app.use(bodyParser.json())

const dbDirectory = 'dbs'
if (!fs.existsSync(dbDirectory)) {
  fs.mkdirSync(dbDirectory);
}

const getDbPath = (bucketId) => path.join(dbDirectory, `${bucketId}.db`)

const initDb = (bucketId) => {
  const dbPath = getDbPath(bucketId)
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error opening database', err.message)
    } else {
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

// staticly serve ../web
app.use(express.static(path.join(__dirname, '../web')))

app.post('/buckets/:bucketId/logs', (req, res) => {
  const bucketId = req.params.bucketId
  const { text, location, device, extra } = req.body
  const db = initDb(bucketId)

  console.debug('Received log:', text, location, device, extra)
  db.run('INSERT INTO logs (text, location, device, extra) VALUES (?, ?, ?, ?)', [text, location, device, JSON.stringify(extra)], function (err) {
    if (err) {
      return res.status(400).json({ "error": err.message })
    }
    res.json({ "message": "Log entry created", "id": this.lastID })
  })
})

app.get('/buckets/:bucketId/logs', (req, res) => {
  const bucketId = req.params.bucketId
  const db = initDb(bucketId)

  db.all("SELECT * FROM logs", [], (err, rows) => {
    if (err) {
      return res.status(400).json({ "error": err.message })
    }
    res.json({ "message": "success", "data": rows })
  })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
