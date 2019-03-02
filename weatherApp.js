const http = require('http');
const fs = require('fs');
const fetch = require('node-fetch');
const server = http.createServer((req, res) => {
    const url = req.url;
    const method = req.method;

    if (url === '/') {

        res.setHeader('Content-Type', 'text/html');
        res.write(`
	    <!DOCTYPE html>
        <html>
        <title>HTML Tutorial</title>
        <body>

        <form action="/weather" method="POST">
        city you want to check weather for:<br>
        <input type="text" name="q"><br>
        <input type="submit" value="check">
        </form>

        </body>
        </html>

`)
        return res.end();

    }

    if (url === '/weather' && method === 'POST') {
        const body = [];
        req.on('data', (chunk) => {
            body.push(chunk)
        })
        req.on('end', () => {
            const parsedBody = Buffer.concat(body).toString();

            const parsed = parsedBody.slice(2);
            const data = encodeURIComponent(parsed);
            const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${data}&key=API_KEY`;

            const getData = async (url) => {
                try {
                    const locData = await fetch(url);
                    const locJson = await locData.json();
                    const wObj = await {
                        name: locJson.results[0].name,
                        lat: locJson.results[0].geometry.location.lat,
                        lng: locJson.results[0].geometry.location.lng,
                    };
                    const wData = await fetch(`https://api.openweathermap.org/data/2.5/weather?units=metric&lat=${wObj.lat}&lon=${wObj.lng}&appid=API_KEY`);
                    const wJson = await wData.json();
                    const weatherData = await {
                        city: wJson.name,
                        icon: wJson.weather[0].icon,
                        weather: wJson.weather[0].main,
                        temp: wJson.main.temp,
                        pressure: wJson.main.pressure,
                        humidity: wJson.main.humidity,
                        temp_min: wJson.main.temp_min,
                        temp_max: wJson.main.temp_max,
                        wind: wJson.wind.speed,
                    }

                    return weatherData;



                } catch (e) {
                    console.log(e);
                }

            }

            const showWeather = async () => {
                const data = await getData(url);
                console.log(data);
                res.setHeader('Content-Type', 'text/html');
                res.write(`
	            <!DOCTYPE html>
                <html>
                <head>
                <meta charset="UTF-8">
                <title>weather report</title>
                </head> 
                <body>
                <div>
                <h4>weather report for ${parsed}</h4>
                <ul>
                <li>weather is: ${data.weather}</li>
                <img src="http://openweathermap.org/img/w/${data.icon}.png">
                <li>temp: ${data.temp} &deg;C</li>
                <li>pressure: ${data.pressure}</li>
                <li>humidity:: ${data.humidity} %</li>
                <li>max temp: ${data.temp_max} &deg;C</li>
                <li>min temp: ${data.temp_min} &deg;C</li>
                <li>wind: ${data.wind} km/h</li>
                </ul>
                </div>

                </body>
                </html>

                `)
                return res.end();
            }
            showWeather();

        })

    }


})

server.listen(3000);