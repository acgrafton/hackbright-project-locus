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
                $('#savedLocations').tab('show')
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
        for (const {score_id, score, address, criteria} of data) {

            console.log(score_id, score, address, criteria)

            const col = document.createElement('div');
            col.setAttribute('class', 'col mx-2 my-4')

            const card = createCard()
            card.classList.add('rounded')
            
            const header = card.firstChild
            header.classList.add('loc-header')

            let addressH5 = document.createElement('h6')
            addressH5.setAttribute('class', 'mt-1')
            addressH5.innerHTML = address
            header.appendChild(addressH5)

            let scorep = document.createElement('p')
            scorep.setAttribute('class', 'mb-1')
            scorep.innerHTML = `score: ${score}`
            header.appendChild(scorep)
            
            const body = document.createElement('div');
            body.setAttribute('class','card-body p-1');
            card.appendChild(body)

            const ul = document.createElement('ul')
            ul.setAttribute('class', 'list-group list-group-flush')
            for (const crit in criteria) {
                let li = document.createElement('li')
                li.setAttribute('class', 'list-group-item p-1')
                li.innerHTML = `${crit}: ${criteria[crit]['gresults'] ? criteria[crit]['gresults'][0]['name']: criteria[crit]['yresults'] ? criteria[crit]['yresults'][0]['name']: 'no matches'}`
                ul.appendChild(li);
            }
            body.appendChild(ul)

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

            col.appendChild(card)

            document.getElementById('loc-card-deck').appendChild(col);
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