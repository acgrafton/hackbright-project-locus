// script for the criteria section of the profile page
'use strict'

//Helper functions to show and hide elements on page---------------------------
const cancelCritChgs = () => {
    let row = document.getElementById('place-cat-row');
    let form = document.querySelector('form#edit-crit-form');
    let label = document.querySelector('#cat-label')
    card.removeChild(form);
    showCriteriaDetails()
};

const cancelAddCrit = () => {
    let row = document.getElementById('place-cat-row');
    row.removeChild(row.firstChild)
    let row2 = document.getElementById('place-type-row');
    row2.removeChild(row2.firstChild)

    document.querySelector('button#add-crit').style.display = '';
};

const hideCriteriaDetails = () => {
    document.querySelector('ul.crit-det').style.display = 'none';
};

const showCriteriaDetails = () => {
    document.querySelector('ul.crit-det').style.display = '';
};
//------------------------------------------------------------------------------

const addCritForm = () => {
    const form = document.createElement('form');
    form.setAttribute('id', 'add-crit-form')
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
    return form;
}

const addAddCritListener = (btn) => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        let fetchData = {
            method: 'POST',
            body: new FormData(btn.form),
        };
        fetch('/api/add_criteria', fetchData)
        .then(response => response.json())
        .then(data => {
            if (data['success'] === true) {
                document.location.reload();
                $('#criteria').tab('show');
            } else {
                alert(`Error: ${data['error']}`)
            }
        });
    })
}


const displayCriteria = () => {
    //Make ajax call to get scored location info
    fetch('/api/criteria')
    .then(response => response.json())
    .then(data => {
        //Create cards to display user criteria and details
        for (const crit of data) {
            let attributes = [{'formal': 'Place Type', 'id': 'desc', 'name': crit['place_type']['desc']},
                          {'formal': `Day of Week`, 'id': 'DOW', 'name': crit['DOW']},
                          {'formal': 'Time of Day', 'id': 'TOD', 'name': crit['TOD']},
                          {'formal': 'Mode', 'id': 'mode', 'name': crit['mode']}
                          ]; 
            const col = document.createElement('div');
            col.setAttribute('class', 'col mb-4')
            const card = createCard()
            card.classList.add('rounded')
            card.setAttribute('id', `crit-${crit['id']}`) //Crit ID = Primary Key in Database for Criteria
            const header = card.firstChild
            header.innerHTML = attributes[0]['name']; // Card Header: Place Type (i.e. Elementary Schools)
            header.classList.add('crit-header')
            //Add Criteria details to card:  DOW, TOD, mode
            const ul = document.createElement('ul');
            ul.setAttribute('class', 'list-group crit-det');
            for (let i=1; i < 4; i++) {
                const li = document.createElement('li');
                li.setAttribute('class', 'list-group-item flex-fill')
                li.innerHTML = `${attributes[i]['formal']}: `;
                const span = document.createElement('span');
                span.setAttribute('id', `${crit['place_type']['alias']}-${attributes[i]['id']}`);
                span.innerHTML = attributes[i]['name'];
                li.appendChild(span);
                ul.appendChild(li);
                card.appendChild(ul)
            }
            //Create 'Edit' and 'Remove' buttons
            const btnGrp = createBtnGrp('Criteria Buttons')
            // const editBtn = createEditBtn();
            // editBtn.setAttribute('id', `edit-${crit['place_type']['desc']}`);
            // editBtn.addEventListener('click', (evt) => {
            //     evt.preventDefault();
            //     editForm = createEditCritFrm(evt.target);
            //     document.getElementById('place-type-row').appendChild(editForm);
            //     hideCriteriaDetails();
            // });
            // btnGrp.appendChild(editBtn);
            const removeBtn = createRemoveBtn()
            removeBtn.setAttribute('id', `remove-${crit['id']}`);
            removeBtn.addEventListener('click', (evt) => {
                evt.preventDefault();
                removeCriteria(evt.target); 
            });
            btnGrp.appendChild(removeBtn);
            card.appendChild(btnGrp);
            col.appendChild(card)
            document.getElementById('criteria-card-deck').appendChild(col)
        }
    });
};



//Given user-clicked button html element, return a form to edit the selected criterion
const createEditCritFrm = (clickedBtn) => {
    //Get current criteria info
    critID = clickedBtn.id.slice(5);
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


//Delete criteria from database and reload page.
const removeCriteria = (clickedBtn) => {
    const critId = clickedBtn.id.slice(7);
    const data = {'critId': critId};
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
            if (data['success'] === true) {
                document.location.reload();
                setActiveTab('profile-tab', 'criteria-tab');
            } else {
                alert(`Error: ${data['error']}`)
            }
        });
}

(function runCriteria() {
    displayCriteria();
    const addCritRow = document.getElementById('add-crit-btn-row')
    const addCBtn = createModalBtn('#profile-modal', 'add-crit','add', () => {
        const title = document.getElementById('profile-modal-title');
        title.innerHTML = 'Add New Criteria';
        const body = document.getElementById('profile-modal-body');
        const form = addCritForm();
        body.appendChild(form);
        const saveBtn = document.getElementById('modal-save');
        saveBtn.innerHTML = 'save';
        saveBtn.setAttribute('form','add-crit-form');
        addAddCritListener(saveBtn)});
    addCBtn.setAttribute('class', "btn btn-outline-success btn-sm btn-block w-50")
    
    addCritRow.appendChild(addCBtn)
    
    const closeBtn = document.getElementById('modal-close')
    closeBtn.addEventListener('click', () => {
        const body = document.getElementById('profile-modal-body')
        body.removeChild(body.firstChild);
        document.getElementById('modal-save').removeAttribute('form');
    })
})();

        

    