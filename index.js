import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = 3000;
const apiKey = process.env.API_KEY;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Home route
app.get("/", (req, res) => {
    res.render("index.ejs", { weather: null, error: null });
});

// Weather route
app.post("/weather", async (req, res) => {
   const city = req.body.city; // Get city from form input
   try {
       // Fetch current weather
       const currentWeatherResponse = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
       
       // Fetch forecast weather
       const forecastResponse = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`);
       
       const currentWeather = currentWeatherResponse.data;
       const weatherForecast = forecastResponse.data;

       // Format the current weather data
       const current = {
           city: currentWeather.name,
           temperature: currentWeather.main.temp,
           feels_like: currentWeather.main.feels_like,  // Add feels-like temperature
           description: currentWeather.weather[0].description,
           humidity: currentWeather.main.humidity,        // Add humidity
           windSpeed: currentWeather.wind.speed            // Add wind speed
       };

       // Format the forecast data
       const weatherList = weatherForecast.list.map(item => ({
           date: item.dt_txt,
           temperature: item.main.temp,
           description: item.weather[0].description,
           humidity: item.main.humidity,
           windSpeed: item.wind.speed,
       }));

       res.render("index.ejs", {
           currentWeather: current,
           forecast: {
               city: weatherForecast.city.name,
               items: weatherList,
           },
           error: null,
       });
   } catch (error) {
       console.log(error);
       res.render("index.ejs", {
           currentWeather: null,
           forecast: null,
           error: "Could not retrieve weather data. Please try again."
       });
   }
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});