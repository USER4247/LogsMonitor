import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import WinkTokenizer from 'wink-tokenizer'; // <-- new tokenizer

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 5000;
const LOG_FILE = path.join(__dirname , 'database/db.json');
const WORD_SEARCH_CACHE = path.join(__dirname, 'searchEngine/wordEngine.json');


// session clear - fresh start every run lol
try {
  fs.writeFileSync(LOG_FILE, '[{"error":[],"warn":[],"info":[],"debug":[]}]', 'utf8');
  console.log('Log file cleared for new session.');
} catch (err) {
  console.error('Failed to clear log file:', err);
}

try {
  fs.writeFileSync(WORD_SEARCH_CACHE, '{}', 'utf8');
  console.log('Word search cache cleared for new session.');
} catch (err) {
  console.error('Failed to clear word search cache:', err);
}

app.use(cors());
app.use(express.json());

if (!fs.existsSync(LOG_FILE)) {
  fs.writeFileSync(LOG_FILE, '[]', 'utf8');
}

if (!fs.existsSync(WORD_SEARCH_CACHE)) {
  fs.writeFileSync(WORD_SEARCH_CACHE, '{}', 'utf8');
}


// initialize wink tokenizer
const tokenizer = new WinkTokenizer();
tokenizer.defineConfig({
  numbers: false,  // ignore numbers tokens so stuff like server-400 filtered out
});


// POST /logs - receive a single log entry, save & index it
app.post('/logs', (req, res) => {
  const logs = req.body;

  try {
    if (typeof logs !== 'object' || logs === null) {
      return res.status(400).json({ error: 'Invalid JSON object' });
    }

    const { level, message, resourceId, timestamp, traceId, spanId, commit, metadata } = logs;

    // read logs
    let logsData = { filters: { error: [], warn: [], info: [], debug: [], message: [] } };
    if (fs.existsSync(LOG_FILE)) {
      const raw = fs.readFileSync(LOG_FILE, 'utf8');
      if (raw.trim()) logsData = JSON.parse(raw);
    }

    // make sure filters exist
    if (!logsData[0]) logsData[0] = { error: [], warn: [], info: [], debug: [], message: [] };
    ['error', 'warn', 'info', 'debug', 'message'].forEach(key => {
      if (!Array.isArray(logsData[0][key])) logsData[0][key] = [];
    });

    // compute new index
    const logIndexes = Object.keys(logsData)
      .filter(k => k !== '0' && k !== 'filters')
      .map(k => parseInt(k))
      .filter(n => !isNaN(n));
    const newIndex = logIndexes.length > 0 ? Math.max(...logIndexes) + 1 : 1;

    // store log
    logsData[newIndex] = { level, message, resourceId, timestamp, traceId, spanId, commit, metadata };
    logsData[0][level].push(newIndex); // index into level filter
    logsData[0]['message'].push(newIndex); // also index into 'message' filter

    // write to LOG_FILE
    fs.writeFileSync(LOG_FILE, JSON.stringify(logsData, null, 2), 'utf8');

    // -------------------------------
    // step 4 - tokenize and update wordEngine.json
    // -------------------------------
    let wordMap = {};
    if (fs.existsSync(WORD_SEARCH_CACHE)) {
      const raw = fs.readFileSync(WORD_SEARCH_CACHE, 'utf8');
      if (raw.trim()) wordMap = JSON.parse(raw);
    }

    // tokenize message
    const tokens = tokenizer.tokenize(message);

    // extract only actual words
    tokens.forEach(token => {
      if (token.tag === 'word') {
        const word = token.value.toLowerCase();
        if (!wordMap[word]) wordMap[word] = [];
        if (!wordMap[word].includes(newIndex)) wordMap[word].push(newIndex);
      }
    });

    fs.writeFileSync(WORD_SEARCH_CACHE, JSON.stringify(wordMap, null, 2), 'utf8');

    return res.status(201).json({ message: 'Logs Created !!!' });
  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({ error: 'internal server error', message: err.message });
  }
});


// GET /logs - just dump all logs if no filter constraints otherwise look up index[0] for filters inside of db.json and wordEngine for the words ...
app.get('/logs', (req, res) => {
  try {
    const logs = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read logs file' });
  }
});


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});


// GET /logs/search?word=xyz -> returns all matching logs based on word index
app.get('/logs/search', (req, res) => {
  const word = req.query.word?.toLowerCase()?.trim();

  if (!word || word.length === 0) {
    return res.status(400).json({ error: 'Missing search word' });
  }

  try {
    const logsData = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
    const wordMap = JSON.parse(fs.readFileSync(WORD_SEARCH_CACHE, 'utf8'));

    const matches = wordMap[word];
    if (!matches || matches.length === 0) {
      return res.status(200).json([]); // no matches
    }

    const resultLogs = matches
      .map(index => logsData[index])
      .filter(entry => entry); // skip missing logs

    res.json(resultLogs);
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Internal error during search' });
  }
});