$preSearches = $(`#prev-searches`);
$forecast = $("#earthforecast");

//empty array for city search history
var savedCities = [];
var currentCity;

//get saved citied from the local storage, if not set the current city to Kathmandu
function getReady() {
    savedCities = JSON.parse(localStorage.getItem(`weathercities`));
    if (savedCities) {
        currentCity = savedCities[savedCities.length - 1];
        showPrevious();
        getCurrent(currentCity);
    }
    else {
        if (!navigator.geolocation) {
            getCurrent(`Kathmandu`);
        }
        //ask for the location ttrack if nothing works
        else {
            navigator.geolocation.getCurrentPosition(success, error);
        }
    }
}


function success(position) {
    var lat = position.coords.latitude;
    var lon = position.coords.longitude;
    var queryURL = `https://api.openweathermap.org/data/2.5/weather?lat= ${lat} + &lon=  ${lon} + &APPID=7e4c7478cc7ee1e11440bf55a8358ec3`;
    $.ajax({
        url: queryURL,
        method: `GET`
    }).then(function (response) {
        currentCity = response.name;
        saveLoc(response.name);
        getCurrent(currentCity);
    });

}
//set location to kathmandu
function error(){
    currentCity = `Kathmandu`
    getCurrent(currentCity);
}

//show previous saved location in  a clickable button
function showPrevious() {
    if (savedCities) {
        $preSearches.empty();
        var cityBtn = $("<div>").attr("class", "list-group");
        for (var i = 0; i < savedCities.length; i++) {
            var locBtn = $("<a>").attr("href", "#").attr("id", "loc-btn").text(savedCities[i]);
            if (savedCities[i] == currentCity){
                locBtn.attr("class", "list-group-item list-group-item-action active");
            }
            else {
                locBtn.attr("class", "list-group-item list-group-item-action");
            }
            cityBtn.prepend(locBtn);
        }
        $preSearches.append(cityBtn);
    }
}

//get weather data of the city passed in the function
function getCurrent(city) {
    var queryURL = `https://api.openweathermap.org/data/2.5/weather?q= ${city} + &APPID=7e4c7478cc7ee1e11440bf55a8358ec3&units=imperial`;
    $.ajax({
        url: queryURL,
        method: `GET`,
        error: function (){
            savedCities.splice(savedCities.indexOf(city), 1);
            localStorage.setItem("weathercities", JSON.stringify(savedCities));
            getReady();
        }
    }).then(function (response) {
        console.log(response);

        //append weather informations into the forecast card
        var currCard = $("<div>").attr("class", "card bg-light");
        $forecast.append(currCard);

        var currCardHead = $("<div>").attr("class", "card-header").text("Current weather for " + response.name);
        currCard.append(currCardHead);

        var cardRow = $("<div>").attr("class", "row no-gutters");
        currCard.append(cardRow);
        //get the weather icon image and display into the card
        var iconURL = "https://openweathermap.org/img/wn/" + response.weather[0].icon + "@2x.png";

        var imgDiv = $("<div>").attr("class", "col-md-3").append($("<img>").attr("src", iconURL).attr("class", "card-img"));
        cardRow.append(imgDiv);

        var textDiv = $("<div>").attr("class", "col-md-8");
        var cardBody = $("<div>").attr("class", "card-body");
        textDiv.append(cardBody);
        cardBody.append($("<h3>").attr("class", "card-title").text( response.name));
        var currdate = moment(response.dt, "X").format("dddd, MMMM Do YYYY, h:mm a");
        cardBody.append($("<p>").attr("class", "card-text").append($("<small>").attr("class", "text-muted").text("Last updated: " + currdate)));
        cardBody.append($("<p>").attr("class", "card-text").html("Temperature: " + response.main.temp + " &#8457;"));
        var sunrise = moment(response.sys.sunrise, "X").format(" h:mm a");
        cardBody.append($("<p>").attr("class", "card-text").text("Sunrise:" + sunrise));
        var sunset = moment(response.sys.sunset, "X").format(" h:mm a");
        cardBody.append($("<p>").attr("class", "card-text").text("Sunset:" + sunset));
        cardBody.append($("<p>").attr("class", "card-text").text("Humidity: " + response.main.humidity + "%"));
        cardBody.append($("<p>").attr("class", "card-text").text("Wind Speed: " + response.wind.speed + " MPH"));
        //make another API call to get the UV data in the nested form
        var uvURL = "https://api.openweathermap.org/data/2.5/uvi?appid=7e4c7478cc7ee1e11440bf55a8358ec3&lat=" + response.coord.lat + "&lon=" + response.coord.lat;
        $.ajax({
            url: uvURL,
            method: "GET"
        }).then(function (uvresponse) {
            var uvindex = uvresponse.value;
            cardBody.append($("<p>").attr("class", "card-text").text("UV Index: " + uvindex));

        });
        cardRow.append(textDiv);
        getForecast(response.id);
    });
}
//API call to get 5 days forecast
function getForecast(city) {
    var queryURL = "https://api.openweathermap.org/data/2.5/forecast?id=" + city + "&APPID=7e4c7478cc7ee1e11440bf55a8358ec3&units=imperial";
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        console.log(response);
        var newrow = $("<div>").attr("class", "forecast");
        $forecast.append(newrow);
        //append weather info into the card
        for (var i = 0; i < response.list.length; i++) {
            if (response.list[i].dt_txt.indexOf("15:00:00") !== -1) {
                var newCol = $("<div>").attr("class", "one-fifth");
                newrow.append(newCol);

                var newCard = $("<div>").attr("class", "card text-white bg-primary");
                newCol.append(newCard);

                var cardHead = $("<div>").attr("class", "card-header").text(moment(response.list[i].dt, "X").format("MMM Do"));
                newCard.append(cardHead);

                var cardImg = $("<img>").attr("class", "card-img-top").attr("src", "https://openweathermap.org/img/wn/" + response.list[i].weather[0].icon + "@2x.png");
                newCard.append(cardImg);

                var bodyDiv = $("<div>").attr("class", "card-body");
                newCard.append(bodyDiv);

                bodyDiv.append($("<p>").attr("class", "card-text").html("Temp: " + response.list[i].main.temp + " &#8457;"));
                bodyDiv.append($("<p>").attr("class", "card-text").text("Humidity: " + response.list[i].main.humidity + "%"));
            }
        }
    });
}

//function to save search cities into the local storage
function saveLoc(loc){
    if (savedCities === null) {
        savedCities = [loc];
    }
    else if (savedCities.indexOf(loc) === -1) {
        savedCities.push(loc);
    }
    localStorage.setItem("weathercities", JSON.stringify(savedCities));
    showPrevious();
}

function clear() {
    $forecast.empty();
}

//start a event with the click of a search button
$("#searchbtn").on("click", function () {
    event.preventDefault();
    var loc = $("#searchinput").val().trim();
    console.log(loc);
    if (loc !== "") {
        clear();
        currentCity = loc;
        saveLoc(loc);
        $("#searchinput").val("");
        getCurrent(loc);
    }
});

$(document).on("click", "#loc-btn", function () {
    clear();
    currentCity = $(this).text();
    showPrevious();
    getCurrent(currentCity);
});

getReady();