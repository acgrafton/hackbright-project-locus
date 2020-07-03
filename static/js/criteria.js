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

    //Make ajax call to get scored location info
    fetch('/api/criteria')
    .then(response => response.json())
    .then(data => {

        console.log(data)

        //Iterate through list of score dictionaries and create list elements
        //to display address and score
        for (const {id, importance, name, 
                    place_id, place_title} of data) {

            attributes = [{'formal': 'Place Type', 'id': 'title', 'name': place_title},
                          {'formal': `Preferred`, 'id': 'name', 'name': name},
                          {'formal': 'Importance', 'id': 'importance', 'name': importance},
                          ]; 
            
            const card = createCard()
            // card.classList.add('flex-row')
            card.classList.add('rounded')
            const header = card.firstChild
            header.innerHTML = attributes[0]['name'];
            header.classList.add('crit-header')

            //Create unordered list element
            const ul = document.createElement('ul');
            ul.setAttribute('class', 'list-group crit-det');
                          
            if (attributes[1]['name']) {
                const li = document.createElement('li');
                li.setAttribute('class', 'list-group-item flex-fill')
                const span = document.createElement('span');
                span.setAttribute('id', `${place_id}-${attributes[1]['id']}`);
                span.innerHTML = attribute[1]['name'];
                li.appendChild(span);
                ul.appendChild(li);
                card.appendChild(ul)
            }

            const li = document.createElement('li');
            li.setAttribute('class', 'list-group-item flex-fill')
            li.innerHTML = `${attributes[2]['formal']}:`;

            const span = document.createElement('span');
            span.setAttribute('id', `${place_id}-${attributes[2]['id']}`);
            span.innerHTML = attributes[2]['name'];
            li.appendChild(span);
            ul.appendChild(li);
            card.appendChild(ul)

            const btnGrp = document.createElement('div');
            btnGrp.setAttribute('class', 'btn-group btn-group-sm mx-auto d-block');
            btnGrp.setAttribute('role', 'group')
            btnGrp.setAttribute('aria-label', 'criteria buttons')

            const editBtn = document.createElement('button');
            editBtn.setAttribute('type', 'button')
            editBtn.setAttribute('class', 'btn btn-outline-secondary w-100 edit');
            editBtn.setAttribute('id', `edit-${place_id}`);
            editBtn.innerHTML = 'Edit';
            editBtn.addEventListener('click', (evt) => {
                evt.preventDefault();
                editForm = createEditCritFrm(evt.target);
                document.getElementById('place-type-row').appendChild(editForm);
                hideCriteriaDetails();
            });

            const removeBtn = document.createElement('button');
            removeBtn.setAttribute('class', 'btn btn-outline-danger w-100 remove');
            removeBtn.setAttribute('id', `remove-${place_id}`);
            removeBtn.innerHTML = 'Remove';
            removeBtn.addEventListener('click', (evt) => {
                evt.preventDefault();
                removeCriteria(evt.target); 
            });
        
        btnGrp.appendChild(editBtn);
        btnGrp.appendChild(removeBtn);
        card.appendChild(btnGrp);
        document.getElementById('criteria-card-deck').appendChild(card)
        }
    });
    
};




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
            const btnGrp = document.createElement('div');
            btnGrp.classList.add('btn-group-md')
            btnGrp.setAttribute('id', 'cat-btn-grp');
            btnGrp.setAttribute('name', 'categories');

            //Loop through categories and create buttons with event listeners
            //for each
            for (const category of data.sort()){
                const btn = document.createElement('button');
                btn.setAttribute('type', 'button')
                btn.setAttribute('class', 'btn btn-info category');
                btn.setAttribute('id', `${category}`);
                btn.innerHTML = category;

                //Add Event Listener for each category - when clicked create
                //criteria form with a dropdown with subcategories
                btn.addEventListener('click', (evt) => {
                    btnGrp.setAttribute('disabled', true);
                    const clickedBtn = evt.target.innerText;
                    createCritFrm(clickedBtn);
                });
                btnGrp.append(btn);

            document.getElementById('place-cat-row').prepend(btnGrp);
            document.getElementById('place-cat-row').prepend(label);
            
            };
        });
};


//Create a form for user to set place criteria and importance
const createCritFrm = (selectedCategory) => {

    const row = document.querySelector('#place-type-row');
    
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
        console.log(data)

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

        // //Add distance menu
        // form.appendChild(createDistanceMenu());

        //Add save and cancel buttons
        form.appendChild(createSaveBtn());
        form.appendChild(createCancelBtn(cancelAddCrit));

        row.appendChild(form);

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

    //Insert data into an object for easy access
    placeInfo = {'importance': placeImportance}
    
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
    const saveBtn = createSaveBtn();
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

    display_criteria();

    //Get Add Criteria button
    const addCritBtn = document.querySelector('button#add-crit');
    
    //Attach event listener with callback function to create category buttons
    addCritBtn.addEventListener('click', (evt)=> {
        document.querySelector('button#add-crit').style.display = 'none';
        createCategoryBtns();
    });

})();

        

    