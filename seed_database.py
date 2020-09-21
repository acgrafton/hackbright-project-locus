import os
from server import app
from model import db, connect_to_db, PlaceType
import json
import requests


os.system('dropdb locus')
os.system('createdb locus')
connect_to_db(app)
db.create_all()

YELP_TOKEN = os.environ['YELP_TOKEN']

CATEGORIES = {'restaurants': 'Restaurants', 'education': 'Education', 'financialservices': 'Financial Services',
              'petservices': 'Pet Services', 'gym': 'Gym', 'publicservicesgovt': 'Government',
              'religiousorgs': 'Religious', 'shopping': 'Shopping', 'food': 'Food', 'health': 'Health'}


def populatePlaceTypes():
    url = "https://api.yelp.com/v3/categories?locale=en_US"
    payload = {}
    headers = {
    'Authorization': 'Bearer ' + YELP_TOKEN
    }
    response = requests.request("GET", url, headers=headers, data = payload).json()
    categories = response['categories']

    for cat in categories:
        if cat['parent_aliases'] and cat['parent_aliases'][0] in CATEGORIES:
            alias = cat['alias']
            title = cat['title']
            parent = None if not cat['parent_aliases'] else cat['parent_aliases'][0]
            new_place_type = PlaceType(alias=alias, desc=title, parent=parent)
            db.session.add(new_place_type)
            db.session.commit()

        elif cat['alias'] in CATEGORIES:
            alias = cat['alias']
            title = cat['title']
            parent = cat['alias'] if not cat['parent_aliases'] else cat['parent_aliases'][0]
            new_place_type = PlaceType(alias=alias, desc=title, parent=parent)
            db.session.add(new_place_type)
            db.session.commit()


if __name__ == "__main__":
    populatePlaceTypes()
    print(PlaceType.query.all())