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

const session = require('express-session');

// Session configuration
app.use(session({
    secret: 'secret-key', // Change this to a strong secret key
    resave: false,        // Don't save session if unmodified
    saveUninitialized: false, // Don't create session until something is stored
    cookie: { secure: false } // Set 'true' if using HTTPS
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Search Route (GET)
const destinations = [
    {
        name: "rome",
        description: "Rome today is one of the most important tourist destinations of the world, due to the incalculable immensity of its archaeological and art treasures, as well as for the charm of its unique traditions, the beauty of its panoramic views, and the majesty of its magnificent villas.",
        image: "rome.png",
        pageTitle: "rome",
        category: "city"
    },
    {
        name: "paris",
        description: "It is known as the most romantic city in the world, and is home to some world famous sights that are constantly shown in travel magazines, movies, and other works of art. Paris, the capital of France, has a population of over two million people and is one of Europe's most-visited cities.",
        image: "paris.png",
        pageTitle: "paris",
        category: "city"
    },
    {
      name: "bali island",
      description: "Also known as the Land of the Gods, Bali appeals through its sheer natural beauty of looming volcanoes and lush terraced rice fields that exude peace and serenity. It is also famous for surfers' paradise.",
      image: "bali.png",
      pageTitle: "bali",
      category: "island"
  },
  {
    name: "annapurna circuit",
    description: "Annapurna Circuit has been voted as the best long-distance trek in the world, as it combined a wide variety of climate zones from tropics at 600m above sea level to the arctic at 5416m above sea level at the Thorong La pass and cultural variety from Hindu villages at the low foothills to the Tibetan culture of Manang.",
    image: "annapurna.png",
    pageTitle: "annapurna",
    category: "hiking"
  },
  {
    name: "inca trail to machu picchu",
    description: "Peru's Inca Trail is perhaps the world's greatest hike because it combines the best of both types of travel: a four-to-five day walk to the spectacular lost city of Machu Picchu that winds through the zone where the snowcapped Andes Mountains crash into the lush Amazon jungle.",
    image: "inca.png",
    pageTitle: "inca",
    category: "hiking"
  },
  {
    name: "santorini island",
    description: "With its stunning turquoise waters and picturesque villages, great activities including wine-tasting, authentic Greek cuisine, regular boat excursions due to its ideal location for island hopping, small Greek island of Santorini became so popular as a holiday destination.",
    image: "santorini.png",
    pageTitle: "santorini",
    category: "island"
  },
  ];
  
  //Search route (POST)
  app.post('/search', (req, res) => {
    const query = req.body.Search.toLowerCase().trim();
    let filteredDestinations = destinations.filter(destinations => destinations.name.toLowerCase().includes(query));
    if (filteredDestinations.length === 0) {
        filteredDestinations = [];  
    }
    res.render('searchresults', { destinations: filteredDestinations });
  });

// Navigation
app.get('/', function (req, res) {
    res.render('login', { message: null });
});

app.get('/annapurna',isAuthenticated, function (req, res) {
    res.render('annapurna');
});

app.get('/bali',isAuthenticated, function (req, res) {
    res.render('bali');
});

app.get('/cities',isAuthenticated, function (req, res) {
    res.render('cities');
});

app.get('/hiking',isAuthenticated, function (req, res) {
    res.render('hiking');
});

/*app.get('/home', function (req, res) {
    res.render('home');
});*/

app.get('/inca',isAuthenticated, function (req, res) {
    res.render('inca');
});

app.get('/islands',isAuthenticated, function (req, res) {
    res.render('islands');
});

app.get('/paris',isAuthenticated, function (req, res) {
    res.render('paris');
});

app.get('/registration', function (req, res) {
    res.render('registration');
});

app.get('/rome',isAuthenticated, function (req, res) {
    res.render('rome');
});

app.get('/santorini',isAuthenticated, function (req, res) {
    res.render('santorini');
});

app.get('/searchresults',isAuthenticated, function (req, res) {
    res.render('searchresults');
});

/*app.get('/wanttogo',isAuthenticated, function (req, res) {
    res.render('wanttogo');
});*/

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
        return res.send(`
            <script>
                alert("Please enter both username and password.");
                window.location.href = "/";
            </script>
        `);
    }

    try {
        const userCollection = db.collection('myCollection');
        const user = await userCollection.findOne({ username: username });

        if (!user) {
            return res.send(`
                <script>
                    alert("User not found.");
                    window.location.href = "/";
                </script>
            `);
        }

        if (user.password !== password) {
            return res.send(`
                <script>
                    alert("Incorrect password.");
                    window.location.href = "/";
                </script>
            `);
        }

        // Clear the existing session and start a new one
        req.session.regenerate(err => {
            if (err) {
                console.error("Error regenerating session:", err.message);
                return res.status(500).send("Internal server error");
            }

            // Store the username in the new session
            req.session.username = username;

            console.log("New session created:", req.session);
            res.redirect('/home');
        });

    } catch (err) {
        console.error("Error during login:", err.message);
        res.status(500).send(`
            <script>
                alert("Something went wrong during login.");
                window.location.href = "/";
            </script>
        `);
    }
});

app.post('/addDestination', async function (req, res) {
    const { destination } = req.body;
    const { username } = req.session;

    if(!username){
        return res.status(400).json({err:"You must be logged in!"});
    }
    
    if (!destination) {
        return res.status(400).json({err:"Destination is required."});
    }

    try {
        // Check if destination already exists
        const userCollection = db.collection('myCollection');
        const existingUser = await userCollection.findOne({ username });

        if (!existingUser) {
            return res.status(400).send("Error: User not found.");
        }

        const destinationKey = destination.toLowerCase().trim();

        // Check if the destination already exists in the user's destinations array
        const destinationExists = existingUser.destinations && existingUser.destinations.some(dest => dest.destinationKey === destinationKey);

        if (destinationExists) {
            return res.status(400).json({err:"Destination already exists."});
        }

        // Add the new destination to the user's destinations array
        await userCollection.updateOne(
            { username },
            { $push: { destinations: { destinationKey, name: destination } } }
        );

        res.json({
            success: true,
        });
    } catch (err) {
        console.error("Error during adding destination:", err.message);
        res.status(500).json({err:"Something went wrong while adding destination."});
    }
});

// Start the server
app.listen(3000, function () {
    console.log("Server is running on http://localhost:3000");
});

/*app.get('/wanttogo', async function (req, res) {
    const { username } = req.session;

    if (!username) {
        return res.send(`
            <script>
                alert("You must be logged in to view your Want-to-Go List.");
                window.location.href = "/";
            </script>
        `);
    }

    try {
        const userCollection = db.collection('wantToGoList');
        const userDestinations = await userCollection.find({ username }).toArray();

        res.render('wanttogo', { destinations: userDestinations });
    } catch (err) {
        console.error("Error fetching Want-to-Go List:", err.message);
        res.status(500).send("Error fetching your Want-to-Go List.");
    }
});*/


function isAuthenticated(req, res, next) {    
    console.log("Session Data:", req.session); // Debug session data
    if (req.session && req.session.username) {
        // User is authenticated
        next();
    } else {
        // Redirect to login page if not authenticated
        res.send(`
            <script>
                alert("You must log in first.");
                window.location.href = "/";
            </script>
        `);
    }
}

// Home route requires authentication
app.get('/home', isAuthenticated, function (req, res) {
    res.render('home',{ username: req.session.username });
});

// Want-to-go route requires authentication
app.get('/wanttogo', isAuthenticated, async function (req, res) {
    try {
        const { username } = req.session;
        const userCollection = db.collection('myCollection');
        const currentUser = await userCollection.findOne({ username });

        if (!currentUser) {
            return res.status(500).send("Error: User not found.");
        }

        // Default to an empty array if `destinations` is undefined
        const userDestinations = currentUser.destinations || [];

        res.render('wanttogo', { destinations: userDestinations });
    } catch (err) {
        console.error("Error fetching Want-to-Go List:", err.message);
        res.status(500).send("Error fetching your Want-to-Go List.");
    }
});

app.get('/debug', (req, res) => {
    res.json({ session: req.session });
});

/*app.post('/', async function (req, res) {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.send(`
            <script>
                alert("Please enter both username and password.");
                window.location.href = "/";
            </script>
        `);
    }

    try {
        const userCollection = db.collection('myCollection');
        const user = await userCollection.findOne({ username: username });

        if (!user) {
            return res.send(`
                <script>
                    alert("User not found.");
                    window.location.href = "/";
                </script>
            `);
        }

        if (user.password !== password) {
            return res.send(`
                <script>
                    alert("Incorrect password.");
                    window.location.href = "/";
                </script>
            `);
        }

        // Store username in session
        req.session.username = username;

        console.log("Login successful:", username);
        res.redirect('/home');  

    } catch (err) {
        console.error("Error during login:", err.message);
        res.status(500).send(`
            <script>
                alert("Something went wrong during login.");
                window.location.href = "/";
            </script>
        `);
    }
});*/

module.exports = app;
