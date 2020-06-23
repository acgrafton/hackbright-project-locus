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

    //Create unordered list element
    const ul = document.createElement('ul');
    ul.setAttribute('class', 'loc-det');

    //Make ajax call to get scored location info
    fetch('/api/scored_locations')
    .then(response => response.json())
    .then(data => {

        console.log(data)

        //Iterate through list of score dictionaries and create list elements
        //to display address and score
        for (const {score_id, score, address} of data) {

            console.log(score_id, score, address)

            const li = document.createElement('li');
            li.innerHTML = `Address: ${address}`;
            ul.appendChild(li);
            
            const li2 = document.createElement('li');
            li2.innerHTML = `Score: ${score}`;
            ul.appendChild(li2);

            const btn = document.createElement('button');
            btn.setAttribute('class', 'crud loc remove');
            btn.setAttribute('id', `remove-${score_id}`);
            btn.innerHTML = 'Remove';
            btn.addEventListener('click', (evt) => {
                evt.preventDefault();
                removeLocation(evt.target);
                });
            ul.appendChild(btn);


            document.getElementById('loc-card').appendChild(ul);
        }
    })
}



const addLocation = () => {
    location.assign('/search_location')
    }
    

(function runLocations() {

    displayLocations()

    //Attach event listener to "Add" location button
    //Callback function create form to add location
    const addLocBtn = document.querySelector('button#add-loc.crud');
    addLocBtn.onclick = addLocation;

    
})();