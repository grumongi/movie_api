const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const uuid = require('uuid');
const passport = require('passport');
const cors = require('cors');
const { check, validationResult } = require('express-validator');

require('./passport');
const Models = require('./models.js');
const auth = require('./auth');
const Movies = Models.Movie;
const Users = Models.User;

// ✅ Connect to MongoDB
mongoose.connect(process.env.CONNECTION_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// ✅ Initialize Express App
const app = express();
app.use(bodyParser.json());


// ✅ CORS Configuration
const allowedOrigins = ['http://localhost:1234', 'http://testsite.com'];  // Updated to include the React app's URL

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);  // Allow requests with no origin (e.g., mobile apps, curl requests, etc.)
        if (!allowedOrigins.includes(origin)) {
            return callback(new Error(`CORS policy does not allow access from ${origin}`), false);  // Block unauthorized origins
        }
        return callback(null, true);  // Allow request from valid origin
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],  // You can customize the allowed methods here
    allowedHeaders: ['Content-Type', 'Authorization'],  // Allow headers like Content-Type, Authorization
    credentials: true  // Allow cookies and other credentials
}));


// ✅ Authentication Middleware
auth(app);

// ✅ Welcome Route
app.get("/", (req, res) => {
    res.send("Welcome to the Cinema Center API!");
});

/* ----------------------------------- */
/*          USER ROUTES                */
/* ----------------------------------- */

// ✅ CREATE - Register a new user
app.post('/users', [
    check('Username', 'Username is required (min 5 characters)').isLength({ min: 5 }),
    check('Username', 'Username must contain only alphanumeric characters').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Invalid email format').isEmail()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    try {
        const existingUser = await Users.findOne({ Username: req.body.Username });
        if (existingUser) return res.status(400).send('Username already exists');

        const hashedPassword = Users.hashPassword(req.body.Password);
        const newUser = await Users.create({
            Username: req.body.Username,
            Password: hashedPassword,
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

// ✅ UPDATE - Update user details
app.put('/users/:Username', passport.authenticate('jwt', { session: false }), async (req, res) => {
    if (req.user.Username !== req.params.Username) return res.status(403).send('Permission denied');

    try {
        const updatedUser = await Users.findOneAndUpdate(
            { Username: req.params.Username },
            { $set: req.body },
            { new: true }
        );

        if (!updatedUser) return res.status(404).send('User not found');
        res.status(200).json(updatedUser);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
    }
});

// ✅ DELETE - Remove a user by ID
app.delete('/users/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    if (req.user._id.toString() !== req.params.id) return res.status(403).send('You can only delete your own account.');

    try {
        const deletedUser = await Users.findByIdAndDelete(req.params.id);
        if (!deletedUser) return res.status(404).send('Sorry user not found');

        res.status(200).send(`User ${req.params.id} has been deleted`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
    }
});

// ✅ ADD - Add a movie to a user's favorite list
app.post('/users/:id/favorites/:movieId', async (req, res) => {
    try {
        const user = await Users.findByIdAndUpdate(
            req.params.id,
            { $addToSet: { FavoriteMovies: req.params.movieId } },
            { new: true }
        );

        if (!user) return res.status(404).send('User not found');
        res.status(200).json(user);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
    }
});

/* ----------------------------------- */
/*          MOVIE ROUTES               */
/* ----------------------------------- */

// ✅ READ - Get all movies (Updated: Re-enabled authentication)
app.get('/movies', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const movies = await Movies.find();
        res.status(200).json(movies);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error: ' + error);
    }
});

// ✅ READ - Get a movie by title
app.get('/movies/:title', async (req, res) => {
    try {
        const movie = await Movies.findOne({ Title: req.params.title });
        if (!movie) return res.status(404).send('Movie not found');
        
        res.status(200).json(movie);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
    }
});

// ✅ READ - Get movies by genre
app.get('/movies/genre/:genreName', async (req, res) => {
    try {
        const movies = await Movies.find({ 'Genre.Name': req.params.genreName });
        if (!movies.length) return res.status(404).send('No movies found for this genre');

        res.status(200).json(movies);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
    }
});

// ✅ READ - Get movies by director
app.get('/movies/directors/:directorName', async (req, res) => {
    try {
        const movies = await Movies.find({ 'Director.Name': req.params.directorName });
        if (!movies.length) return res.status(404).send('No movies found for this director');

        res.status(200).json(movies);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
    }
});

/* ----------------------------------- */
/*          SERVER SETUP               */
/* ----------------------------------- */

// ✅ Start Server
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
    console.log(`Listening on Port ${port}`);
});
