```sql
-- JSON in sqlite:

CREATE TABLE logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    text TEXT,
    location TEXT,
    extra TEXT  -- This column will store JSON data
);

INSERT INTO logs (text, location, extra) VALUES
('Sample log entry', 'Göteborg', '{"tags": ["personal", "ideas"], "device": "laptop"}');


SELECT * FROM logs
WHERE json_extract(extra, '$.tags') LIKE '%personal%';


UPDATE logs
SET extra = json_set(extra, '$.device', 'mobile')
WHERE id = 1;

```