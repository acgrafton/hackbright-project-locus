//crud script for adding or removing locations

const removeLocation = (clickedBtn) => {

    console.log(clickedBtn)
    console.log(clickedBtn.id)
    
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
            document.location.reload();
        });
};


const addLocation = () => {
    location.assign('/search_location')
    }
    

(function runLocations() {

    //Attach event listener to "Add" location button
    //Callback function create form to add location
    const addLocBtn = document.querySelector('button#add-loc.crud');
    
    addLocBtn.addEventListener('click', addLocation);


    // Attach event listener to "Remove" location button
    // Callback function to create form to allow user to select location to remove
    const removeLocBtns = document.querySelectorAll('button.crud.loc.remove');
    
    for (const removeLocBtn of removeLocBtns) {
        removeLocBtn.addEventListener('click', (evt) => {
        evt.preventDefault();
        removeLocation(evt.target);
        });
    };

    
})();