require('dotenv').config();
var express = require('express');
var path = require('path');
var app = express();

// MongoDB setup
const { MongoClient } = require('mongodb');
const uri = "mongodb://127.0.0.1:27017";
const client = new MongoClient(uri);
let db;

async function connectToDatabase() {
    try {
        await client.connect();
        db = client.db('myDB');
        console.log("Connected successfully to MongoDB");
    } catch (err) {
        console.error("Error connecting to MongoDB:", err.message);
    }
}
connectToDatabase();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Navigation
app.get('/', function (req, res) {
    res.render('login', { message: null });
});

app.get('/annapurna', function (req, res) {
    res.render('annapurna');
});

app.get('/bali', function (req, res) {
    res.render('bali');
});

app.get('/cities', function (req, res) {
    res.render('cities');
});

app.get('/hiking', function (req, res) {
    res.render('hiking');
});

app.get('/home', function (req, res) {
    res.render('home');
});

app.get('/inca', function (req, res) {
    res.render('inca');
});

app.get('/islands', function (req, res) {
    res.render('islands');
});

app.get('/paris', function (req, res) {
    res.render('paris');
});

app.get('/registration', function (req, res) {
    res.render('registration');
});

app.get('/rome', function (req, res) {
    res.render('rome');
});

app.get('/santorini', function (req, res) {
    res.render('santorini');
});

app.get('/searchresults', function (req, res) {
    res.render('searchresults');
});

app.get('/wanttogo', function (req, res) {
    res.render('wanttogo');
});

// Registration POST route
app.post('/register', async function (req, res) {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send("Error: Username and password cannot be empty.");
    }

    try {
        // Check if username already exists
        const userCollection = db.collection('myCollection');
        const existingUser = await userCollection.findOne({ username: username });

        if (existingUser) {
            return res.status(400).send("Error: Username already exists.");
        }

        // Insert new user into database
        await userCollection.insertOne({ username: username, password: password });
        console.log("User registered successfully:", username);

        // Send popup message and redirect
        res.send(`
            <script>
                alert("Registration successful! Please log in.");
                window.location.href = "/";
            </script>
        `);
    } catch (err) {
        console.error("Error during registration:", err.message);
        res.status(500).send("Error: Something went wrong during registration.");
    }
});


app.post('/', async function (req, res) {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.render('login', { message: 'Please enter both username and password.' });
    }

    try {
        const userCollection = db.collection('myCollection');
        const user = await userCollection.findOne({ username: username });

        // Check if user exists and password matches
        if (!user) {
            return res.render('login', { message: 'User not found.' });
        }

        if (user.password !== password) {
            return res.render('login', { message: 'Incorrect password.' });
        }

        console.log("Login successful:", username);

       
        res.redirect('/home');  

    } catch (err) {
        console.error("Error during login:", err.message);
        res.status(500).send("Error: Something went wrong during login.");
    }
});

// Start the server
app.listen(3000, function () {
    console.log("Server is running on http://localhost:3000");
});

module.exports = app;
