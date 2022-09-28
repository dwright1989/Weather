

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
        time: date.getTime()
    };
    return weatherData;

}

function processWeeklyData(weeklyData){
    // For loop to create data for the next 4 days
    for(let i=1; i<=4; i++){
        eval('day' + i + "=" + "new Date()" +';');
        eval('day'+i+'.setDate(day'+i+'.getDate() +'+i+');');
        eval('day'+i+'.setHours(13,00,00);');
        eval('day'+i+'Data=weeklyData.list.find(x=>x.dt==Math.floor(day'+i+'/1000));');
        eval('day'+i+'Weather=createWeatherObject(day'+i+'Data, day'+i+');');
        eval('day'+i+'Div=document.getElementById("day'+i+'");');
        eval('day'+i+'TempDiv=day'+i+'Div.querySelector(".temperatureDaily");');
        eval('day'+i+'TempDiv.innerHTML=day'+i+'Weather.temperature+"&deg;C";');
        eval('day'+i+'IconDiv=day'+i+'Div.querySelector(".iconDaily");');
        eval('day'+i+'IconDiv.src="http://openweathermap.org/img/wn/"+day'+i+'Weather.icon+"@2x.png";');
        eval('day'+i+'WeatherDiv=day'+i+'Div.querySelector(".weatherDaily");');
        eval('day'+i+'WeatherDiv.innerHTML=day'+i+'Weather.weather;');
        eval('day'+i+'DayDiv=day'+i+'Div.querySelector(".dayOfTheWeek");');
        eval('day'+i+'DayDiv.innerHTML=day'+i+'Weather.day;');
    }

}

function processHourlyData(weeklyData){
    let hourlyTableDiv = document.getElementById("hourlyTable");
    // may need to reset *************************************
    let hourlyData = document.createElement("div");
    hourlyData.id = "hourlyData";
    
    // loop for 10 hours
    let i=0;
    for (const data of weeklyData.list) {
        console.log(JSON.stringify(data));
        if(i<10){
             // Create DOM objects for each hour
            let weatherObject = createWeatherObject(data, new Date());
            let hourlyTimeData = document.createElement("div");
            hourlyTimeData.classList.add("hourlyTimeData");
            hourlyTimeData.innerHTML = weatherObject.time;

            let hourlyTempData = document.createElement("div");
            hourlyTempData.classList.add("hourlyTempData");
            hourlyTempData.innerHTML = weatherObject.temperature;

            let hourlyWeatherData = document.createElement("div");
            hourlyWeatherData.classList.add("hourlyWeatherData");
            let hourlyWeatherTitle = document.createElement("div");
            hourlyWeatherTitle.classList.add("hourlyWeatherTitle");
            hourlyWeatherTitle.innerHTML = weatherObject.weather;
            let hourlyWeatherIcon = document.createElement("img");
            hourlyWeatherIcon.classList.add("hourlyWeatherIcon");
            hourlyWeatherIcon.src = "http://openweathermap.org/img/wn/"+weatherObject.icon+"@2x.png";
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
