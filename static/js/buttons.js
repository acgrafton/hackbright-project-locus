//All buttons for User Profile page

const createCancelBtn = (cancelFunction) => {
    const btn = document.createElement('button');
    btn.setAttribute('class', 'cancel');
    btn.addEventListener('click', (evt) => {
        evt.preventDefault();
        cancelFunction();
    });
    btn.innerHTML = 'Cancel';
    return btn;
};

//Return an 'Add More' button that resets categories when clicked 
const addMoreButton = () => {
    btn = document.createElement('button');
    btn.setAttribute('id', 'add-more');
    btn.setAttribute('onclick', 'resetCategories()');
    btn.innerHTML = 'Add More';
    return btn
}

const createSaveBtn = () => {
    let btn = document.createElement('button');
    btn.setAttribute('type', 'submit');
    btn.innerHTML = 'Save';
    return btn;
}

const createPasswordBtn = () => {
    let btn = document.createElement('button');
    btn.setAttribute('id', 'change-password');
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


//Return an 'Add' button
const createAddButton = (addFunction) => {
    btn = document.createElement('button');
    btn.setAttribute('onclick', 'addFunction');
    btn.innerHTML = 'Add';
    return btn
}


(function runButtons() {

})();
