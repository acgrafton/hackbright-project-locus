//-----------------Base Functions----------------------------------------------
'use strict'

//-------Functions for Elements to Display Criteria and Locations--------------
const createCard = () => {
    const card = document.createElement('div')
    card.setAttribute('class', 'card text-center h-100')
    const header = document.createElement('div')
    header.setAttribute('class', 'card-header h-20 p-3')
    card.appendChild(header)
    return card
}

const createBtnGrp = (ariaLabel) => {
    const btnGrp = document.createElement('div');
    btnGrp.setAttribute('class', 'btn-group btn-group-sm mx-auto d-block');
    btnGrp.setAttribute('role', 'group')
    btnGrp.setAttribute('aria-label', ariaLabel) //ar-lab ex: Criteria Buttons
    return btnGrp
}

const createSmallBtn = () => {
    const btn = document.createElement('button');
    btn.setAttribute('type', 'button')
    btn.setAttribute('class', 'btn btn-sm')
    return btn
}

const createCancelBtn = (cancelFunction) => {
    const btn = createSmallBtn()
    btn.classList.add('cancel');
    btn.classList.add('btn-outline-info');
    btn.addEventListener('click', (evt) => {
        evt.preventDefault();
        cancelFunction();
    });
    btn.innerHTML = 'Cancel';
    return btn;
};

const createEditBtn = () => {
    const btn = createSmallBtn()
    btn.classList.add('btn-outline-secondary');
    btn.classList.add('w-100');
    btn.classList.add('edit');
    btn.innerHTML = 'Edit';
    return btn;
};

const createRemoveBtn = () => {
    const btn = createSmallBtn();
    btn.classList.add('btn-outline-secondary');
    btn.classList.add('w-100');
    btn.classList.add('remove');
    btn.innerHTML = 'Remove'
    return btn;
}

const createSaveBtn = () => {
    let btn = document.createElement('button');
    btn.setAttribute('type', 'submit');
    btn.setAttribute('class', 'btn btn-outline-success btn-sm')
    btn.innerHTML = 'Save';
    return btn;
}

// dataTarget = Element Id (i.e. #Home-Modal)
const createModalBtn = (dataTarget, btnId, btnLabel, callback) => {
    const btn = document.createElement('button')
    btn.setAttribute('class', 'btn btn-nav')
    btn.setAttribute('type', 'button')
    btn.setAttribute('data-toggle', 'modal')
    btn.setAttribute('data-target', dataTarget)
    btn.setAttribute('id', btnId)
    btn.innerHTML = btnLabel
    btn.addEventListener('click', (e) => {
        e.preventDefault()
        callback()
    })
    return btn
}

const setActiveTab = (fromTabId, toTabId) => {
    const fromTab = document.getElementById(fromTabId)
    fromTab.classList.remove('active')
    const toTab = document.getElementById(toTabId)
    toTab.classList.add('active')
}

//-------Functions for Password Management
const createPasswordBtn = () => {
    let btn = document.createElement('button');
    btn.setAttribute('id', 'change-password');
    btn.setAttribute('type', 'button');
    btn.setAttribute('class', 'btn btn-outline-dark btn-sm')
    btn.addEventListener('click', (evt)=>{
        evt.preventDefault();
        hideUserForm();
        showUserDetails();
        passwordForm = createEditPasswordForm();
        document.querySelector('div#user-card.card').append(passwordForm);
    });
    btn.innerHTML = 'Change Password';
    return btn;
}


// ------------------------Navbar Logout and Back Functions--------------------
const logOut = () => {
    let fetchData = {
        method:'POST'
    };
    fetch('/api/logout', fetchData)
    .then(response => response.json())
    .then(data => {
        if (data['success'] === true) {
            alert('Goodbye!')
            document.location.assign('/')
        } else {
            alert(`${data['error']}`);
            document.location.reload();
        }
    })
}

const createLogOutBtn = () => {
    const btn = document.createElement('button');
    btn.setAttribute('type', 'button');
    btn.setAttribute('class', 'btn btn-outline-secondary btn-sm');
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        logOut();
    })
    btn.innerHTML = 'log out';
    return btn;
}

const backToProfile = () => {
    document.location.assign('/');
}

// ---------Functions to Create Form Elements for Setting Criteria ------------

const createInputGrp = (category) => {
    const div = document.createElement('div');
    div.setAttribute('class', 'input-group-prepend');
    const label = document.createElement('label');
    label.setAttribute('for', 'criteria');
    label.setAttribute('class', 'input-group-text');
    label.innerHTML = 'Criteria';
    div.appendChild(label);
    return div;
};

const createSelect = (choices) => {
    let select = document.createElement('select');
    select.setAttribute('class', `custom-select place-type`);
    select.setAttribute('id', 'place-type');
    select.setAttribute('name', 'place-type')
    let defaultOption = document.createElement('option');
    defaultOption.setAttribute('selected', true);
    defaultOption.setAttribute('disabled', true);
    defaultOption.innerHTML = "choose";
    select.appendChild(defaultOption);
    for (const choice of choices) {
        let option = document.createElement('option');
        option.setAttribute('value', choice['alias']);
        option.innerHTML = `${choice['parent']}: ${choice['desc']}`;
        select.appendChild(option);
    }
    return select;
};

const createInlineRadio = (optionDetails) => {
    let row = document.createElement('div')
    row.setAttribute('class', 'row')
    let legend = document.createElement('legend')
    legend.setAttribute('class', 'col-form-label')
    legend.innerHTML = optionDetails['label']
    row.appendChild(legend)
    let col = document.createElement('div')
    col.setAttribute('class', 'col-sm-10')
    row.append(col)
    for (const option of optionDetails['options']) {
        let formcheck = document.createElement('class', 'formcheck')
        let inline = document.createElement('div')
        inline.setAttribute('class', 'form-check form-check-inline')
        let input = document.createElement('input')
        input.setAttribute('class', 'form-check-input')
        input.setAttribute('type', 'radio')
        input.setAttribute('name', `${optionDetails['dbLabel']}`)
        input.setAttribute('id', `radio-${optionDetails['dbLabel']}`)
        input.setAttribute('value', `${option}`)
        let label = document.createElement('label')
        label.setAttribute('class','form-check-label')
        label.setAttribute('for', `${option}`)
        label.innerHTML = option
        inline.appendChild(input)
        inline.appendChild(label)
        col.appendChild(inline)
    }
    return row
}


(function runBase() {

})();
