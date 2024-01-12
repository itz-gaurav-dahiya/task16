let express =require('express')
const fs = require('fs').promises;

const app = express();
// const port = 5000;
var port =process.env.PORT||2410

app.use(express.json());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, , authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET,POST,DELETE,PUT,OPTIONS");
  next();
});

let  data = require('./ndb16Data.json');
const { movies } = data
let {mydataa=''}=data
let {users}=data
app.get('/movies', (req, res) => {
    res.json(movies);
  });

app.get('/movies/:city', (req, res) => {
    const { city } = req.params;
    const { q, lang, format, genre } = req.query;
    console.log(city)
    // Filter movies based on the provided parameters
    let filteredMovies = movies.filter(movie => {
      return (
        movie.theaters.some(theater => theater.city === city) &&
        (!q || movie.title.toLowerCase().includes(q.toLowerCase())) &&
        (!lang || movie.language.split(',').includes(lang)) &&
        (!format || movie.format === format) &&
        (!genre || movie.genre === genre)
      );
    });
  
    res.json(filteredMovies);
  });

  app.get('/movies/:city/:id', (req, res) => {
    const { city, id } = req.params;
  
    // Find the movie based on city and ID
    const foundMovie = movies.find(movie => movie.id.toString() === id && movie.theaters.some(theater => theater.city === city));
  
    if (foundMovie) {
      res.json(foundMovie);
    } else {
      res.status(404).json({ error: 'Movie not found' });
    }
  });
  // ... (your existing code)

  app.get('/movie/:id', (req, res) => {
    const { id } = req.params;
  
    // Find the movie based on ID across all cities
    const foundMovie = movies.find(movie => movie.id == id);
    // console.log(movies)
    if (foundMovie) {
      res.json(foundMovie);
    } else {
      res.status(404).json({ error: 'Movie not found' });
    }
  });
  
// ... (rest of your code)


  app.get('/app/seats', (req, res) => {
    // You can implement logic to retrieve information about available seats
    // For now, let's assume you want to get the list of available seats for all movies
  
    const availableSeats = movies.map(movie => {
      return {
        title: movie.title,
        theaters: movie.theaters.map(theater => {
          return {
            name: theater.name,
            availableSeats: Object.values(theater.seats).flat(),
          };
        }),
      };
    });
  
    res.json(availableSeats);
  });
  

  // ... (your existing code)

let mydata = [];  // Initialize an array to store data

app.post('/seat',async (req, res) => {
  const { title, movieHall, tickets, amount, time, date } = req.body;

  const selectedMovie = movies.find(movie => movie.title === title);

  if (!selectedMovie) {
    return res.status(404).json({ error: 'Movie not found' });
  }

  selectedMovie.theaters.forEach(theater => {
    if (theater.name === movieHall) {
      tickets.forEach(ticket => {
        if (theater.seats[time] && theater.seats[time].includes(ticket)) {
          theater.seats[time] = theater.seats[time].filter(seat => seat !== ticket);
        }
      });
    }
  });

  // Create an object with relevant data
  const bookingData = {
    title,
    movieHall,
    tickets,
    amount,
    time,
    date,
  };

  // Push the data into the mydata array
   try{
    const existingData = await fs.readFile('./ndb16Data.json', 'utf-8');
    const jsonData = JSON.parse(existingData);
    jsonData.mydataa.push(bookingData)
    await fs.writeFile('./ndb16Data.json', JSON.stringify(jsonData, null, 2));
    console.log('Data written to file successfully');
   }catch(error){

console.error('Error reading/writing data to file:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
   }

  // In a real-world scenario, you might want to persist these changes to a database

  res.json({ confirmation: 'Seats booked successfully', amount, time, date });
});


app.get('/bills', (req, res) => {
  try {
    res.send(mydataa);
  } catch (error) {
    res.status(401).send(error);
  }
});

// ... (rest of your code)

  // ... (your existing code)

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Find the user based on the provided email
  const user = users.find(user => user.email == email);

  // Check if the user exists and the password matches
  if (user && user.password === password) {
    res.json({ success: true, message: 'Login successful' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid email or password' });
  }
});

// ... (rest of your code)

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });