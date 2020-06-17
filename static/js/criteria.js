// script for the criteria section of the profile page


//Helper functions to show and hide elements on page---------------------------
const cancelCritChgs = () => {
    let card = document.querySelector('div#criterion-card.card');
    let form = document.querySelector('form#edit-crit-form');
    card.removeChild(form);
    showCriteriaDetails()
};

const cancelAddCrit = () => {
    let card = document.querySelector('div#criterion-card.card');
    let form = document.querySelector('form#criteria-form');
    card.removeChild(form);
    showCriteriaDetails();
    hideCategories();
    document.querySelector('button#add-crit.crud').style.display = '';
};

const hideCriteriaDetails = () => {
    document.querySelector('ul.crit-det').style.display = 'none';
};

const showCriteriaDetails = () => {
    document.querySelector('ul.crit-det').style.display = '';
};

const hideCategories = () => {
    document.querySelector('fieldset#cat-fieldset').style.display = 'none';
};

const showCategories = () => {
    document.querySelector('fieldset#cat-fieldset').style.display = '';
};
//------------------------------------------------------------------------------


//Generate buttons of place categories for user to select
const createCategoryBtns = () => {
    
    //Get categories from database
    fetch('/api/place_categories')
        .then(response => response.json())
        .then((data) => {

            //Create fieldset to contain the category buttons
            fdset = document.createElement('fieldset');
            fdset.setAttribute('id', 'cat-fieldset')

            //Loop through categories and create buttons with event listeners
            //for each
            for (const category of data){
                const btn = document.createElement('button');
                btn.setAttribute('class', 'category')
                btn.setAttribute('id', `${category}`);
                btn.innerHTML = category;

                //Add Event Listener for each category - when clicked create
                //criteria form with a dropdown with subcategories
                btn.addEventListener('click', (evt) => {
                    fdset.setAttribute('disabled', true);
                    const clickedBtn = evt.target.innerText;
                    createCritFrm(clickedBtn);
                });
                fdset.appendChild(btn);

            document.querySelector('#criterion-card').append(fdset);
            };
        });
};


//Create a form for user to set place criteria and importance
const createCritFrm = (selectedCategory) => {

    card = document.querySelector('#criterion-card')
    
    //Create form element
    const form = document.createElement('formorm');
    form.setAttribute("action", "/api/set_criteria");
    form.setAttribute("method", "POST");
    form.setAttribute("id", "criteria-form");

    input = document.createElement('input');
    input.setAttribute('type','text');
    input.setAttribute('id', 'place-type');
    input.setAttribute('name', 'place-type');
    input.setAttribute('list', 'place-types');
    input.setAttribute('placeholder', 'Select Place Type');
    form.appendChild(input);

    //Get place types json from server and convert back to array.
    fetch(`/api/place_types/${selectedCategory}`)
    .then(response => response.json())
    .then(data => {

        //Array of place types in alpha order
        placeTypes = data[selectedCategory];
        console.log(placeTypes)

        //Create dropdown menu and append to form
        let datalist = document.createElement('datalist');
        datalist.setAttribute('id', 'place-types');


        //Loop through placeTypes array and make each of those an option
        for (placeType of placeTypes) {
            option = document.createElement('option');
            option.setAttribute('value', placeType);
            option.innerHTML = (placeType.charAt(0).toUpperCase() + placeType.slice(1));
            datalist.appendChild(option);
        };

        form.appendChild(datalist);

        //Add importance menu
        form.appendChild(generateImportanceMenu());

        //Add save and cancel buttons
        form.appendChild(createSaveBtn());
        form.appendChild(createCancelBtn(cancelAddCrit));

        card.appendChild(form);

        return form;
    });
};


//Create dropdown menu to select importance criteria
const generateImportanceMenu = () => {

    //Create input element
    const input = document.createElement('input');
    input.setAttribute('id', 'importance');
    input.setAttribute('name', 'importance');
    input.setAttribute('list', 'importance-rating');
    input.setAttribute('placeholder', 'Select Importance');

    const dl = document.createElement('datalist');
    dl.setAttribute('id', 'importance-rating');

    //Loop through placeTypes array and make each of those an option
    let num = 1
    while (num < 6) {
        option = document.createElement('option');
        option.setAttribute('value', num.toString());
        option.innerHTML = num.toString();
        dl.appendChild(option);
        num += 1;
    };

    input.appendChild(dl);

    return input;
}


//Sets 'disabled' attribute of all place-category buttons to 'false'
const resetCategories = () => {
    categoryButtons = document.getElementById('cat-fieldset')
    categoryButtons.setAttribute('disabled', false)
};


//Given user-clicked button html element, return a form to edit the selected criterion
const createEditCritFrm = (clickedBtn) => {

    //Get current criteria info
    placeID = clickedBtn.id.slice(5);
    placeTitle = document.getElementById(`${placeID}-title`).innerHTML;
    placeImportance = document.getElementById(`${placeID}-importance`).innerHTML;
    placeDistance = document.getElementById(`${placeID}-distance`).innerHTML;

    //Insert data into an object for easy access
    placeInfo = {'importance': placeImportance,
                 'max distance': placeDistance,
                }
    
    //Create form element
    const form = document.createElement('form');
    form.setAttribute("action", "/api/edit_criteria");
    form.setAttribute("method", "POST");
    form.setAttribute("id", "edit-crit-form");

    //Create Place Type Name field (non-editable)
    span = document.createElement('span');
    span.innerHTML = `Place Name: ${placeTitle}`;
    form.appendChild(span);
    br1 = document.createElement('br');
    form.appendChild(br1);

    //Add hidden input elements containing place type info prior to changes
    for (const placeField in placeInfo) {
        input = document.createElement('input');
        input.setAttribute('name', `old-${placeField.split(' ').join("-")}`);
        input.setAttribute('type', 'hidden');
        input.setAttribute('value', `${placeInfo[placeField]}`);
        form.appendChild(input);
    };

    //Add input elements and append to fieldset
    for (const placeField in placeInfo) {
        label = document.createElement('label');
        label.setAttribute('for', `edit-${placeField.split(' ').join("-")}`);
        label.innerHTML = placeField;
        form.appendChild(label);

        if (placeField === 'importance') {
            form.appendChild(generateImportanceMenu());

        } else {
            input = document.createElement('input');
            input.setAttribute('class', 'edit-place-type');
            input.setAttribute('id', `edit-${placeField.split(' ').join("-")}`);
            input.setAttribute('name', `edit-${placeField.split(' ').join("-")}`);
            input.setAttribute('type', 'text');
            input.setAttribute('value', `${placeInfo[placeField]}`);
            form.appendChild(input);
        };
        br2 = document.createElement('br');
        form.appendChild(br2);
    };

    //Create 'save' and 'cancel' buttons
    saveBtn = createSaveBtn();
    saveBtn.setAttribute('form', 'edit-crit-form');
    form.appendChild(saveBtn);

    cancelBtn = createCancelBtn(cancelCritChgs);
    form.appendChild(cancelBtn);

    return form;
};

//Delete criteria from database and reload page.
const removeCriteria = (clickedBtn) => {
    
    //Get place id from the button clicked
    const placeId = clickedBtn.id.slice(7);

    //Put it into an object
    const data = {'placeId': placeId};

    //Setup fetch data
    let fetchData = {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        },
    };

    //Make ajax call - if successful, reload page, if not, flash error msg
    fetch('/api/remove_criteria', fetchData)
        .then(response => response.json())
        .then(data => {
            if (data['success'] === true) {
                document.location.reload();
            } else {
                alert(`Error: ${data['error']}`)
            }
        });
}


(function runCriteria() {

    //Get Add Criteria button
    const addCritBtn = document.querySelector('button#add-crit.crud');
    
    //Attach event listener with callback function to create category buttons
    addCritBtn.addEventListener('click', (evt)=> {
        evt.preventDefault();
        document.querySelector('button#add-crit.crud').style.display = 'none';
        createCategoryBtns();
    });

    //Get edit criteria buttons
    const editCritBtns = document.querySelectorAll('button.crud.crit.edit');

    //Add event listener to each button. 
    //Callback function to show dropdown menu to select criteria
    for (const editCritBtn of editCritBtns) {
        editCritBtn.addEventListener('click', (evt) => {
            evt.preventDefault();
            editForm = createEditCritFrm(evt.target);
            document.querySelector('div#criterion-card.card').appendChild(editForm);
            hideCriteriaDetails();
        });
    };
    
    //Get remove criteria buttons
    const removeCritBtns = document.querySelectorAll('button.crud.crit.remove');

    //Attach event listener to each button
    //Callback function to create form to allow user to select criteria to remove
    for (const removeCritBtn of removeCritBtns) {
        removeCritBtn.addEventListener('click', (evt) => {
            evt.preventDefault();
            removeCriteria(evt.target); 
        });
    };
})();













