// CRUD_list = ['edit-user', 'remove-user', 'add-criterion', 'edit-criterion',
//            'remove-criterion', 'add-location', 'remove-location' ];

const CRUD = {'profile': ['edit-user', 'remove-user'],
            'saved-criteria': ['add-criterion', 'edit-criterion', 'remove-criterion'],
            'saved-location': ['add-location', 'remove-location'],
            };

// const createSaveBtn = () => {
//     let s = document.createElement('button');
//     s.setAttribute('class', 'save');
//     s.setAttribute('type', 'submit');
//     s.innerHTML = 'Save';
//     return s;
// };

const createCancelBtn = () => {
    let s = document.createElement('button');
    s.setAttribute('class', 'cancel');
    s.setAttribute('onclick', 'cancelChanges()');
    s.innerHTML = 'Cancel';
    return s;
};

//Create Edit User Form
const createEditUserForm = () => {
    //Grab existing data
    fname = document.getElementById('fname').innerText;
    lname = document.getElementById('lname').innerText;
    email = document.getElementById('email').innerText;

    //Insert in object
    userInfo = {'first name': fname, 'last name': lname, 'email': email}
    
    //Hide edit user buttons and existing details
    document.querySelector('fieldset#edit-user').setAttribute('hidden', true)
    document.querySelector('ul.user-det').setAttribute('hidden', true)

    //Create Form
    uf = document.createElement('form');
    uf.setAttribute('action', 'api/edit_user');
    uf.setAttribute('method', 'POST');
    uf.setAttribute('id', 'user-form');

    //Create fieldset
    fs = document.createElement('fieldset');
    fs.setAttribute('id', 'edit-user');

    //Add input elements and append to fieldset
    for (const userField in userInfo) {
        input = document.createElement('input');
        input.setAttribute('class', 'edit-user');
        input.setAttribute('id', `edit-${userField}`);
        input.setAttribute('type', 'text');
        input.setAttribute('placeholder', userField)
        input.setAttribute('value', `${userInfo[userField]}`);
        fs.appendChild(input);
        br = document.createElement('br')
        fs.appendChild(br)
    };

    //Append fieldset to form
    uf.appendChild(fs);

    //Create and add cancel and save buttons
    saveBtn = createSaveBtn();
    uf.appendChild(saveBtn);
    cancelBtn = createCancelBtn();
    uf.appendChild(cancelBtn)

    return uf
}

// Add Event Listeners to Profile

(function runUserScript() {
    let editUserBtn = document.querySelector('button#edit-user-btn.crud');

    editUserBtn.addEventListener('click', () => {
        newForm = createEditUserForm();
        document.querySelector('div#user-card.card').append(newForm)
    });

})();




