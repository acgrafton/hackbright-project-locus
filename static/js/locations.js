//crud script for adding or removing locations

const hideLocDet = () => {
    document.querySelector('ul.loc-det').style.display = 'none';
};

const showLocDet = () => {
    document.querySelector('ul.loc-det').style.display = '';
};

const hideLocBtns = () => {
    document.querySelector('fieldset#loc-btns').style.display = 'none';
};

const showLocBtns = () => {
    document.querySelector('fieldset#loc-btns').style.display = '';
};


(function runLocations() {

    //Attach event listener to "Add" location button
    //Callback function create form to add location
    const addLocBtn = document.querySelector('button#add-loc.crud');
    
    addLocBtn.addEventListener('click', ()=> {
        hideLocBtns();
        createAddLocForm(); // need to write
    });


    //Attach event listener to "Remove" location button
    //Callback function to create form to allow user to select location to remove
    const removeLocBtn = document.querySelector('button#remove-loc.crud');
    removeLocBtn.addEventListener('click', () => {
        hideLocBtns();
        createRemoveLocForm(); // need to write => checkbox to select location to remove
    });
})();