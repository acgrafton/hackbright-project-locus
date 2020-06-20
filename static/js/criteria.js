// script for the criteria section of the profile page


//Helper functions to show and hide elements on page---------------------------
const cancelCritChgs = () => {
    let card = document.querySelector('div#crit-card.card');
    let form = document.querySelector('form#edit-crit-form');
    let label = document.querySelector('#cat-label')
    card.removeChild(form);
    showCriteriaDetails()
};

const cancelAddCrit = () => {
    let card = document.querySelector('div#crit-card.card');
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

const display_criteria = () => {

    //Create unordered list element
    const ul = document.createElement('ul');
    ul.setAttribute('class', 'crit-det');

    //Make ajax call to get scored location info
    fetch('/api/criteria')
    .then(response => response.json())
    .then(data => {

        console.log(data)

        //Iterate through list of score dictionaries and create list elements
        //to display address and score
        for (const {id, importance, max_distance, name, 
                    place_id, place_title} of data) {

            const distance = Math.floor(max_distance / 1609);

            attributes = {{'formal': 'Place Type', 'id': 'title', 'name': place_title},
                          {'formal': `My ${place_title}`, 'id': 'name', 'name': name},
                          {'formal': 'Importance', 'id': 'importance', 'name': importance},
                          {'formal': 'Max Distance', 'id': 'distance', 'name': distance},
                          }; 

            for (attribute of attributes):

            const li = document.createElement('li');
            li.innerHTML = `${attribute['formal']}:`;

            const span = document.createElement('span');
            span.setAttribute('id', `${place_id}-${attribute['id']}`);
            span.innerHTML = attribute['name'];
            li.appendChild(span);
            ul.appendChild(li);

            // const li2 = document.createElement('li');
            // li2.innerHTML = `My Favorite:`;

            // const span2 = document.createElement('span');
            // span2.setAttribute('id', `${place_id}-name`);
            // span2.innerHTML = name;
            // li2.appendChild(span);
            // li.after(li2);

            // const li3 = document.createElement('li');
            // li3.innerHTML = `Importance:`;

            // const span3 = document.createElement('span');
            // span3.setAttribute('id', `${place_id}-importance`);
            // span3.innerHTML = importance;
            // li3.appendChild(span3);
            // li2.after(li3);
            
            // const li4 = document.createElement('li');
            // li4.innerHTML = `Max Distance:`;

            // const span4 = document.createElement('span');
            // span4.setAttribute('id', `${place_id}-distance`);
            // span4.innerHTML = distance;
            // li4.appendChild(span4);
            // li3.after(li4);

            const editBtn = document.createElement('button');
            editBtn.setAttribute('class', 'crud crit edit');
            editBtn.setAttribute('id', `edit-${place_id}`);
            editBtn.innerHTML = 'Edit';
            ul.appendChild(editBtn);
            editBtn.addEventListener('click', (evt) => {
                evt.preventDefault();
                editForm = createEditCritFrm(evt.target);
                document.querySelector('div#crit-card.card').appendChild(editForm);
                hideCriteriaDetails();
            });

            const saveBtn = document.createElement('button');
            saveBtn.setAttribute('class', 'crud crit remove');
            saveBtn.setAttribute('id', `remove-${place_id}`);
            saveBtn.innerHTML = 'Remove';
            ul.appendChild(saveBtn);

            ul.appendChild(document.createElement('br'));
            ul.appendChild(document.createElement('br'));

        document.getElementById('crit-card').appendChild(ul);
        }
    })
}




//Generate buttons of place categories for user to select
const createCategoryBtns = () => {
    
    //Get categories from database
    fetch('/api/place_categories')
        .then(response => response.json())
        .then((data) => {
            console.log(data)

            //Create label
            const label = document.createElement('label');
            label.setAttribute('for', 'categories');
            label.setAttribute('id', 'cat-label')
            label.innerHTML = 'Place Categories';

            //Create fieldset to contain the category buttons
            const fdset = document.createElement('fieldset');
            fdset.setAttribute('id', 'cat-fieldset');
            fdset.setAttribute('name', 'categories');

            //Loop through categories and create buttons with event listeners
            //for each
            for (const category of data){
                const btn = document.createElement('button');
                btn.setAttribute('class', 'category');
                btn.setAttribute('id', `${category}`);
                btn.innerHTML = category;

                //Add Event Listener for each category - when clicked create
                //criteria form with a dropdown with subcategories
                btn.addEventListener('click', (evt) => {
                    fdset.setAttribute('disabled', true);
                    const clickedBtn = evt.target.innerText;
                    createCritFrm(clickedBtn);
                });
                fdset.append(btn);

            document.querySelector('#crit-card').prepend(fdset);
            document.querySelector('#crit-card').prepend(label);
            
            };
        });
};


//Create a form for user to set place criteria and importance
const createCritFrm = (selectedCategory) => {

    category = document.querySelector('#cat-fieldset');
    
    //Create form element
    const form = document.createElement('form');
    form.setAttribute("action", "/api/set_criteria");
    form.setAttribute("method", "POST");
    form.setAttribute("id", "criteria-form");

   const input = document.createElement('input');
    input.setAttribute('type','text');
    input.setAttribute('id', 'place-type');
    input.setAttribute('name', 'place-type');
    input.setAttribute('list', 'place-types');
    input.setAttribute('placeholder', 'Select Place Type');
    form.appendChild(input);

    //Get place types json from server and convert back to array
    fetch(`/api/place_types/${selectedCategory}`)
    .then(response => response.json())
    .then(data => {

        //Array of place types in alpha order
        placeTypes = data[selectedCategory];

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
        form.appendChild(createImportanceMenu());

        //Add distance menu
        form.appendChild(createDistanceMenu());

        //Add save and cancel buttons
        form.appendChild(createSaveBtn());
        form.appendChild(createCancelBtn(cancelAddCrit));

        category.after(form);

        return form;
    });
};


//Create dropdown menu to select importance criteria
const createImportanceMenu = () => {

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

//Create dropdown menu to select distance parameters
const createDistanceMenu = () => {

    //Create input element
    const input = document.createElement('input');
    input.setAttribute('id', 'distance');
    input.setAttribute('name', 'distance');
    input.setAttribute('list', 'select-distance');
    input.setAttribute('placeholder', 'Select Distance (miles)');

    const datalist = document.createElement('datalist');
    datalist.setAttribute('id', 'select-distance');

    //Loop through list of distance options array and make each of those an option
    const dist_list = [3, 5, 10, 15, 20, 30]

    for (const dist of dist_list) {
        option = document.createElement('option');
        option.setAttribute('value', dist.toString());
        option.innerHTML = 'miles';
        datalist.appendChild(option);
    };

    input.appendChild(datalist);

    return input;
}


//Given user-clicked button html element, return a form to edit the selected criterion
const createEditCritFrm = (clickedBtn) => {

    //Get current criteria info
    placeID = clickedBtn.id.slice(5);
    console.log(placeID)
    placeTitle = document.getElementById(`${placeID}-title`).innerHTML;
    placeImportance = document.getElementById(`${placeID}-importance`).innerHTML;
    placeDistance = document.getElementById(`${placeID}-distance`).innerHTML;

    //Insert data into an object for easy access
    placeInfo = {'importance': placeImportance,
                 'max distance': placeDistance,
                }
    
    //Create form element
    const form = document.createElement('form');
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
            form.appendChild(createImportanceMenu());

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
    saveBtn.onsubmit = async (e) => {
        e.preventDefault();

        let critForm = document.querySelector('#edit-crit-form');

        let response = await fetch('/api/edit_criteria', {
            method: 'POST',
            body: new FormData(critForm)
        });

        let result = await response.json();

        alert('Criteria changes saved!')
    };

    form.appendChild(saveBtn);

    cancelBtn = createCancelBtn(cancelCritChgs);
    form.appendChild(cancelBtn);

    return form;
};


const saveCriteria = (clickedBtn) => {

}




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
        document.querySelector('button#add-crit.crud').style.display = 'none';
        createCategoryBtns();
    });

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

    display_criteria();

})();

        

        













