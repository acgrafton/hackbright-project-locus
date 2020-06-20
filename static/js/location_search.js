"use strict";

var map, places, infoWindow;
var autocomplete;
var markers = [];
var MARKER_PATH = 'https://developers.google.com/maps/documentation/javascript/images/marker_green';
var hostnameRegexp = new RegExp('^https?://.+?/');


function initMap() {
    
    const map = new google.maps.Map(
        document.getElementById('map'),
        {center: 
            {lat: 39.742043,
             lng: -104.991531},
             zoom: 11
        }
    );

    const infoWindow = new google.maps.InfoWindow({
        content: document.getElementById('info-content')
    });

    const autocomplete = new google.maps.places.Autocomplete(
        document.getElementById('autocomplete'), {
        componentRestrictions: {'country': 'us'}
        });

    const places = new google.maps.places.PlacesService(map);

    autocomplete.addListener('place_changed', onPlaceChanged);

    function onPlaceChanged() {
        let place = autocomplete.getPlace();
        if (place.geometry) {
            map.panTo(place.geometry.location);
            map.setZoom(10);
            
            let fetchData = {
                method: 'POST',
                body: JSON.stringify({'address': place.formatted_address,
                                        'point': place.geometry.location}),
                headers: {
                    'Content-Type': 'application/json'
                },
            };

            console.log(fetchData);

            fetch('/api/score_location', fetchData)
                .then(response => response.json())
                .then(data => {
                    console.log(data)

                    const criteria = data.criteria //list of criteria objects
                    const score = data.score //location's total score based on weighted avg
                    
                    for (const criterion of criteria) {

                        for (const place of criterion['results']) {
                            const infoContent = (`
                                <div class="window-content">
                                  <ul class="place-info">
                                    <li><b>place name: </b>${place.name}</li>
                                    <li><b>your criteria: </b>${criterion.place_type}</li>
                                    <li><b>yelp rating: </b>${place.rating}</li>
                                    <li><b>distance to search location: </b>
                                            ${place.distance}</li>
                                  </ul>
                                </div>
                                `);

                            const marker = new google.maps.Marker({
                                position: {
                                    lat: place.coordinates.latitude,
                                    lng: place.coordinates.longitude
                                },
                                title: `place name: ${place.name}`,
                                map: map
                            });

                            marker.addListener('click', () => {
                                infoWindow.close();
                                infoWindow.setContent(infoContent);
                                infoWindow.open(map, marker)
                            });
                        };
                    };

                    
                })
        } else {
            document.getElementById('autocomplete').placeholder = 'Add Location'
        }
    }

    
}