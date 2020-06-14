// crud script for editing user's location criteria

const hideCriteriaDetails = () => {
    document.querySelector('ul.crit-det').style.display = 'none';
};

const showCriteriaDetails = () => {
    document.querySelector('ul.crit-det').style.display = '';
};

const hideCategories = () => {
    document.querySelector('fieldset#cat-fieldset').style.display = 'none';
};

const showCategories = () => {
    document.querySelector('fieldset#cat-fieldset').style.display = '';
};

const hideCritBtns = () => {
    document.querySelector('fieldset#crit-btns').style.display = 'none';
}

const showCritBtns = () => {
    document.querySelector('fieldset#crit-btns').style.display = '';
}


//Generate buttons of place categories for user to select
const generateCategories = () => {
    fetch('/api/place_categories')
        .then(response => response.json())
        .then((data) => {
            fs = document.createElement('fieldset');
            fs.setAttribute('id', 'cat-fieldset')
            for (const category of data){
                const btn = document.createElement('button');
                btn.setAttribute('id', `${category}`);
                btn.innerHTML = category;
                btn.addEventListener('click', (evt) => {
                    fs.setAttribute('disabled', true);
                    const clickedBtn = evt.target.innerText;
                    createCriteriaForm(clickedBtn);
                });
                fs.appendChild(btn);
            document.querySelector('#criterion-card').append(fs);
            };
        });
};

//Create a form for user to set place criteria and importance
const createCriteriaForm = (selectedCategory) => {

    cc = document.querySelector('#criterion-card')
    
    //Create form element
    const f = document.createElement('form');
    f.setAttribute("action", "/api/set_criteria");
    f.setAttribute("method", "POST");
    f.setAttribute("id", "criteria-form");

    ptInput = document.createElement('input');
    ptInput.setAttribute('type','text');
    ptInput.setAttribute('id', 'place-type');
    ptInput.setAttribute('name', 'place-type');
    ptInput.setAttribute('list', 'place-types');
    ptInput.setAttribute('placeholder', 'Select Place Type');
    f.appendChild(ptInput);

    //Get place types json from server and convert back to array.
    fetch(`/api/place_types/${selectedCategory}`)
    .then(response => response.json())
    .then(data => {

        //Array of place types in alpha order
        placeTypes = data[selectedCategory];
        console.log(placeTypes)

        //Create dropdown menu and append to form
        let d = document.createElement('datalist');
        d.setAttribute('id', 'place-types');


        //Loop through placeTypes array and make each of those an option
        for (placeType of placeTypes) {
            option = document.createElement('option');
            option.setAttribute('value', placeType);
            option.innerHTML = (placeType.charAt(0).toUpperCase() + placeType.slice(1));
            d.appendChild(option);
        };

        f.appendChild(d);

        //Create input element for importance menu
        impInput = document.createElement('input');
        impInput.setAttribute('id', 'importance');
        impInput.setAttribute('name', 'importance');
        impInput.setAttribute('list', 'importance-rating');
        impInput.setAttribute('placeholder', 'Select Importance');
        f.appendChild(impInput);

        f.appendChild(generateImportanceMenu());
        f.appendChild(createSaveBtn());

        cc.appendChild(f);
        return f;
 
    });
};


const saveCriteria = (btn) => {
    btn.setAttribute('disabled', true)
    getElementById('form', 'criteria-form').submit()
}


const addCategoryListeners = () => {
    Array.from(document.querySelectorAll('button'))
        .forEach((btn) => {
            btn.addEventListener('click', (evt) => {
                fs = document.getElementById('cat-fieldset');
                fs.setAttribute('disabled', true);
                const clickedBtn = evt.target.innerText;
                generatePlaceTypes(clickedBtn);
            });
        });
}


//Create dropdown menu to select importance criteria
const generateImportanceMenu = () => {
    //Create dropdown menu

    let d = document.createElement('datalist');
    d.setAttribute('id', 'importance-rating');

    //Loop through placeTypes array and make each of those an option
    let num = 1
    while (num < 6) {
        option = document.createElement('option');
        option.setAttribute('value', num.toString());
        option.innerHTML = num.toString();
        d.appendChild(option);
        num += 1;
    };
    return d;
}



//Sets 'disabled' attribute of all place-category buttons to 'false'
const resetCategories = () => {
    categoryButtons = document.getElementById('cat-fieldset')
    categoryButtons.setAttribute('disabled', false)
};


(function run_locus() {
    const addCritBtn = document.querySelector('button#add-crit.crud');

    addCritBtn.addEventListener('click', ()=> {
        hideCritBtns();
        generateCategories();


    });


})();
