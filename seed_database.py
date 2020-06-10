import os
import crud, model, server
from random import randint, choice
import json

os.system('dropdb locus')
os.system('createdb locus')

model.connect_to_db(server.app)
model.db.create_all()

with open('static/categories.json', 'r') as read_file:
    data = json.load(read_file)
    for category in data:
        categories = category['parents']
        this_category = None if categories == [] else categories[0]
        place_type = model.PlaceType(place_type_id=category['alias'], 
                                     title=category['title'],
                                     category=this_category)
        model.db.session.add(place_type)
        model.db.session.commit()


# b = model.PlaceType.query.filter(model.PlaceType.place_type_id=='Bubble Tea')

model.example_data()

harry = model.User.query.filter_by(user_id=1).first()
fm = harry.locations[0]