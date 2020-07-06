"""CRUD Operations to manage changes and query database"""

import os
import re
import requests
from model import (User, Location, PlaceType, PlaceCategory, Score, 
                   LocPlCriterion, CommuteLocation, db, connect_to_db)
import googlemaps
# from datetime import datetime


API_KEY = os.environ['GOOGLE_TOKEN']
YELP_TOKEN = os.environ['YELP_TOKEN']

gmaps = googlemaps.Client(key=API_KEY)

CATEGORIES = ['active', 'hotelstravel', 'arts', 'restaurants', 'grocery', 
                 'homeandgarden', 'education', 'utilities', 'auto', 
                 'localservices', 'financialservices', 'laundryservices',
                 'petservices', 'beautysvc', 'gym', 'publicservicesgovt',
                 'religiousorgs', 'shopping', 'martialarts', 'food', 'health']

CORE_CAT = ['banks', 'hospitals']

def create_user(email, username, first_name, last_name, password):
    """Create and return new user."""

    new_user = User(email=email, 
                    username=username,
                    first_name=first_name, 
                    last_name=last_name, 
                    password=password,
                    )
    db.session.add(new_user)
    db.session.commit()

    return new_user


def get_user(username_or_email):
    """Return user given username or email"""

    if re.fullmatch(r"/(\w+)\@(\w+)\.(\w+)/", username_or_email):
        return User.query.filter(User.email == username_or_email).first()

    return User.query.filter(User.username == username_or_email).first()


def delete_user(username):
    """Delete a user"""

    user = get_user(username)
    db.session.delete(user)
    db.session.commit()

def modify_email(user, new_email):
    """Given user object and new_email, modify user's email attribute"""

    user.email = new_email

    return user


# def modify_password(user, new_password):
#     """Given user object and new_email, modify user's password"""

#     user.password = new_email

#     return user.user_id
      

def verify_password(username, password):
    """Return boolean whether password given user provided email and password"""

    user = get_user(username)

    return user.password == password


def get_location_by_id(address):
    """Get location by id"""

    return Location.query.filter_by(address=address).first()


def get_place_type_ids_by_category(category):
    """Return a list of available place types"""

    pcatq = PlaceCategory.query

    place_types = pcatq.filter_by(place_category_id=category).first().place_types

    list_place_type = []

    for place_type in place_types:
        list_place_type.append(place_type.title)

    return list_place_type

def get_place_categories():
    """Return a limited list of place_categories"""

    pcatq = PlaceCategory.query

    return pcatq.filter(PlaceCategory.place_category_id.in_(CATEGORIES)).all()


def get_place_type_id_by_title(place_type_title):
    """Return place type id given the title"""

    ptq = PlaceType.query

    return ptq.filter(PlaceType.title == place_type_title).first().place_type_id


def del_score(score_id):
    """Delete a score object from a user"""
  
    score = Score.query.get(score_id)

    db.session.delete(score)
    db.session.commit()


def batch_add_pl_crit(user, place_types):
    """Given a user and a dictionary of with place_types as keys and
    specific business name as the value, create Place Crit objects and return
    a list"""
    
    print(place_types)

    return [user.add_place_criterion(place, 5) for place in place_types]


def create_loc(geocode):
    """Given geocode dict (including point, lat, long, address)"""

    location = Location(address=geocode['address'],
                        latitude=geocode['point']['lat'],
                        longitude=geocode['point']['lng'],
                        )

    db.session.add(location)
    db.session.commit()

    return location




if __name__ == '__main__':
    from server import app

    # Call connect_to_db(app, echo=False) if your program output gets
    # too annoying; this will tell SQLAlchemy not to print out every
    # query it executes.

    connect_to_db(app)
