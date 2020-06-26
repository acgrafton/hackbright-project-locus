"use strict";


//Given a list of items, put them into a dropdown list
const createQLabel = (question, category) => {

    const label = document.createElement('label');
    label.setAttribute('for', category);
    label.innerHTML = question

    return label;
};

const createQInput = (category) => {

    const input = document.createElement('input');
    input.setAttribute('type','text');
    input.setAttribute('id', category);
    input.setAttribute('name', category);
    input.setAttribute('list', `${category}-list`);

    return input;
};

const createQDatalist = (category, choices) => {

    let datalist = document.createElement('datalist');
        datalist.setAttribute('id', `${category}-list`);

        //Loop through placeTypes array and make each of those an option
        for (const choice of choices) {
            let option = document.createElement('option');
            option.setAttribute('value', choice);
            option.innerHTML = choice;
            datalist.appendChild(option);
        }

    return datalist;
};


const createQForm = () => {

    //Create form element
    const form = document.createElement('form');
    form.setAttribute("action", "/questionaire");
    form.setAttribute("method", "POST");
    form.setAttribute("id", "q-form");

    for (const cat of CATEGORY_SET1) {
        
        let typeName = Object.keys(cat)[1];
        let thisQ = cat['Q'];
        let thisCat = typeName;
        let theseChoices = (cat[typeName]).sort();
        form.appendChild(createQLabel(thisQ, thisCat));
        form.appendChild(createQInput(thisCat));
        form.appendChild(createQDatalist(thisCat, theseChoices));
        let br = document.createElement('br');
        form.appendChild(br);
    }

    for (const cat of CATEGORY_SET2) {

        let typeName = Object.keys(cat)[1];
        let thisQ = cat['Q'];
        let thisCat = typeName;
        let theseChoices = Object.keys((cat[typeName]));
        form.appendChild(createQLabel(thisQ, thisCat));
        form.appendChild(createQInput(thisCat));
        form.appendChild(createQDatalist(thisCat, theseChoices));
        let br = document.createElement('br');
        form.appendChild(br);
    }

    //Create 'save' and 'cancel' buttons
    const saveBtn = createSaveBtn();
    saveBtn.onsubmit = async (e) => {
        e.preventDefault();

        let response = await fetch('/api/questionaire', {
            method: 'POST',
            body: new FormData(form)
        });

        let result = await response.json();

        alert('Criteria changes saved!')
    };
    form.appendChild(saveBtn);

    return form;
}

(function runQuestionaire() {
    
    let q = document.querySelector('div#questionaire');

    q.appendChild(createQForm());

})();


