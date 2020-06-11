"""CRUD Operations"""

from model import (User, Location, LocationPlaceCriterion, PlaceCriterion, 
                   PlaceType, PlaceCategory, db, connect_to_db)
import os
import googlemaps

API_KEY = os.environ['GOOGLE_TOKEN']

gmaps = googlemaps.Client(key=API_KEY)

CATEGORIES = ['active', 'arts', 'education', 'fitness', 'food', 'health', 'restaurants', 'shopping']


def create_user(email, first_name, last_name, password):
    """Create and return new user."""

    new_user = User(email=email, 
                    first_name=first_name, 
                    last_name=last_name, 
                    password=password,
                    )
    db.session.add(new_user)
    db.session.commit()

    return new_user


def get_user_by_id(user_id):
    """Return user given user_id"""

    return User.query.get(user_id)


def get_user_by_email(email):
    """Return user given an email"""

    return User.query.filter(User.email == email).first()


def get_user_locations_by_user(user):
    """Return a list of user_locations given user"""

    return user.user_locations


def get_user_location_by_name(user, user_location_name='home'):
    """Return a user_location object given user and user location name"""

    lq = Location.query

    return lq.filter(Location.user_id == user.user_id,
                          Location.name == Location_name).one()


def modify_email(user, new_email):
    """Given user object and new_email, modify user's email attribute"""

    user.email = new_email

    return user


def modify_password(user, new_password):
    """Given user object and new_email, modify user's password"""

    user.password = new_email

    return user_id


def modify_user_location(user, new_address, user_location_name='home'):
    """Modify address given existing user and user_location"""

    user_location = get_user_location_by_name(user, user_location_name)

    geocode_results = gmaps.geocode(address)
    location = geocode_results[0]['geometry']['location']
    user_location.latitude = location['lat']
    user_location.longitude = location['lng']
    user_location.address = geocode_results[0]['formatted_address']

    return user_location
        

def verify_password_by_email(email, password):
    """Return boolean whether password given user provided email and password"""

    user = get_user_by_email(email)

    return user.password == password


def delete_user(email):
    """Delete a user provided the user's email"""

    user = get_user_by_email(email)
    db.session.delete(user)
    db.session.commit()


def delete_user_location(user_location):
    """Delete provided user_location"""

    db.session.delete(user_location)
    db.session.commit()


def get_location_by_id(location_id):
    """Get location by id"""

    return Location.query.filter_by(location_id=location_id).first()


def add_location_place_criterion(location_id, criterion_id, meets_criterion):
    """Create new entry into location place criterion"""

    lpc = LocationPlaceCriterion(location_id=location_id, 
                                criterion_id=criterion_id, 
                                meets_criterion=meets_criterion,
                                )
    db.session.add(lpc)
    db.session.commit()

    return lpc


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


if __name__ == '__main__':
    from server import app

    # Call connect_to_db(app, echo=False) if your program output gets
    # too annoying; this will tell SQLAlchemy not to print out every
    # query it executes.

    connect_to_db(app)
