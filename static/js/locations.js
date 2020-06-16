//crud script for adding or removing locations




const addLocation = () => {
    location.assign('/search_location')
    }

(function runLocations() {

    //Attach event listener to "Add" location button
    //Callback function create form to add location
    const addLocBtn = document.querySelector('button#add-loc.crud');
    
    addLocBtn.addEventListener('click', addLocation);


    //Attach event listener to "Remove" location button
    //Callback function to create form to allow user to select location to remove
    // const removeLocBtn = document.querySelector('button#remove-loc.crud');
    // removeLocBtn.addEventListener('click', () => {
    //     createRemoveLocForm(); // need to write => checkbox to select location to remove
    // });
})();