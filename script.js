

let form = document.getElementById("searchForm");
form.addEventListener('submit', (event) => {
    event.preventDefault();
    const local = form.location.value;
    getWeatherInfo(local);
});

async function getWeatherInfo(local){
    const result = await fetch('https://api.openweathermap.org/data/2.5/weather?q='+local+'&APPID=383e8112eda58276db8733d5867dda8f',{
        mode: 'cors'
    });
    let errorSpan = document.getElementById("error");
    if (result.status === 404) {       
        errorSpan.style.visibility = "visible";
    } else {
        const data = await result.json();
        // get geomapping data for weekly forcast
        let geoData = await fetch('https://api.openweathermap.org/geo/1.0/direct?q='+local+'&limit=5&appid=383e8112eda58276db8733d5867dda8f',{
            mode: 'cors'
        });
        geoData = await geoData.json();
        const lat = geoData[0].lat;
        const lon = geoData[0].lon;
        // get weekly data
        let weeklyData = await fetch('https://api.openweathermap.org/data/2.5/forecast/?lat='+lat+'&lon='+lon+'&appid=383e8112eda58276db8733d5867dda8f',{
            mode: 'cors'
        });
        weeklyData = await weeklyData.json();

        
        processDailyData(data);
        processWeeklyData(weeklyData);
        processHourlyData(weeklyData);
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
        day: dayOfTheWeek,
        time: data.dt
    };
    return weatherData;

}

function processWeeklyData(weeklyData){
    // For loop to create data for the next 4 days
    for(let i=1; i<=4; i++){
        const day = new Date();
        day.setDate(day.getDate()+i);
        day.setHours(13,00,00);
        const dayData = weeklyData.list.find(x=>x.dt = Math.floor(day/1000));
        const dayWeather = createWeatherObject(dayData,day);
        const dayDiv = document.getElementById(`day${i}`);
        const dayTempDiv = dayDiv.querySelector(".temperatureDaily");
        dayTempDiv.innerHTML = dayWeather.temperature+'&deg;C';
        const dayIconDiv = dayDiv.querySelector(".iconDaily");
        dayIconDiv.src = `https://openweathermap.org/img/wn/${dayWeather.icon}@2x.png`;
        const dayWeatherDiv = dayDiv.querySelector(".weatherDaily");
        dayWeatherDiv.textContent = dayWeather.weather;
        const dayDayDiv = dayDiv.querySelector(".dayOfTheWeek");
        dayDayDiv.textContent = dayWeather.day;
    }

}

function processHourlyData(weeklyData){
    let hourlyTableDiv = document.getElementById("hourlyTable");
    // may need to reset *************************************
    let hourlyData = document.getElementById("hourlyData");
    if(hourlyData==null || hourlyData==""){
        hourlyData = document.createElement("div");
        hourlyData.id = "hourlyData";
    }else{
        hourlyData.innerHTML = "";
    }
    
    // loop for 10 hours
    let i=0;
    for (const data of weeklyData.list) {
        if(i<10){
             // Create DOM objects for each hour
            let weatherObject = createWeatherObject(data, new Date());
            let hourlyTimeData = document.createElement("div");
            hourlyTimeData.classList.add("hourlyTimeData");
            hourlyTimeData.classList.add("center");
            hourlyTimeData.classList.add("align-center");
            let time = weatherObject.time;
            var date = new Date(0);
            date.setSeconds(time);
            var timeString = date.toISOString().substring(11, 16);
            hourlyTimeData.innerHTML = timeString;

            let hourlyTempData = document.createElement("div");
            hourlyTempData.classList.add("hourlyTempData");
            hourlyTempData.classList.add("center");
            hourlyTempData.classList.add("align-center");
            hourlyTempData.innerHTML = weatherObject.temperature + "&deg;C";

            let hourlyWeatherData = document.createElement("div");
            hourlyWeatherData.classList.add("hourlyWeatherData");
            hourlyWeatherData.classList.add("center");
            hourlyWeatherData.classList.add("align-center");
            let hourlyWeatherTitle = document.createElement("div");
            hourlyWeatherTitle.classList.add("hourlyWeatherTitle");
            hourlyWeatherTitle.innerHTML = weatherObject.weather;
            let hourlyWeatherIcon = document.createElement("img");
            hourlyWeatherIcon.classList.add("hourlyWeatherIcon");
            hourlyWeatherIcon.src = "https://openweathermap.org/img/wn/"+weatherObject.icon+"@2x.png";
            hourlyWeatherData.appendChild(hourlyWeatherTitle);
            hourlyWeatherData.appendChild(hourlyWeatherIcon);


            hourlyData.appendChild(hourlyTimeData);
            hourlyData.appendChild(hourlyTempData);
            hourlyData.appendChild(hourlyWeatherData);
            hourlyTableDiv.appendChild(hourlyData);
        }
        i++;
    }

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
    weatherIcon.src = "https://openweathermap.org/img/wn/"+data.icon+"@2x.png";

    locationDiv.innerHTML = data.location;
    tempDiv.innerHTML = +data.temperature + "&deg;C";
    weatherTextDiv.innerHTML = data.weather;
    feelsLikeDiv.innerHTML = "Feels like: <span class='color1'>" + data.feelsLike + "&deg;C</span>";

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
