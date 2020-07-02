"use strict";

//Given a list of items, put them into a dropdown list
const createInputGrp = (category) => {

    const div = document.createElement('div');
    div.setAttribute('class', 'input-group-prepend');
    const label = document.createElement('label');
    label.setAttribute('for', category);
    label.setAttribute('class', 'input-group-text');
    label.innerHTML = category;
    div.appendChild(label);

    return div;
};

const createSelect = (category, choices) => {

    let select = document.createElement('select');
    select.setAttribute('class', `custom-select ${category}`);
    select.setAttribute('id', category);
    select.setAttribute('name', category)

    let defaultOption = document.createElement('option');
    defaultOption.setAttribute('selected', true);
    defaultOption.setAttribute('disabled', true);
    defaultOption.innerHTML = "choose";
    select.appendChild(defaultOption);

    //Loop through placeTypes array and make each of those an option
    for (const choice of choices) {
        let option = document.createElement('option');
        option.setAttribute('value', choice);
        option.innerHTML = choice;
        select.appendChild(option);
    }

    return select;
};

const createSelect2 = (category, options) => {

    console.log(options)

    let select = document.createElement('select');
    select.setAttribute('class', 'custom-select');
    select.setAttribute('id', `${category}`);
    select.setAttribute('name', category)

    let defaultOption = document.createElement('option');
    defaultOption.setAttribute('selected', true);
    defaultOption.setAttribute('disabled', true);
    defaultOption.innerHTML = "choose";
    select.appendChild(defaultOption);

    //Loop through placeTypes array and make each of those an option
    for (const [display, value] of Object.entries(options)) {
        let option = document.createElement('option');
        option.setAttribute('value', value);
        option.innerHTML = display;
        select.appendChild(option);
    }

    return select;
};


const createQForm = () => {

    //Create form element
    const form = document.createElement('form');
    form.setAttribute("action", "/api/questionaire");
    form.setAttribute("method", "POST");

    for (const cat of CATEGORY_SET1) {

        let typeName = cat['dbPlaceType'];
        let theseChoices = (cat['options']).sort();

        let div = document.createElement('div');
        div.setAttribute('class', 'input-group mb-3');

        div.appendChild(createInputGrp(typeName));
        div.appendChild(createSelect(typeName, theseChoices));
        
        form.appendChild(div);
    }

    for (const cat of CATEGORY_SET2) {

        let typeName = cat['label'];
        let thisQ = cat['Q'];
        let theseChoices = cat['options'];


        let div = document.createElement('div');
        div.setAttribute('class', 'input-group mb-3');

        div.appendChild(createInputGrp(typeName));
        div.appendChild(createSelect2(typeName, theseChoices));
        
        let br = document.createElement('br');
        form.appendChild(div);
    }

    const submit = document.createElement('input');
        submit.setAttribute('type', 'submit');
        submit.setAttribute('class', 'btn btn-reg');
        submit.setAttribute('value', 'submit');

    form.appendChild(submit);

    return form;
}


(function runQuestionaire() {
    
    let q = document.getElementById('q-row');

    q.appendChild(createQForm());

    const skipBtn = document.createElement('button');
    skipBtn.setAttribute('type', 'button');
    skipBtn.setAttribute('class', 'btn btn-outline-info btn-sm');
    skipBtn.innerHTML = 'skip';
    skipBtn.onclick = backToProfile;

    const navform = document.getElementById('nav-form');
    navform.appendChild(skipBtn)

    const logOutBtn = createLogOutBtn()
    navform.appendChild(logOutBtn)
    logOutBtn.onclick = logOut;

})();


