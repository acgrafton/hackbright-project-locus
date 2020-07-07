//All buttons for User Profile page

const createCancelBtn = (cancelFunction) => {
    const btn = document.createElement('button');
    btn.setAttribute('type', 'button');
    btn.setAttribute('class', 'btn btn-outline-info btn-sm cancel');
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
    btn.setAttribute('class', 'btn btn-outline-success btn-sm')
    btn.innerHTML = 'Save';
    return btn;
}

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


//Return an 'Add' button
const createAddButton = (addFunction) => {
    btn = document.createElement('button');
    btn.setAttribute('onclick', 'addFunction');
    btn.innerHTML = 'Add';
    return btn
}

const logOut = () => {

    fetchData = {
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

const createCard = () => {
    const card = document.createElement('div')
    card.setAttribute('class', 'card text-center h-100')
    const header = document.createElement('div')
    header.setAttribute('class', 'card-header h-25 px-1')
    card.appendChild(header)
    return card
}

const backToProfile = () => {
    document.location.assign('/');
}

(function runBase() {

})();
