import os
import crud, model, server
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
        if yparent and (pc.filter_by(place_category_id=yparent[0]).first() == None):
            new_cat = model.PlaceCategory(place_category_id=yparent[0])
            session.add(new_cat)
            session.commit()
            place_type = model.PlaceType(place_type_id=category['alias'], 
                                     title=category['title'],
                                     place_category_id=yparent[0])
        else:
            place_type = model.PlaceType(place_type_id=category['alias'], 
                                     title=category['title'])
        session.add(place_type)
        session.commit()


model.example_data()

harry = model.User.query.filter_by(user_id=1).first()
fm = harry.locations[0]