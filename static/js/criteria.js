// crud script for editing user's location criteria

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


//Generate buttons of place categories for user to select
const generateCategories = () => {
    fetch('/api/place_categories')
        .then(response => response.json())
        .then((data) => {
            fs = document.createElement('fieldset');
            fs.setAttribute('id', 'cat-fieldset')
            for (const category of data){
                const btn = document.createElement('button');
                btn.setAttribute('id', `${category}`);
                btn.innerHTML = category;
                btn.addEventListener('click', (evt) => {
                    fs.setAttribute('disabled', true);
                    const clickedBtn = evt.target.innerText;
                    createCriteriaForm(clickedBtn);
                });
                fs.appendChild(btn);
            document.querySelector('#criterion-card').append(fs);
            };
        });
};

//Create a form for user to set place criteria and importance
const createCriteriaForm = (selectedCategory) => {

    cc = document.querySelector('#criterion-card')
    
    //Create form element
    const f = document.createElement('form');
    f.setAttribute("action", "/api/set_criteria");
    f.setAttribute("method", "POST");
    f.setAttribute("id", "criteria-form");

    ptInput = document.createElement('input');
    ptInput.setAttribute('type','text');
    ptInput.setAttribute('id', 'place-type');
    ptInput.setAttribute('name', 'place-type');
    ptInput.setAttribute('list', 'place-types');
    ptInput.setAttribute('placeholder', 'Select Place Type');
    f.appendChild(ptInput);

    //Get place types json from server and convert back to array.
    fetch(`/api/place_types/${selectedCategory}`)
    .then(response => response.json())
    .then(data => {

        //Array of place types in alpha order
        placeTypes = data[selectedCategory];
        console.log(placeTypes)

        //Create dropdown menu and append to form
        let d = document.createElement('datalist');
        d.setAttribute('id', 'place-types');


        //Loop through placeTypes array and make each of those an option
        for (placeType of placeTypes) {
            option = document.createElement('option');
            option.setAttribute('value', placeType);
            option.innerHTML = (placeType.charAt(0).toUpperCase() + placeType.slice(1));
            d.appendChild(option);
        };
        f.appendChild(d);

        //Add importance menu
        f.appendChild(generateImportanceMenu());

        //Add save and cancel buttons
        f.appendChild(createSaveBtn());
        f.appendChild(createCancelBtn(cancelAddCrit));

        cc.appendChild(f);

        return f;
 
    });
};


const addCategoryListeners = () => {
    Array.from(document.querySelectorAll('button'))
        .forEach((btn) => {
            btn.addEventListener('click', (evt) => {
                fs = document.getElementById('cat-fieldset');
                fs.setAttribute('disabled', true);
                const clickedBtn = evt.target.innerText;
                generatePlaceTypes(clickedBtn);
            });
        });
}


//Create dropdown menu to select importance criteria
const generateImportanceMenu = () => {
    //Create dropdown menu

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
const createEditCritForm = (clickedBtn) => {
    console.log(clickedBtn);

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

const removeCriteria = (clickedBtn) => {
    
    const placeID = clickedBtn.id.slice(7);

    const data = {'placeID': placeID};

    let fetchData = {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        },
    };

    fetch('/api/remove_criteria', fetchData)
        .then(response => response.json())
        .then(data => {
            document.location.reload();
        });
}



(function runCriteria() {

    //Attach event listener to "Add" criteria button
    //Callback function to show category menu to add criteria
    const addCritBtn = document.querySelector('button#add-crit.crud');
    
    addCritBtn.addEventListener('click', (evt)=> {
        evt.preventDefault();
        document.querySelector('button#add-crit.crud').style.display = 'none';
        generateCategories();
    });


    //Attach event listener to "Edit" criteria buttons
    //Callback function to create form to allow user to make changes
    const editCritBtns = document.querySelectorAll('button.crud.crit.edit');

    for (const editCritBtn of editCritBtns) {
        editCritBtn.addEventListener('click', (evt) => {
            evt.preventDefault();
            editForm = createEditCritForm(evt.target);
            document.querySelector('div#criterion-card.card').appendChild(editForm);
            hideCriteriaDetails();
        });
    };
    

    //Attach event listener to "Remove" criteria buttons
    //Callback function to create form to allow user to select criteria to remove
    const removeCritBtns = document.querySelectorAll('button.crud.crit.remove');

    for (const removeCritBtn of removeCritBtns) {
        removeCritBtn.addEventListener('click', (evt) => {
            evt.preventDefault();
            removeCriteria(evt.target); 
        });
    };
    
})();













