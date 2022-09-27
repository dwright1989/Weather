async function getWeatherInfo(local){
    const result = await fetch('http://api.openweathermap.org/data/2.5/weather?q='+local+'&APPID=383e8112eda58276db8733d5867dda8f',{
        mode: 'cors'
    });
    const data = await result.json();
    processData(data);
    console.log("the data for: " + JSON.stringify(data));
}

getWeatherInfo("Kilmarnock");
getWeatherInfo("London");

function processData(data){
    const kelvinTemp = data.main.temp;
    const kelvinFeelsLike = data.main.feels_like;
    const weatherData = {
        weather : data.weather[0].main,
        temperature : kelvinTemp - 273.15,
        feelsLike : kelvinFeelsLike - 273.15
    };

    console.log(weatherData);
    
}