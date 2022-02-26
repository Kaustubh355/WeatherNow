const weather_key = "f8767f3d11c4ddf7857e63bf83b7ef59";
const img_key = "n8Tybug1E3ZKzADrGtOPGtvu8SBwFXkoO6gOm-9LKSY";
const timezone_key = "C3MD833USRNK";
const kelvin = 273.15;

mapboxgl.accessToken = 'pk.eyJ1IjoiYmxhY2sta2l0ZSIsImEiOiJja3p1MHpvNHIxNnNiMndwa2VqNnYwc2t0In0.EwbkcBbi8aBtJYBw7JsUEA';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    zoom: 1.2,
    center: [11.255, 43.77]
});

const marker = new mapboxgl.Marker(
    { color: 'rgb(230,0,0)', draggable: true}
);

var geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
    marker:false
})
map.addControl(geocoder);
map.addControl(new mapboxgl.FullscreenControl());
map.addControl(new mapboxgl.NavigationControl());

let content = ` `
const popup = new mapboxgl.Popup({ offset: 15 });

map.on('load', () => {navigator.geolocation.getCurrentPosition(getposition, error);
})
function getposition(pos) {
    marker.setLngLat([pos.coords.longitude, pos.coords.latitude]).addTo(map)
    getweather(pos.coords.latitude,pos.coords.longitude)
}
function error(er) {
    console.log(er.code + " " + er.message)
}

geocoder.on('result', function(pos) {
    content=``
    map.flyTo({
        center: [pos.result.center[0],pos.result.center[1]],
        speed:0.1,
        essential: true
        });
    marker.setLngLat([pos.result.center[0],pos.result.center[1]])
    coordinates.style.display = 'block';
    coordinates.innerHTML = `Longitude: ${pos.result.center[0]}<br />Latitude: ${pos.result.center[1]}`;
    getweather(pos.result.center[1],pos.result.center[0])
})

function onDragEnd() {
    const lngLat = marker.getLngLat();
    coordinates.style.display = 'block';
    coordinates.innerHTML = `Longitude: ${lngLat.lng}<br />Latitude: ${lngLat.lat}`;
    getweather(lngLat.lat, lngLat.lng)

}
marker.on('dragend', onDragEnd);

function getContent(weatherData, lat, lng) {
    fetch(`http://api.timezonedb.com/v2.1/get-time-zone?key=${timezone_key}&format=json&by=position&lat=${lat}&lng=${lng}`).then(response => response.json()).then
        (timedata => {
            var country=timedata.countryName
            if(country=="United Kingdom of Great Britain and Northern Ireland")
                        country="United States Of America"
            else if(country=="Russian Federation")
                country="Russia"
            fetch(`https://api.unsplash.com/search/photos?query=${country}&client_id=${img_key}`).then(
                response => response.json()).then(imgdata => {
                    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]
                    const day = ["SUN", "MON", "TUE", "WED", "THUR", "FRI", "SAT"]
                    let d = new Date();
                    let time = d.toLocaleTimeString("en-US", { timeZone: `${timedata['zoneName']}` });
                    let date = new Date(d.toLocaleDateString("en-US", { timeZone: `${timedata['zoneName']}` }));
                    
                    date = day[date.getDay()] + ", " + date.getDate() + " " + months[date.getMonth()] + " " + date.getFullYear();
                    let size=Math.floor(Math.random()*imgdata.results.length)
                    content += `<img src="${imgdata.results[size]["urls"]["full"]}" style="width:100%; height:140px; border-top-left-radius: 5px; border-top-right-radius: 5px; margin: 0;">`;
                    content += ` <div style="margin-top: 5px; float:left;  width:227px; ">
                                <div  style=" float: left; width:190px;  ">
                                <span  style="font-size: 15px; padding-bottom:1px; display: inline-block;">${weatherData.name}</span>
                                <br>
                                <span style="font-size: 12px;">${timedata.countryName}</span>
                                    </div><div style="float: right;">
                                    <span style="border-bottom: 1px solid ; font-size: 13px; padding-right:2px; display:inline-block;">${Math.floor(weatherData.main.temp_max - kelvin)}°C</span>
                                    <br>
                                    <span style="font-size: 13px; padding-right:2px; ">${Math.floor(weatherData.main.temp_min - kelvin)}°C</span>
                              </div></div>`
                    content += `
                               <div style="  float: left;   margin-top: 10px; width:227px; margin-bottom:10px;">
                                <img src="http://openweathermap.org/img/w/${weatherData.weather[0].icon}.png" style="width: 45px; height:45px; float: left; margin-top: 3px;">
                                <span  style="font-size:14px; ">${weatherData.weather[0].description} •</span>
                                <span  style="font-size: 16px; "> ${Math.floor(weatherData.main.temp - kelvin)}°C</span>
                                <br>
                                <span  style="font-size: 12px;font-family:Arial, sans-serif;">${time + "-" + date}</span>
                                    </div>`
                     content += `<div style=" display: flex; align-items:center; justify-content:space-evenly; width:227px;font-family: 'Times New Roman', Times;">
                      <img src="icons/wind.png"style=" width:16px; height:16px; ">
                       <span style="font-size: 16px;margin-right:3px; ">${weatherData.wind.speed} m/s</span>
                       <img src="icons/compass.png"style=" width:16px; height:16px; ">
                        <span style="font-size: 16px; margin-right:3px;">${weatherData.wind.deg}°</span>
                            <img src="icons/humidity.png" style=" width: 16px; height:16px; ">
                            <span style="font-size: 16px; margin-right:3px;">${weatherData.main.humidity}</span>
                           </div>`

                    popup.setHTML(content)
                    content = ``
                }).catch((error)=>{
                    console.log("Error: "+error)
              })
        }).catch((error)=>{
            console.log("Error: "+error)
      })
}

function getweather(lat, lng) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${weather_key}`).then(response => response.json()).then
        (weatherdata => {
            getContent(weatherdata, lat, lng)
        }).catch((error)=>{
              console.log("Error: "+error)
        })

}



marker.setPopup(popup);