import os
import model, server
from crud import CATEGORIES
from random import randint, choice
import json

os.system('dropdb locus')
os.system('createdb locus')

model.connect_to_db(server.app)
model.db.create_all()

pc = model.PlaceCategory.query
session = model.db.session

with open('static/categories.json', 'r') as read_file:
    data = json.load(read_file)
    for category in data:
        yparent = category['parents']

        if yparent and not pc.filter_by(place_category_id=yparent[0]).first():

            if yparent[0] in CATEGORIES:
                new_cat = model.PlaceCategory(place_category_id=yparent[0])
                session.add(new_cat)
                session.commit()
                place_type = model.PlaceType(place_type_id=category['alias'], 
                                         title=category['title'],
                                         place_category_id=yparent[0])
        elif yparent:
            place_type = model.PlaceType(place_type_id=category['alias'], 
                                    title=category['title'],
                                    place_category_id=yparent[0])

        session.add(place_type)
        session.commit()

categories = model.PlaceCategory.query.all()
places = model.PlaceType.query.all()

grocery = model.PlaceCategory(place_category_id='grocery')
session.add(grocery)
session.commit()

grocery_stores = ['grocery','intlgrocery','ethicgrocery','farmersmarket', 'importedfood']

for place in places:
    if place.place_type_id in grocery_stores:
        place.place_category_id = 'grocery'
        session.commit()


model.example_data()
