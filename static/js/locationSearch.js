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
             zoom: 12
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

    const scoreBtn = document.querySelector('button#btn-score');
    scoreBtn.onclick = getScore;

    function onPlaceChanged() {

        let place = autocomplete.getPlace();
        if (place.geometry) {
            map.panTo(place.geometry.location);
            map.setZoom(12);
            
        } else {
            document.getElementById('autocomplete').placeholder = 'Add Location'
        }
    }

function getScore() {

    clearMarkers();
    clearResults();

    let place = autocomplete.getPlace();

    let fetchData = {
        method: 'POST',
        body: JSON.stringify({'address': place.formatted_address,
                                'point': place.geometry.location}),
        headers: {
            'Content-Type': 'application/json'
        },
    };

    fetch('/api/score_location', fetchData)
        .then(response => response.json())
        .then(data => {
            console.log(data);

            const criteria = data.criteria; //list of criteria objects
            const score = data.score; //location's total score based on weighted avg
            
            for (const criterion of criteria) {

                const resultsSection = document.querySelector('section#results');

                const critDiv = createCritDiv(criterion);
                resultsSection.appendChild(critDiv);

                let count = 0;

                if (criterion.gresults) {
                    for (const place of criterion.gresults) {

                        const infoContent = (`
                            <div class="window-content">
                              <ul class="place-info">
                                <li><b>place name: </b>${place.name}</li>
                                <li><b>your criteria: </b>${criterion.criterion}</li>
                                <li><b>google rating: </b>${place.rating}</li>
                              </ul>
                            </div>
                            `);

                        const marker = new google.maps.Marker({
                            position: {
                                lat: place.geometry.location.lat,
                                lng: place.geometry.location.lng
                            },
                            title: `place name: ${place.name}`,
                            map: map
                        });
                        if (count < 5) {
                            createPlaceSpans(critDiv, place);
                        }
                        count += 1;
                    }
                } else {
                    for (const place of criterion.yresults) {

                        const infoContent = (`
                            <div class="window-content">
                              <ul class="place-info">
                                <li><b>place name: </b>${place.name}</li>
                                <li><b>your criteria: </b>${criterion.criterion}</li>
                                <li><b>yelp rating: </b>${place.rating}</li>
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
                            infoWindow.open(map, marker);
                        });
                        console.log(count);

                        if (count < 5) {
                            createPlaceSpans(critDiv, place);
                        }
                        count += 1;
                    }
                }
            }

        });
    }
}

const createCritDiv = (criterion) => {

    let scoreHTML = '';
    if (criterion.eval_points) {
        let i = 0;
        let max = criterion.eval_points;
        while (i < 5) {
            if (i < criterion.eval_points) {
                scoreHTML += '&#x2726;';
            } else {
                scoreHTML += '&#x2727;';
            }
            i += 1;
        }
    }

    const div = document.createElement('div');
    div.setAttribute('class', 'criterion');
    div.innerHTML = `Criteria ${criterion.criterion}` + " " + scoreHTML ;

    return div;
};

const createPlaceSpans = (criteriaElement, place) => {
    const spanName = document.createElement('p');
    spanName.setAttribute('class', 'criterion');
    spanName.innerHTML = `Name: ${place.name} Rating: ${place.rating}`;
    criteriaElement.appendChild(spanName);
};

function clearMarkers() {
    for (var i = 0; i < markers.length; i++) {
      if (markers[i]) {
        markers[i].setMap(null);
      }
    }
    markers = [];
}

function clearResults() {
    var results = document.getElementById('results');
    while (results.childNodes[0]) {
      results.removeChild(results.childNodes[0]);
    }
}      


(function runLocationSearch() {

    const navform = document.getElementById('nav-form');

    const backBtn = document.createElement('button');
    backBtn.setAttribute('type', 'button');
    backBtn.setAttribute('class', 'btn btn-outline-info btn-sm');
    backBtn.innerHTML = 'back'
    backBtn.onclick = backToProfile;
    navform.appendChild(backBtn);

    
    const logOutBtn = createLogOutBtn()
    navform.appendChild(logOutBtn)
    logOutBtn.onclick = logOut;
    
})();

// '&#x25d9'






