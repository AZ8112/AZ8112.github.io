const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');
const { v4: uuidv4 } = require('uuid'); // Import uuid for unique ID generation

//error handling
const morgan = require('morgan');

const app = express();

const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

// Log errors using winston
app.use((err, req, res, next) => {
    logger.error(err.stack); // Log the error to the file
    res.status(500).send('Something broke!'); // Send a generic response to the client
});

// Use morgan to log requests to the console
app.use(morgan('combined'));



// CORS configuration
app.use(cors({
    origin: 'http://localhost:3000', // Adjust to match the origin of your front-end
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());

// MySQL Database Connection
const db = mysql.createConnection({
    host: 'localhost',  // or 127.0.0.1
    user: 'root',       // Your MySQL root username
    password: 'KBEK15162118root',  // Your MySQL root password
    database: 'sublink_db'     // The name of your database
});

// Test database connection
db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL!');
});

// 1. POST /api/word-links - Create a new word link
app.post('/api/word-links', (req, res) => {
    const { word, title, content } = req.body;
    const linkId = uuidv4();  // Generate a unique ID for the link
    
    const sql = 'INSERT INTO sublinks_tbl (linkId, word, title, content) VALUES (?, ?, ?, ?)';
    db.query(sql, [linkId, word, title, content], (err, result) => {
        if (err) {
            console.error('Error inserting data:', err); // Log the error for debugging
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json({ id: result.insertId, linkId, word, title, content });
    });
});

// Endpoint to fetch a word link by its unique ID
app.get('/api/word-links/:id', (req, res) => {
    const { id } = req.params; // Extract the ID from the request parameters

    // SQL query to find the word link by its linkId
    const sql = 'SELECT * FROM sublinks_tbl WHERE linkId = ?';

    // Execute the SQL query
    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error('Database error:', err); // Log the error for debugging
            return res.status(500).json({ error: 'Internal server error. Please try again later.' });
        }

        // Check if the results array is empty
        if (results.length === 0) {
            return res.status(404).json({ error: 'Word link not found' });
        }

        // Send back the found word link as a JSON response
        res.status(200).json(results[0]);
    });
});

// 3. PUT /api/word-links/:id - Update an existing word link
app.put('/api/word-links/:id', (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;

    // SQL query to update the word link
    const sql = 'UPDATE sublinks_tbl SET title = ?, content = ? WHERE linkId = ?';
    db.query(sql, [title, content, id], (err, result) => {
        if (err) {
            console.error('Error updating data:', err); // Log the error for debugging
            return res.status(500).json({ error: 'Database error' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Word link not found' });
        }

        res.status(200).json({ message: 'Word link updated successfully' });
    });
});

// 4. DELETE /api/word-links/:id - Delete a word link
app.delete('/api/word-links/:id', (req, res) => {
    const { id } = req.params;

    // SQL query to delete the word link
    const sql = 'DELETE FROM sublinks_tbl WHERE linkId = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error deleting data:', err); // Log the error for debugging
            return res.status(500).json({ error: 'Database error' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Word link not found' });
        }

        res.status(200).json({ message: 'Word link deleted successfully' });
    });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
