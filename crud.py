"""CRUD Operations to manage changes and query database"""

import os
import re
from model import (User, Criterion, PlaceType, Location, LocCrit, Score,
                   db, connect_to_db)
import googlemaps
# from datetime import datetime
from score_logic import yelp, get_matches, calcScore


API_KEY = os.environ['GOOGLE_TOKEN']
YELP_TOKEN = os.environ['YELP_TOKEN']

gmaps = googlemaps.Client(key=API_KEY)

CATEGORIES = {'restaurants': 'Restaurants', 'education': 'Education', 'financialservices': 'Financial Services',
              'petservices': 'Pet Services', 'gym': 'Gym', 'publicservicesgovt': 'Government',
              'religiousorgs': 'Religious', 'shopping': 'Shopping', 'food': 'Food', 'health': 'Health'}


def create_user(email, first_name, last_name, password):
    """Create and return new user."""

    new_user = User(email=email, fname=first_name, lname=last_name, pw=password)
    db.session.add(new_user)
    db.session.commit()
    return new_user

def get_user(email):
    """Return user (object) given username or email"""
    return User.query.get(email)

def get_user_info(email):
    return get_user(email).info()

def delete_user(email):
    """Delete a user"""
    user = get_user(email)
    db.session.delete(user)
    db.session.commit()

def modify_email(user, new_email):
    """Given user object and new_email, modify user's email attribute"""
    user.set_email(new_email)

def modify_password(user, new_password):
    """Given user object and new_email, modify user's password"""
    user.set_pw(new_password)

def verify_password(username, password):
    """Return boolean whether password given user provided email and password"""
    user = get_user(username)
    return user.get_pw() == password

def del_score(score_id):
    """Delete a score object from a user"""
    score = Score.query.get(score_id)
    db.session.delete(score)
    db.session.commit()

def strLatLong(lat, lng):
    return ",".join([str(lat), str(lng)])

def create_loc(geocode):
    """Given geocode dict (including point, lat, long, address)"""
    latitude=geocode['point']['lat']
    longitude=geocode['point']['lng']
    location = Location(latlong=strLatLong(latitude, longitude),
                        address=geocode['address'],
                        latitude=latitude,
                        longitude=longitude,
                        )
    db.session.add(location)
    db.session.commit()
    return location

def get_loc(geocode):
    lat = geocode['point']['lat']
    lng = geocode['point']['lng']
    latlong = strLatLong(lat, lng)
    return Location.query.filter_by(latlong=latlong).first()

def score_location(email, geocode):
    loc = get_loc(geocode)
    if loc is None:
        loc = create_loc(geocode)
    score = get_score(email, loc)
    if score is not None:
        db.session.delete(score)
    new_score = calcScore(email, loc)
    return new_score.info()

def get_scores(email):
    """Return a list of score dictionaries"""
    return [score.info() for score in get_user(email).scores]

def get_score(email, loc):
    return Score.query.filter_by(latlong=loc.latlong, email=email).first()

def get_place_types():
    return sorted([place_type.info() for place_type in PlaceType.query.all()], key=lambda placetype: placetype['parent'])

def add_criterion(email, place_type, dow, tod, mode):
    if Criterion.query.filter_by(place_type_alias=place_type).first() is None:
        new_crit = get_user(email).add_crit(place_type, dow, tod, mode)
        return new_crit.info()

def get_criterion(crit_id):
    return Criterion.query.get(crit_id)

def get_criteria(email):
    return get_user(email).get_criteria()

def del_criterion(crit_id):
    db.session.delete(get_criterion(crit_id))
    db.session.commit()


if __name__ == '__main__':
    from server import app

    # Call connect_to_db(app, echo=False) if your program output gets
    # too annoying; this will tell SQLAlchemy not to print out every
    # query it executes.

    connect_to_db(app)
