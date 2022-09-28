

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
        // get geomapping data for weekly forcast
        let geoData = await fetch('http://api.openweathermap.org/geo/1.0/direct?q='+local+'&limit=5&appid=383e8112eda58276db8733d5867dda8f',{
            mode: 'cors'
        });
        geoData = await geoData.json();
        const lat = geoData[0].lat;
        const lon = geoData[0].lon;
        // get weekly data
        let weeklyData = await fetch('http://api.openweathermap.org/data/2.5/forecast/?lat='+lat+'&lon='+lon+'&appid=383e8112eda58276db8733d5867dda8f',{
            mode: 'cors'
        });
        weeklyData = await weeklyData.json();
        processDailyData(data);
        processWeeklyData(weeklyData);
        errorSpan.style.visibility = "hidden";
    }
    
    
}

// default
getWeatherInfo("London");

function processDailyData(data){
    let weatherData = createWeatherObject(data, new Date());
    displayData(weatherData);
}

function createWeatherObject(data, date){
    const day = date.getDay();
    let dayOfTheWeek = "";
    switch(day) {
        case 0:
            dayOfTheWeek = "Sunday";
            break;
        case 1:
            dayOfTheWeek = "Monday";
            break;
        case 2:
            dayOfTheWeek = "Tuesday";
            break;
        case 3:
            dayOfTheWeek = "Wednesday";
            break;
        case 4:
            dayOfTheWeek = "Thursday";
            break;
        case 5:
            dayOfTheWeek = "Friday";
            break;
        case 6:
            dayOfTheWeek = "Saturday";
            break;
    }

    const kelvinTemp = data.main.temp;
    const kelvinFeelsLike = data.main.feels_like;
    const weatherData = {
        location : data.name,
        weather : data.weather[0].main,
        icon: data.weather[0].icon,
        temperature : Math.trunc(kelvinTemp - 273.15),
        feelsLike : Math.trunc(kelvinFeelsLike - 273.15),
        day: dayOfTheWeek
    };
    return weatherData;

}

/*
TODO - TIDY DUPLICATE CODE
*/
function processWeeklyData(weeklyData){
    // Set next five dates (midday time)
    let day1 = new Date();
    day1.setDate(day1.getDate() + 1);
    day1.setHours(13,00,00);
    let day2 = new Date();
    day2.setDate(day2.getDate() + 2);
    day2.setHours(13,00,00);
    let day3 = new Date();
    day3.setDate(day3.getDate() + 3);
    day3.setHours(13,00,00);
    let day4 = new Date();
    day4.setDate(day4.getDate() + 4);
    day4.setHours(13,00,00);
    let day5 = new Date();
    day5.setDate(day5.getDate() + 1);
    day5.setHours(13,00,00);
    // for each date get the data
    let day1Data = weeklyData.list.find(x => x.dt==Math.floor(day1/1000));
    let day2Data = weeklyData.list.find(x => x.dt==Math.floor(day2/1000));
    let day3Data = weeklyData.list.find(x => x.dt==Math.floor(day3/1000));
    let day4Data = weeklyData.list.find(x => x.dt==Math.floor(day4/1000));
    let day5Data = weeklyData.list.find(x => x.dt==Math.floor(day5/1000));

    let day1Div = document.getElementById("day1");
    let day2Div = document.getElementById("day2");
    let day3Div = document.getElementById("day3");
    let day4Div = document.getElementById("day4");
    let day5Div = document.getElementById("day5");

    let day1TempDiv = day1Div.querySelector('.temperatureDaily');
    let day2TempDiv = day2Div.querySelector('.temperatureDaily');
    let day3TempDiv = day3Div.querySelector('.temperatureDaily');
    let day4TempDiv = day4Div.querySelector('.temperatureDaily');
    let day5TempDiv = day5Div.querySelector('.temperatureDaily');

    let day1Weather = createWeatherObject(day1Data, day1);
    let day2Weather = createWeatherObject(day2Data, day2);
    let day3Weather = createWeatherObject(day3Data, day3);
    let day4Weather = createWeatherObject(day4Data, day4);
    let day5Weather = createWeatherObject(day5Data, day5);

    day1TempDiv.innerHTML = day1Weather.temperature + "&deg;C";
    day2TempDiv.innerHTML = day2Weather.temperature + "&deg;C";
    day3TempDiv.innerHTML = day3Weather.temperature + "&deg;C";
    day4TempDiv.innerHTML = day4Weather.temperature + "&deg;C";
    day5TempDiv.innerHTML = day5Weather.temperature + "&deg;C";

    let day1DayDiv = day1Div.querySelector('.dayOfTheWeek');
    let day2DayDiv = day2Div.querySelector('.dayOfTheWeek');
    let day3DayDiv = day3Div.querySelector('.dayOfTheWeek');
    let day4DayDiv = day4Div.querySelector('.dayOfTheWeek');
    let day5DayDiv = day5Div.querySelector('.dayOfTheWeek');

    day1DayDiv.innerHTML = day1Weather.day;
    day2DayDiv.innerHTML = day2Weather.day;
    day3DayDiv.innerHTML = day3Weather.day;
    day4DayDiv.innerHTML = day4Weather.day;
    day5DayDiv.innerHTML = day5Weather.day;



}

function getDateFromSeconds(seconds) {
    var time = new Date(1970, 0, 1);
    time.setSeconds(seconds);
    return time;
}

function displayData(data){
    let locationDiv = document.getElementById("location");
    let tempDiv = document.getElementById("temperature");
    let weatherTextDiv = document.getElementById("weatherText");
    let feelsLikeDiv = document.getElementById("feelsLike");

    let weatherIcon = document.getElementById("weatherIcon");
    weatherIcon.src = "http://openweathermap.org/img/wn/"+data.icon+"@2x.png";

    locationDiv.innerHTML = data.location;
    tempDiv.innerHTML = data.temperature + "&deg;C";
    weatherTextDiv.innerHTML = data.weather;
    feelsLikeDiv.innerHTML = "Feels like: " + data.feelsLike + "&deg;C";

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
