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
            map.setZoom(15);
            
            let fetchData = {
                method: 'POST',
                body: JSON.stringify({'address': place.formatted_address,
                                        'point': place.geometry.location}),
                headers: {
                    'Content-Type': 'application/json'
                },
            };

            console.log(fetchData);

            fetch('/api/criteria', fetchData)
                .then(response => response.json())
                .then(data => {
                    console.log(data)

                    const criteria = data.criteria
                    const score = data.score //location's total score based on weighted avg
                    
                     //list of criteria objects

                    for (const criterion of criteria) {

                        for (const place of criterion['results']) {
                            const infoContent = (`
                                <div class="window-content">
                                  <ul class="place-info">
                                    <li><b>Name: </b>${place.name}</li>
                                    <li><b>Met Criteria: </b>${criterion.place_type}</li>
                                    <li><b>Yelp Rating: </b>${place.rating}</li>
                                    <li><b>Distance: </b>${place.distance}</li>
                                  </ul>
                                </div>
                                `);

                            const marker = new google.maps.Marker({
                                position: {
                                    lat: place.coordinates.latitude,
                                    lng: place.coordinates.longitude
                                },
                                title: `Place Name: ${place.name}`,
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