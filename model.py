"""Models for locus app."""

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    """A user."""

    __tablename__= "users"

    user_id = db.Column(db.Integer,
                        autoincrement=True,
                        primary_key=True,
                        )
    email = db.Column(db.String, unique=True, nullable=False)
    first_name = db.Column(db.String, nullable=False)
    last_name = db.Column(db.String, nullable=False)
    password = db.Column(db.String, nullable=False)

    #user_locations = a list of User_location objects

    def __repr__(self):
        return "".join((f'<User user_id={self.user_id} ',
                f'name={self.first_name}_{self.last_name} ',
                f'email={self.email}>'))

class User_location(db.Model):
    """User locations i.e. 'home', 'work'."""

    __tablename__ = "user_locations"

    user_loc_id = db.Column(db.String, unique=True, primary_key=True)
    address = db.Column(db.String, nullable=False)
    # postal_code = db.Column(db.Integer, nullable=False)
    # timezone = db.Column(db.String)
    longitude = db.Column(db.Float, nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    alt_name = db.Column(db.String, default=None)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'))

    user = db.relationship('User', backref='user_locations')

    #place_types = a list of Place_type objects

    def __repr__(self):
        return "".join((f'<User Location user_loc_id={self.user_loc_id} ',
                        f'user_id={self.user_id} '
                        f'address={self.address}>'))


class Place_type(db.Model):
    """Place type such as grocery_store, restaurant, or DMV"""

    __tablename__ = "place_types"

    place_type_id = db.Column(db.String, primary_key=True, nullable=False)
    google_place_id = db.Column(db.String, 
                                db.ForeignKey('places.google_place_id'),
                                )
    user_loc_id = db.Column(db.String, 
                            db.ForeignKey('user_locations.user_loc_id'),
                            )

    place = db.relationship('Place', backref='place_types')
    user_location = db.relationship('User_location', backref='place_types')

    def __repr__(self):
        return f'<Place Type place_type_id={self.place_type_id}>\
                             google_place_id={self.google_place_id}>\
                             user_loc_id={self.user_loc_id}'


class Place(db.Model):
    """ A place. """

    __tablename__="places"

    google_place_id = db.Column(db.String, primary_key=True, nullable=False)
    name = db.Column(db.String, nullable=False)
    address = db.Column(db.String, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    url = db.Column(db.String)
    review_score = db.Column(db.Integer)
    hours = db.Column(db.String)

    def __repr__(self):
        return f'<Place google_place_id={self.google_place_id}\
                        name={self.name}'

class Travel_time_distance(db.Model):
    """Travel time and travel distance from given user location and place."""

    __tablename__="travel_time_distance"

    travel_time_distance_id = db.Column(db.Integer,
                                        primary_key=True, 
                                        autoincrement=True, 
                                        nullable=False,
                                        )
    user_loc_id = db.Column(db.String,
                            db.ForeignKey('user_locations.user_loc_id'),
                            )
    google_place_id = db.Column(db.String, 
                                db.ForeignKey('places.google_place_id'),
                                )
    distance = db.Column(db.Integer, nullable=False)
    travel_time = db.Column(db.Integer, nullable=False)

    place = db.relationship('Place', backref='travel_time_distance')
    user_location = db.relationship('User_location', backref='travel_time_distance')




def connect_to_db(flask_app, db_uri='postgresql:///locus', echo=False):
    flask_app.config['SQLALCHEMY_DATABASE_URI'] = db_uri
    # flask_app.config['SQLALCHEMY_ECHO'] = echo
    flask_app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.app = flask_app
    db.init_app(flask_app)

    print('Connected to the db!')



# if __name__ == '__main__':
#     from server import app

#     # Call connect_to_db(app, echo=False) if your program output gets
#     # too annoying; this will tell SQLAlchemy not to print out every
#     # query it executes.

#     connect_to_db(app)