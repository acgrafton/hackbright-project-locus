//crud script for editing user profile information

//Remove form and revert back to showing user profile details
const cancelUserChgs = () => {
    
    let card = document.querySelector('div#user-card.card');
    let form = document.querySelector('form#user-form');
    card.removeChild(form);

    document.querySelector('ul.user-det').style.display = '';
    document.querySelector('fieldset#edit-user').style.display = '';
}

const cancelPwdChgs = () => {
    document.querySelector('form#password-form').style.display = 'none';
    showUserForm();
}

const hideUserDetails = () => {
    document.querySelector('div#user-card.card').style.display = 'none';
}

const showUserDetails = () => {
    document.querySelector('div#user-card.card').style.display = '';
};

const hideUserForm = () => {
    document.querySelector('form#user-form').style.display = 'none';
}

const showUserForm = () => {
    document.querySelector('form#user-form').style.display = '';
}


//Create Edit User Form
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
    document.querySelector('fieldset#edit-user').style.display = 'none';
    document.querySelector('ul.user-det').style.display = 'none';

    //Create Form
    form = document.createElement('form');
    form.setAttribute('action', '/api/edit_user');
    form.setAttribute('method', 'POST');
    form.setAttribute('id', 'user-form');

    //Create fieldset
    fs = document.createElement('fieldset');
    fs.setAttribute('id', 'edit-user');

    //Create username field (non-editable)
    span = document.createElement('span');
    span.innerHTML = username;
    fs.appendChild(span);
    br1 = document.createElement('br');
    fs.appendChild(br1);

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

    //Create and add cancel and save buttons
    saveBtn = createSaveBtn();
    saveBtn.setAttribute('form', 'user-form');



    fs.appendChild(saveBtn);
    cancelBtn = createCancelBtn(cancelUserChgs);
    fs.appendChild(cancelBtn);
    pwdBtn = createPasswordBtn();
    fs.appendChild(pwdBtn);

    //Append fieldset to form
    form.appendChild(fs);

    return form;
}

//Create edit password form
const createEditPasswordForm = () => {

    //Create form
    form = document.createElement('form')
    form.setAttribute('action', 'api/edit_password');
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
    form.addChild(input)
    form.addChild(saveBtn)
    form.addChild(cancelBtn)

    return form
}


(function runUserScript() {
    let editUserBtn = document.querySelector('button#edit-user-btn.crud');

    editUserBtn.addEventListener('click', () => {
        newForm = createEditUserForm();
        document.querySelector('div#user-card.card').append(newForm)
    });

})();




