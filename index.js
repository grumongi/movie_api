const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://localhost:27017/myflixDB', { useNewUrlParser: true, useUnifiedTopology: true });

const express = require('express'),
      app = express(),
      bodyParser = require('body-parser'),
      uuid = require('uuid');

app.use(bodyParser.json());

// ✅ CREATE a new user in the database
app.post('/users', async (req, res) => {
    try {
        const existingUser = await Users.findOne({ Username: req.body.Username });
        if (existingUser) {
            return res.status(400).send(`${req.body.Username} already exists`);
        }

        const newUser = await Users.create({
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday
        });

        res.status(201).json(newUser);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error: ' + error);
    }
});

// ✅ READ - Get all users
app.get('/users', async (req, res) => {
    try {
        const users = await Users.find();
        res.status(200).json(users);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
    }
});

// ✅ READ - Get a user by Username
app.get('/users/:Username', async (req, res) => {
    try {
        const user = await Users.findOne({ Username: req.params.Username });
        if (user) {
            res.json(user);
        } else {
            res.status(400).send('No such user bro');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
    }
});

// ✅ UPDATE - Update a user's details
app.put('/users/:id', async (req, res) => {
    try {
        const updatedUser = await Users.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true } // Return updated document
        );

        if (updatedUser) {
            res.status(200).json(updatedUser);
        } else {
            res.status(400).send('No such user');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
    }
});

// ✅ DELETE - Remove a user by ID
app.delete('/users/:id', async (req, res) => {
    try {
        const deletedUser = await Users.findByIdAndDelete(req.params.id);
        if (deletedUser) {
            res.status(200).send(`User ${req.params.id} has been deleted`);
        } else {
            res.status(400).send('No such user');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
    }
});

// ✅ ADD a movie to a user's favorite list
app.post('/users/:id/:movieId', async (req, res) => {
    try {
        const user = await Users.findByIdAndUpdate(
            req.params.id,
            { $addToSet: { FavoriteMovies: req.params.movieId } },
            { new: true }
        );

        if (user) {
            res.status(200).json(user);
        } else {
            res.status(400).send('No such user');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
    }
});

// ✅ REMOVE a movie from a user's favorite list
app.delete('/users/:id/:movieId', async (req, res) => {
    try {
        const user = await Users.findByIdAndUpdate(
            req.params.id,
            { $pull: { FavoriteMovies: req.params.movieId } },
            { new: true }
        );

        if (user) {
            res.status(200).json(user);
        } else {
            res.status(400).send('No such user');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
    }
});

// ✅ READ - Get all movies
app.get('/movies', async (req, res) => {
    try {
        const movies = await Movies.find();
        res.status(200).json(movies);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
    }
});

// ✅ READ - Get a movie by title
app.get('/movies/:title', async (req, res) => {
    try {
        const movie = await Movies.findOne({ Title: req.params.title });
        if (movie) {
            res.status(200).json(movie);
        } else {
            res.status(400).send('No such movie');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
    }
});

// ✅ READ - Get movies by genre
app.get('/movies/genre/:genreName', async (req, res) => {
    try {
        const movies = await Movies.find({ 'Genre.Name': req.params.genreName });
        if (movies.length > 0) {
            res.status(200).json(movies);
        } else {
            res.status(400).send('No such genre');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
    }
});

// ✅ READ - Get movies by director
app.get('/movies/directors/:directorName', async (req, res) => {
    try {
        const movies = await Movies.find({ 'Director.Name': req.params.directorName });
        if (movies.length > 0) {
            res.status(200).json(movies);
        } else {
            res.status(400).send('No such director');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
    }
});

// ✅ Server listens on port 8080
app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});
