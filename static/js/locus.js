


const generateCategories = () => {
    fetch('/api/place_categories')
        .then(response => response.json())
        .then((data) => {
            for (const category of data){
                const btn = document.createElement('button');
                btn.innerHTML = category;

                document.querySelector('#criteria-container').append(btn);
            };
        });
};


const generatePlaceTypes = (selectedCategory) => {

    cc = document.querySelector('#criteria-container')

    const f = document.createElement('form');
    f.setAttribute("action", "/api/setcriteria");
    f.setAttribute("method", "POST");
    cc.appendChild(f);

    fetch('/api/place_types')
        .then(response => response.json())
        .then((data) => {

            console.log(data);
            console.log(selectedCategory);
            placeTypes = data[selectedCategory];
            console.log('placetypes', placeTypes)
            
            const l = document.createElement('label');
            l.innerHTML = "Choose Place Type";
            f.appendChild(l)

            input = document.createElement('input');
            input.setAttribute('type','text');
            input.setAttribute('id', 'place-type');
            input.setAttribute('name', 'place-type');
            input.setAttribute('list', 'place-types');
            f.appendChild(input);

            d = document.createElement('datalist');
            d.setAttribute('id', 'place-types');

            for (placeType of placeTypes) {
                option = document.createElement('option');
                option.setAttribute('value', placeType);
                option.innerHTML = (placeType.charAt(0).toUpperCase() + placeType.slice(1));
                d.appendChild(option);
            };
            f.appendChild(d);
        });
};

(function run_locus() {

    generateCategories();

    Array.from(document.querySelectorAll('button'))
        .forEach((btn) => {
            btn.addEventListener('click', (evt) => {
                const clickedBtn = evt.target.innerText;
                generatePlaceTypes(clickedBtn);
            });
        });
})();


            


