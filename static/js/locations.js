//crud script for adding or removing locations

//Display scored locations on profile page

const removeLocation = (clickedBtn) => {
    
    const scoreId = Number(clickedBtn.id.slice(7));

    const data = {'scoreId': scoreId};

    let fetchData = {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        },
    };

    fetch('/api/remove_location', fetchData)
        .then(response => response.json())
        .then(data => {
            if (data['success']) {
                document.location.reload(true);
            } else {
                alert(data['error'])
            }
            
        });
};


const displayLocations = () => {

    //Make ajax call to get scored location info
    fetch('/api/scored_locations')
    .then(response => response.json())
    .then(data => {

        console.log(data)

        //Iterate through list of score dictionaries and create list elements
        //to display address and score
        for (const {score_id, score, address} of data) {

            console.log(score_id, score, address)

            const card = createCard()
            card.classList.add('rounded')
            
            const header = card.firstChild
            header.classList.add('loc-header')
            header.innerHTML = address;
            
            const body = document.createElement('div');
            body.setAttribute('class','card-body');

            const text = document.createElement('p')
            text.setAttribute('class', 'card-text')
            text.innerHTML = `Score: ${score}`;
            body.appendChild(text)
            card.appendChild(body)

            const btnGrp = document.createElement('div');
            btnGrp.setAttribute('class', 'btn-group btn-group-sm mx-auto d-block');
            btnGrp.setAttribute('role', 'group')
            btnGrp.setAttribute('aria-label', 'location buttons')

            const btn = document.createElement('button');
            btn.setAttribute('class', 'btn btn-outline-danger w-100 remove');
            btn.setAttribute('id', `remove-${score_id}`);
            btn.innerHTML = 'Remove';
            btn.addEventListener('click', (evt) => {
                evt.preventDefault();
                removeLocation(evt.target);
                });
            btnGrp.appendChild(btn);
            body.appendChild(btnGrp);

            document.getElementById('loc-card-deck').appendChild(card);
        }
    });
};



const addLocation = () => {
    location.assign('/search_location')
    }
    

(function runLocations() {

    displayLocations();

    //Attach event listener to "Add" location button
    //Callback function create form to add location
    const addLocBtn = document.querySelector('button#add-loc');
    addLocBtn.onclick = addLocation;

    

    
})();