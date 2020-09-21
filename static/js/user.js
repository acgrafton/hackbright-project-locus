//crud script for editing user profile information


//
//Remove form and revert back to showing user profile details
const cancelUserChgs = () => {
    
    let card = document.querySelector('div#user-card.card');
    let form = document.querySelector('form#user-form');
    card.removeChild(form);

    document.querySelector('ul.user-det').style.display = '';
    document.querySelector('fieldset#edit-user').style.display = '';
};

const cancelPwdChgs = () => {
    const form = document.querySelector('form#password-form');
    document.querySelector('div#user-card.card').removeChild(form);
    showUserForm();
};

const hideUserDet = () => {
    document.querySelector('ul.user-det').style.display = 'none';
};

const showUserDet = () => {
    document.querySelector('ul.user-det').style.display = '';
};

const hideUserForm = () => {
    document.querySelector('form#user-form').style.display = 'none';
};

const showUserForm = () => {
    document.querySelector('form#user-form').style.display = '';
};


//Return an form to edit user information
const createEditUserForm = () => {
    //Grab existing data
    username = document.getElementById('username').innerHTML;
    fname = document.getElementById('fname').innerHTML;
    lname = document.getElementById('lname').innerHTML;
    email = document.getElementById('email').innerHTML;

    //Insert data into an object for easy access
    userInfo = {'first name': fname, 
                'last name': lname, 
                'email': email,
            };
    
    //Hide edit user buttons and existing details
    document.querySelector('#edit-user').style.display = 'none';
    document.querySelector('div.user-det').style.display = 'none';

    //Create Form
    form = document.createElement('form');
    form.setAttribute('action', '/api/edit_user');
    form.setAttribute('method', 'POST');
    form.setAttribute('id', 'user-form');

    //Create fieldset
    fs = document.createElement('fieldset');
    fs.setAttribute('id', 'edit-user');

    //Add hidden input elements containing user info prior to changes
    for (const userField in userInfo) {
        input = document.createElement('input');
        input.setAttribute('name', `old-${userField.split(' ').join("-")}`);
        input.setAttribute('type', 'hidden');
        input.setAttribute('value', `${userInfo[userField]}`);
        fs.appendChild(input);
    };


    //Add input elements and append to fieldset
    for (const userField in userInfo) {
        input = document.createElement('input');
        input.setAttribute('class', 'edit-user');
        input.setAttribute('id', `edit-${userField.split(' ').join("-")}`);
        input.setAttribute('name', `edit-${userField.split(' ').join("-")}`);
        input.setAttribute('type', 'text');
        input.setAttribute('placeholder', userField)
        input.setAttribute('value', `${userInfo[userField]}`);
        fs.appendChild(input);
        br2 = document.createElement('br')
        fs.appendChild(br2);
    };

    //Create 'save', 'cancel', and 'change password' buttons
    const btnGrp = document.createElement('div');
    btnGrp.setAttribute('class', 'btn-group');
    btnGrp.setAttribute('role', 'group');
    btnGrp.setAttribute('id', 'edit-user-bgrp');
    saveBtn = createSaveBtn();
    saveBtn.setAttribute('form', 'user-form');
    saveBtn.setAttribute('id', 'save-user-chg');
    btnGrp.appendChild(saveBtn);

    cancelBtn = createCancelBtn(cancelUserChgs);
    btnGrp.appendChild(cancelBtn);

    pwdBtn = createPasswordBtn();
    btnGrp.appendChild(pwdBtn);

    fs.appendChild(btnGrp);

    //Append fieldset to form
    form.appendChild(fs);

    return form;
}

//Return an 'Change Password' form
const createEditPasswordForm = () => {

    //Create form
    form = document.createElement('form')
    form.setAttribute('action', '/api/edit_password');
    form.setAttribute('method', 'POST');
    form.setAttribute('id', 'password-form');

    //Create input
    input = document.createElement('input');
    input.setAttribute('class', 'edit-user');
    input.setAttribute('id', `edit-password`);
    input.setAttribute('name', `edit-password`);
    input.setAttribute('type', 'password');
    input.setAttribute('placeholder', 'password')

    //Create save and cancel buttons
    saveBtn = createSaveBtn();
    cancelBtn = createCancelBtn(cancelPwdChgs);

    //Add input and button elements to form
    form.appendChild(input);
    form.appendChild(saveBtn);
    form.appendChild(cancelBtn);

    return form;
}

//Make user information changes submitted by user
const editUser = () => {
    btn = document.querySelector('#save-user-chg');
    btn.addEventListener('click');
};


// const showCLocAutoComplete = () => {

//     //Hide edit user buttons and existing details
//     document.querySelector('#edit-user').style.display = 'none';
//     document.querySelector('div.user-det').style.display = 'none';

//     //Get profile section
//     const section = document.querySelector('#profile');

//     //Create autocomplete and attach to profile section
//     const acdiv = document.createElement('div');
//     acdiv.setAttribute('id', 'autocomplete');

//     const autocomplete = new google.maps.places.Autocomplete(
//         acdiv, {
//         componentRestrictions: {'country': 'us'}
//         });

//     autocomplete.addEventListener('place_changed', saveCLocBtn);

//     section.appendChild(acdiv);
// };

const saveCLocBtn = () => {

    document.getElementById('autocomplete');

    const place = autocomplete.getPlace();

    const btn = createElement('button');
    btn.setAttribute('type', 'submit');
    btn.setAttribute('class', 'btn');
    btn.setAttribute('onclick', saveCLoc);
    btn.innerHTML = 'Save';

    return place
};

// const saveCLoc = (place) => {

//     const data = {'address': place.formatted_address,
//                   'latitude': place.geometry.latitude,
//                   'longitude': place.geometry.longitude,
//                   'name': place.name};

//     let fetchData = {
//         method:'POST',
//         body: JSON.stringify(data),
//         headers: {
//             'Content-Type': 'application/json'
//         },
//     };

//     fetch('/api/save_commute_loc', fetchData)
//     .then(response => response.json())
//     .then(response => {
//         if (data['success'] === true) {
//             document.reload();
//         } else {
//             alert(`Error: ${data['error']}`)
//         }
//     })
// };


//Delete user from database and load homepage
const removeUser = () => {
    fetchData = {
        method:'POST'
    };
    fetch('/api/remove_user', fetchData)
    .then(response => response.json())
    .then(data => {
        if (data['success'] === true) {
            alert('User removed successfully');
            document.location.assign('/')
        } else {
            alert(`${data['error']}`);
            document.location.reload();
        };
    });
};





(function runUsers() {

    const container = document.getElementById('container');

    const editUserBtn = document.querySelector('button#edit-user-btn.crud');

    editUserBtn.onclick = () => {
        newForm = createEditUserForm();
        document.querySelector('div#user-card.card').append(newForm)
    };

    const removeUserBtn = document.querySelector('button#remove-user-btn.crud');
    removeUserBtn.onclick = removeUser;

    const navform = document.getElementById('nav-base');
    const logOutBtn = createLogOutBtn()
    navform.appendChild(logOutBtn)

    // const addCommuteBtn = document.querySelector('button#add-commute-loc-btn');
    // addCommuteBtn.addEventListener('click', () => {
    //     evt.preventDefault();
    //     showCLocAutoComplete()});

    


})();




