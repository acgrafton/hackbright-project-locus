
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
                    btn.setAttribute('disabled', true);
                    const clickedBtn = evt.target.innerText;
                    createCriteriaForm(clickedBtn);
                });
                fs.appendChild(btn);
            document.querySelector('#criteria-container').append(fs);
            };
        });
};

//Create a form for user to set place criteria and importance
const createCriteriaForm = (selectedCategory) => {

    cc = document.querySelector('#criteria-container')
    
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


// Given selected category, generates form with dropdown menu for place type
// let generatePlaceTypes = (selectedCategory) => {

//     //Get place types json from server and convert back to array.
//     fetch(`/api/place_types/${selectedCategory}`)
//     .then(response => response.json())
//     .then(data => {

//         console.log(data);

//         //Array of place types in alpha order
//         placeTypes = data[selectedCategory];
//         console.log(placeTypes)

//         //Create dropdown menu and append to form
//         let d = document.createElement('datalist');
//         d.setAttribute('id', 'place-types');

//         //Loop through placeTypes array and make each of those an option
//         for (placeType of placeTypes) {
//             option = document.createElement('option');
//             option.setAttribute('value', placeType);
//             option.innerHTML = (placeType.charAt(0).toUpperCase() + placeType.slice(1));
//             d.appendChild(option);
//         };
//     });
// };

const createSaveBtn = () => {
    let s = document.createElement('button');
    s.setAttribute('name', 'save');
    s.setAttribute('value', 'Save')
    s.setAttribute('id', 'save');
    s.setAttribute('onclick', 'saveCriteria()');
    s.innerHTML = 'Save';
    return s;
}

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

//Return an 'Add More' button that resets categories when clicked 
const addMoreButton = () => {
    btn = document.createElement('button');
    btn.setAttribute('id', 'add-more');
    btn.setAttribute('onclick', 'resetCategories()');
    btn.innerHTML = 'Add More';
    return btn
}

//Sets 'disabled' attribute of all place-category buttons to 'false'
const resetCategories = () => {
    categoryButtons = document.getElementById('cat-fieldset')
    categoryButtons.setAttribute('disabled', false)
};


(function run_locus() {

    generateCategories();




    // document.querySelector('#add-more')
    //     .addEventListener('click', () => {
    //         run_locus()
    //     })

    // document.querySelector('#save')
    //     .addEventListener('click', () => {
    //         f = document.getElementById('criteria-form')
    //         f.onsubmit()

    //     })
})();
