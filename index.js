const express = require('express');
const path = require('path');
const morgan = require('morgan');
const app = express();
const port = 8080;

// Use Morgan middleware for logging requests
app.use(morgan('combined'));

// Serve static files from the public folder
app.use('/public', express.static(path.join(__dirname, 'public')));

// Top 10 Movies Data
const movies = [
    { title: "Gladiator", year: 2000, genre: "Action" },
    { title: "300", year: 2006, genre: "Action" },
    { title: "300: Rise of an Empire", year: 2014, genre: "Action" },
    { title: "American Gangster", year: 2007, genre: "Crime" },
    { title: "Dune: Part Two", year: 2024, genre: "Sci-Fi" },
    { title: "Paddington 2", year: 2017, genre: "Comedy" },
    { title: "Avengers: Endgame", year: 2019, genre: "Action" },
    { title: "Gladiator", year: 2000, genre: "Action" },
    { title: "The Dark Knight", year: 2008, genre: "Action" },
    { title: "Pulp Fiction", year: 1994, genre: "Crime" },
];

// Define the / GET route
app.get('/', (req, res) => {
    res.send('Welcome to the Movie API!');
});

// Define the /movies GET route
app.get('/movies', (req, res) => {
    res.json(movies);
});

// Define a route to serve documentation.html
app.get('/documentation', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'documentation.html'));
});

// Error-handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

// Start the Express server
app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});

