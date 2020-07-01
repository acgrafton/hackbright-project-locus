"use strict";

const createSignUpForm = () => {

    const div = document.createElement('div')

    const form = document.createElement('form')
    form.setAttribute('id', 'sign-up-form')

    const formGroup = document.createElement('div');
    formGroup.setAttribute('class', 'form-group');

    const fields = {'email': 'email', 'username': 'username', 'firstName': 'first name', 'lastName': 'last name', 'password': 'password'};

    for (const [name, display] of Object.entries(fields)) {
        const label  = document.createElement('label');
        label.setAttribute('for', name);
        label.innerHTML = display;

        const input = document.createElement('input');
        input.setAttribute('name', name);
        const inputType = (name === 'email' ? 'email':
                                    name === 'password' ? 'password':
                                    'text');
        input.setAttribute('type', inputType);
        input.setAttribute('id', `signup-${name}`);

        const br = document.createElement('br');
        
        formGroup.appendChild(label);
        label.after(input);
        input.after(br);
    }
    
    form.appendChild(formGroup);

    form.addEventListener('submit', (e) => {
        console.log(e);
        e.preventDefault();
    
        let fetchData = {
            method: 'POST',
            body: new FormData(form),
        };
    
        fetch('/api/new_user', fetchData)
        .then(response => response.json())
        .then(data => {
            if (data['success'] === true) {
                alert('You have successfully signed up.')
                document.location.assign('/questionaire')
            } else {
                alert('Unable to create account. Please try again')
            }
        });
    });

    div.appendChild(form);

    return div;
}

const createLogInForm = () => {

    const div = document.createElement('div')

    const form = document.createElement('form')
    form.setAttribute('id', 'login-form')

    const formGroup = document.createElement('div');
    formGroup.setAttribute('class', 'form-group');

    const fields = {'username': 'username', 'password': 'password'};

    for (const [name, display] of Object.entries(fields)) {
        const label  = document.createElement('label');
        label.setAttribute('for', name);
        label.innerHTML = display;

        const input = document.createElement('input');
        input.setAttribute('name', name);
        const inputType = (name === 'password' ? 'password': 'text');
        input.setAttribute('type', inputType);
        input.setAttribute('id', `login-${name}`);

        const br = document.createElement('br');
        
        formGroup.appendChild(label);
        label.after(input);
        input.after(br);
    }
    
    form.appendChild(formGroup);
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        let fetchData = {
            method: 'POST',
            body: new FormData(form),
        };
        
        fetch('/api/login', fetchData)
        .then(response => response.json())
        .then(data => {
            if (data['success'] === true) {
                alert(`Welcome back ${data['first_name']}!`)
                document.location.assign(`/profile/${data['username']}`)
            } else {
                alert(data['err'])
            }
        });
    })

    div.appendChild(form);

    return div
}

const createModalAccessBtn = () => {
    const btn = document.createElement('button')
    btn.setAttribute('class', 'btn btn-primary')
    btn.setAttribute('type', 'button')
    btn.setAttribute('data-toggle', 'modal')
    btn.setAttribute('data-target', '#home-modal')

    return btn
}

const setHomeNavBarBtns = () => {

    const navform = document.getElementById('nav-form');

    const formLookUp = {'signup-btn': {'greeting': 'welcome to locus',
                                    'form': createSignUpForm,
                                    'formid': 'sign-up-form',
                                    'name': 'sign up'},
                        'login-btn': {'greeting': 'welcome back',
                                   'form': createLogInForm,
                                   'formid': 'login-form',
                                    'name': 'log in'}}

    for (const id of Object.keys(formLookUp)) {

        const btn = createModalAccessBtn();
        btn.setAttribute('id', id);
        btn.innerHTML = formLookUp[id]['name']
        
        btn.addEventListener('click', () => {
            const title = document.getElementById('home-modal-title');
            title.innerHTML = formLookUp[id]['greeting'];
            const body = document.getElementById('home-modal-body');
            const form = formLookUp[id]['form']();
            body.appendChild(form);
            const saveBtn = document.getElementById('modal-save');
            saveBtn.innerHTML = 'continue'
            saveBtn.setAttribute('form',formLookUp[id]['formid']);
        });

        navform.appendChild(btn);
    }
    return navform
}

(function displayHomepage() {

    setHomeNavBarBtns();

    const closeBtn = document.getElementById('modal-close')
        closeBtn.addEventListener('click', () => {
            const body = document.getElementById('home-modal-body')
            body.removeChild(body.firstChild);
            document.getElementById('modal-save').removeAttribute('form');
        })

})();
