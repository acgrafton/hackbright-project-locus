"""CRUD Operations"""

from model import db, User, User_location, connect_to_db
import os
import googlemaps

API_KEY = os.environ['GOOGLE_TOKEN']

gmaps = googlemaps.Client(key=API_KEY)

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

def add_home(address):
    """Add 'home' user_location to database"""

    geocode_results = gmaps.geocode(address)
    location = geocode_results[0]['geometry']['location']
    latitude = location['lat']
    longitude = location['lng']
    address = geocode_results[0]['formatted_address']
    # timezone = gmaps.timezone(location)['timeZoneName']

    home = User_location(user_loc_id='home',
                         address=address,
                         latitude=latitude,
                         longitude=longitude,
                         # timezone=timezone,
                        )
    db.session.add(home)
    db.session.commit()

    return location

if __name__ == '__main__':
    from server import app

    # Call connect_to_db(app, echo=False) if your program output gets
    # too annoying; this will tell SQLAlchemy not to print out every
    # query it executes.

    connect_to_db(app)
