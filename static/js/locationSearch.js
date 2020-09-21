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
    clearLocusScore();
    let place = autocomplete.getPlace();
    var searchedIcon = {
        url: "/static/images/home-run.svg",
        scaledSize: new google.maps.Size(30, 30), // scaled size
        origin: new google.maps.Point(0,0), // origin
        anchor: new google.maps.Point(0, 0) // anchor
    }
    const searchedMarker = new google.maps.Marker({
        position: place.geometry.location,
        title: `place name: ${place.name}`,
        map: map,
        icon: searchedIcon
    });
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

            let locationField = document.getElementById('locationField')
            locationField.appendChild(addLocusScoreCard(score))
            
            for (const criterion of criteria) {
                console.log(criterion.top_five)

                var icon = {
                    url: "/static/images/travel.svg",
                    scaledSize: new google.maps.Size(30, 30), // scaled size
                    origin: new google.maps.Point(0,0), // origin
                    anchor: new google.maps.Point(0, 0) // anchor
                }

                // const resultsSection = document.querySelector('section#results');

                // const critDiv = createCritDiv(criterion);
                // resultsSection.appendChild(critDiv);

                for (const place of criterion.top_five) {
                    // const infoContent = (`
                    //     <div class="window-content">
                    //         <ul class="place-info">
                    //         <li><b>place name: </b>${place.name}</li>
                    //         <li><b>your criteria: </b>${criterion.criterion}</li>
                    //         <li><b>google rating: </b>${place.rating}</li>
                    //         </ul>
                    //     </div>
                    //     `);

                    const marker = new google.maps.Marker({
                        position: {
                            lat: place.latitude,
                            lng: place.longitude
                        },
                        title: `place name: ${place.name}`,
                        map: map,
                        icon: icon
                    });
                    // if (count < 5) {
                    //     createPlaceSpans(critDiv, place);
                    // }
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

function addLocusScoreCard(score) {
    let card  = document.createElement('div');
    card.setAttribute('class', 'card');
    card.setAttribute('id', 'locus-score-card');
    const body = document.createElement('div');
    body.setAttribute('class', 'card-body');
    body.setAttribute('id', 'locus-score');
    body.innerHTML = `locus score: ${score}`;
    card.appendChild(body);
    return card
}

function clearLocusScore() {
    let locationField = document.getElementById('locationField')
    let card = document.getElementById('locus-score-card')
    if (card) {
        locationField.removeChild(card)
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






