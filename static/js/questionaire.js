"use strict";

const createHomeLocForm = () => {
    const form = document.createElement('form');
    form.setAttribute("action", "/api/set_home_loc");
    form.setAttribute("method", "POST");
    form.setAttribute('name', 'home-loc')

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
}


const createQForm = () => {
    //Create form element
    const form = document.createElement('form');
    form.setAttribute("action", "/api/questionaire");
    form.setAttribute("method", "POST");

    const fetchData = {
        method: 'GET',
        headers: {'Content-Type': 'application/json'
        }
    };

    fetch('/api/get_place_types', fetchData)
    .then(response=>response.json())
    .then(placeTypeData=> {
        let formGroup = document.createElement('fieldset')
        let inputGroup = document.createElement('div')
        inputGroup.setAttribute('class', 'input-group mb-3')
        inputGroup.appendChild(createInputGrp('place-type-input-grp'))
        let select =createSelect(placeTypeData)
        inputGroup.appendChild(select)
        formGroup.appendChild(inputGroup)
        formGroup.appendChild(createInlineRadio({'label': 'Pick Day of Week',
                                                 'dbLabel': 'DOW', 
                                                 'options': ['M-F', 'Sa-Su']}))
        formGroup.appendChild(createInlineRadio({'label': 'Pick Time of Day',
                                                 'dbLabel': 'TOD', 
                                                 'options': ['Morning', 
                                                             'Afternoon', 
                                                             'Evening', 
                                                             'Commute']}))
        formGroup.appendChild(createInlineRadio({'label': 'Pick Mode of Transportation',
                                                 'dbLabel': 'mode', 
                                                 'options': ['Driving', 
                                                             'Bicycling', 
                                                             'Transit', 
                                                             'Walking']}))
        form.appendChild(formGroup)
    })
    .then(() => {
        const submit = document.createElement('input');
        submit.setAttribute('type', 'submit');
        submit.setAttribute('class', 'btn btn-primary');
        submit.setAttribute('value', 'submit');
        form.appendChild(submit)
    })

    // for (const cat of CATEGORIES) {
    //     let typeName = cat['dbPlaceType'];
    //     let theseChoices = (cat['options']).sort();

    //     let div = document.createElement('div');
    //     div.setAttribute('class', 'input-group mb-3');
    //     div.appendChild(createInputGrp(typeName));
    //     div.appendChild(createSelect(typeName, theseChoices));
    //     form.appendChild(div);
    // }


    // for (const cat of CATEGORY_SET1) {
    //     let typeName = cat['dbPlaceType'];
    //     let theseChoices = (cat['options']).sort();

    //     let div = document.createElement('div');
    //     div.setAttribute('class', 'input-group mb-3');
    //     div.appendChild(createInputGrp(typeName));
    //     div.appendChild(createSelect(typeName, theseChoices));
    //     form.appendChild(div);
    // }

    // for (const cat of CATEGORY_SET2) {
    //     let typeName = cat['label'];
    //     let thisQ = cat['Q'];
    //     let theseChoices = cat['options'];
    //     let div = document.createElement('div');
    //     div.setAttribute('class', 'input-group mb-3');
    //     div.appendChild(createInputGrp(typeName));
    //     div.appendChild(createSelect2(typeName, theseChoices));
    //     let br = document.createElement('br');
    //     form.appendChild(div);
    // }

    
    return form;
}


(function runQuestionaire() {
    let q = document.getElementById('q-row');
    const new_crit_form = createQForm()
    q.appendChild(new_crit_form);
    new_crit_form.addEventListener('submit', (e) => {
        e.preventDefault();
        new FormData(new_crit_form);
    })
    new_crit_form.addEventListener('formdata', (e) => {
        console.log(e.formData)
        const fetchData = {
            method: 'POST',
            body: e.formData
            }
        fetch('/api/add_criteria', fetchData)
        .then(response => response.json())
        .then(data => {
            const currCrit = document.getElementById('curr-crit')
            let critpopover =document.createElement('a')
            critpopover.setAttribute('class', 'btn btn-sm btn-primary')
            critpopover.setAttribute('role', 'button')
            critpopover.setAttribute('data-toggle', 'popover')
            critpopover.setAttribute('data-trigger', 'focus')
            critpopover.setAttribute('title', data['place_type']['desc'])
            critpopover.setAttribute('data-content',
                                     `Travel Info\n Day of Week: ${data['DOW']}\n Time of Day: ${data['TOD']}\n Mode: ${data['mode']}`)
            critpopover.innerHTML = data['place_type']['desc']
            currCrit.appendChild(critpopover)
        })
    })
    
    
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