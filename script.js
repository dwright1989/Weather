

let form = document.getElementById("searchForm");
form.addEventListener('submit', (event) => {
    event.preventDefault();
    const local = form.location.value;
    getWeatherInfo(local);
});

async function getWeatherInfo(local){
    const result = await fetch('http://api.openweathermap.org/data/2.5/weather?q='+local+'&APPID=383e8112eda58276db8733d5867dda8f',{
        mode: 'cors'
    });
    let errorSpan = document.getElementById("error");
    if (result.status === 404) {       
        errorSpan.style.visibility = "visible";
    } else {
        const data = await result.json();
        processData(data);
        errorSpan.style.visibility = "hidden";
    }
    
}

// default
getWeatherInfo("London");

function processData(data){
    const kelvinTemp = data.main.temp;
    const kelvinFeelsLike = data.main.feels_like;
    const weatherData = {
        location : data.name,
        weather : data.weather[0].main,
        icon: data.weather[0].icon,
        temperature : kelvinTemp - 273.15,
        feelsLike : kelvinFeelsLike - 273.15
    };

    displayData(weatherData);
    
}

function displayData(data){
    let locationDiv = document.getElementById("location");
    let tempDiv = document.getElementById("temperature");
    let weatherTextDiv = document.getElementById("weatherText");
    let feelsLikeDiv = document.getElementById("feelsLike");

    let weatherIcon = document.getElementById("weatherIcon");
    weatherIcon.src = "http://openweathermap.org/img/wn/"+data.icon+"@2x.png";

    locationDiv.innerHTML = data.location;
    tempDiv.innerHTML = Math.trunc(data.temperature) + "&deg;C";
    weatherTextDiv.innerHTML = data.weather;
    feelsLikeDiv.innerHTML = "Feels like: " + Math.trunc(data.feelsLike) + "&deg;C";

    setBackground(data.weather);

}

function setBackground(weather){
    let backgroundURL = "clear-sky.jpg";
    switch(weather) {
        case "Clear":
            backgroundURL = "clear-sky.jpg";
            break;
        case "Clouds":
            backgroundURL = "clouds.jpg";
            break;
        case "Drizzle":
        case "Rain":
            backgroundURL = "rain.jpg";
            break;
        case "Snow":
            backgroundURL = "snow.jpg";
            break;
        case "Thunderstorm":
            backgroundURL = "thunder.jpg";
            break;
      }

    let content = document.getElementById("content");
    backgroundURL = "images/"+backgroundURL;
    content.style.backgroundImage = "url("+backgroundURL+")";
}
