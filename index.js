const express = require('express'),
      app = express(),
      bodyParser = require('body-parser'),
      uuid = require('uuid'),
      path = require('path');  

app.use(bodyParser.json());
app.use('/public', express.static(path.join(__dirname, 'public')));

let users = [
    {
        "id": 1,
        "name": 'Patrick William',
        "favoriteMovies": ['Gladiator']
    },
    {
        "id": 2,
        "name": 'Shawn Carter',
        "favoriteMovies": ['Dune: Part Two']
    },
];

let movies = [
    { "Title": "Gladiator", 
      "Year": 2000, 
      "Genre": { "Name": "Action" },
      "Director": { "Name": "Ridley Scott" } 
    },

    { "Title": "Dune: Part Two", 
      "Year": 2024, 
      "Genre": { "Name": "Sci-Fi" },
      "Director": { "Name": "Denis Villeneuve" } 
    },

    { "Title": "Pulp Fiction", 
      "Year": 1994, 
      "Genre": { "Name": "Crime" },
      "Director": { "Name": "Quentin Tarantino" }
    },
];

// CREATE
app.post('/users', (req, res) => {
    const newUser = req.body;

    if (newUser.name) {
        newUser.id = uuid.v4();
        users.push(newUser);
        res.status(201).json(newUser)
    } else {
        res.status(400).send('users need names')
    }
})

app.post('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;

    let user = users.find( user => user.id == id);

    if (user) {
        user.favoriteMovies.push(movieTitle);
        res.status(200).send(`${movieTitle} has been added to user ${id}'s array`);
    } else {
        res.status(400).send('no such user')
    }
})

// UPDATE
app.put('/users/:id', (req, res) => {
    const { id } = req.params;
    const updatedUser = req.body;

    let user = users.find( user => user.id == id);

    if (user) {
        user.name = updatedUser.name;
        res.status(200.).json(user);
    } else {
        res.status(400).send('no such user')
    }
})

// READ
app.get('/movies', (req, res) => {
    res.status(200).json(movies);
});

app.get('/movies/:title', (req, res) => {
    const { title } = req.params;
    const movie = movies.find(movie => movie.Title === title);

    if (movie) {
        res.status(200).json(movie);
    } else {
        res.status(400).send('No such movie');
    }
});

app.get('/movies/genre/:genreName', (req, res) => {
    const { genreName } = req.params;
    const movie = movies.find(movie => movie.Genre.Name === genreName);

    if (movie) {
        res.status(200).json(movie.Genre);
    } else {
        res.status(400).send('No such genre'); 
    }
});

app.get('/movies/directors/:directorName', (req, res) => {
    const { directorName } = req.params;
    const movie = movies.find(movie => movie.Director.Name === directorName);

    if (movie) {
        res.status(200).json(movie.Director);
    } else {
        res.status(400).send('No such director');
    }
});

// DELETE
app.delete('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;

    let user = users.find( user => user.id == id );

    if (user) {
        user.favoriteMovies = user.favoriteMovies.filter( title => title !== movieTitle);
        res.status(200).send(`${movieTitle} has been deleted from ${id}'s array`);
    } else {
        res.status(400).send('no such user')
    }
})

app.delete('/users/:id', (req, res) => {
    const { id } = req.params;

    let user = users.find( user => user.id == id);

    if (user) {
        users = users.filter( user => user.id != id);
        res.status(200).send(`user ${id}'s has been deleted`);
    } else {
        res.status(400).send('no such user')
    }
})

// Listen for requests
app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});
