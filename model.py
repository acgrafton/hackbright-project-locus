"""Models for locus app."""

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import googlemaps
import os
import requests

GOOGLE_TOKEN = os.environ['GOOGLE_TOKEN']
YELP_TOKEN = os.environ['YELP_TOKEN']


gmaps = googlemaps.Client(key=GOOGLE_TOKEN)

db = SQLAlchemy()

class User(db.Model):
    """A user."""

    __tablename__= "users"

    user_id = db.Column(db.Integer,
                        autoincrement=True,
                        primary_key=True,
                        )
    username = db.Column(db.String, unique=True, nullable=False)
    email = db.Column(db.String, unique=True, nullable=False)
    first_name = db.Column(db.String, nullable=False)
    last_name = db.Column(db.String, nullable=False)
    password = db.Column(db.String, nullable=False)
    max_points = db.Column(db.Integer, default=None)

    #locations = a list of Location objects
    #place_criteria = a list of PlaceCriteria objects

    def __repr__(self):
        return "".join((f'<User user_id={self.user_id} ',
                f'name={self.first_name}_{self.last_name} ',
                f'email={self.email}>'))


    @staticmethod
    def geocode(address):
        """Given an address, return a dictionary with point, latitute, longitude, 
        and address"""

        geocode_results = gmaps.geocode(address)
        point = geocode_results[0]['geometry']['location']
        latitude = point['lat']
        longitude = point['lng']
        address = geocode_results[0]['formatted_address']

        return {'point': point, 
                'latitude': latitude, 
                'longitude': longitude,
                'address': address,
                }

    @staticmethod    
    def create_location(geocode_dict):
        """Given geocode dict (including point, lat, long, address)"""

        location = Location(address=geocode_dict['address'],
                            latitude=geocode_dict['latitude'],
                            longitude=geocode_dict['longitude'],
                            )

        db.session.add(location)
        db.session.commit()

        return location


    def add_place_criterion(self, place_type_id, importance, 
                           max_distance=16093, name=None):

        criterion = PlaceCriterion(place_type_id=place_type_id,
                                importance=importance, max_distance=max_distance,
                                name=name, user_id=self.user_id)

        db.session.add(criterion)
        db.session.commit()

        return criterion


    def update_max_points(self):
        """Return maximum points to be used to calculate location 
        score for user"""

        points = 0

        for criterion in self.place_criteria:
            points += criterion.importance

        self.max_points = points

        return points


    def score_location(self, address):
        """Given an address, score location based on user criteria"""

        #Dictionary of geocode results including point, lat, long, address
        geocode = self.geocode(address)

        #Shortcut to query Location
        lq = Location.query

        #Query Location table for address
        location = lq.filter(Location.latitude == geocode['latitude'], 
                     Location.longitude == geocode['longitude']).first()

        #Create Location object if it does not yet exist
        if location == None:
            location = self.create_location(geocode)
       
        #Score the location for user
        score = location.create_score(self)

        return score


class Location(db.Model):
    """User locations i.e. 'home', 'work'."""

    __tablename__ = "locations"

    location_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    label = db.Column(db.String, default=None)
    address = db.Column(db.String, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    latitude = db.Column(db.Float, nullable=False)

    #place_types = a list of Place_type objects
    #location_place_criteria = list of location_place_criteria objects
    #scores = list of score objects

    def __repr__(self):
        return "".join((f'<User Location location_id={self.location_id} ',
                        f'address={self.address}>'))


    def add_lp_criterion(self, place_criterion_id, meets_criterion, results):
        """Add Location Place Criterion"""

        lp_criterion = LocationPlaceCriterion(location_id=self.location_id,
                                              place_criterion_id=place_criterion_id,
                                              meets_criterion=meets_criterion,
                                              results=results)
        db.session.add(lp_criterion)
        db.session.commit()

        return lp_criterion


    def meets_criterion(self, place_criterion):
        """Evaluates whether a location has results for a given criterion.
        Returns a dictionary with a boolean of whether if meets criteria and number of results"""

        data = place_criterion.get_yelp_response(self.latitude, self.longitude)

        num_results = data['total']

        #Evaluate results and return dictionary
        if num_results > 0:
            self.add_lp_criterion(place_criterion.place_criterion_id, True, num_results)
            return True
        
        else:
            self.add_lp_criterion(place_criterion.place_criterion_id, False, num_results)
            return False


    def calculate_score(self, user):
        """Calculate score out of 100"""

        points = 0
        
        for criterion in user.place_criteria:
            if self.meets_criterion(criterion):
                points += criterion.importance

        return (points / user.max_points) * 100


    def create_score(self, user):
        """Takes in User object and calculates score on Location""" 

        score = Score(score=self.calculate_score(user),
                      location_id=self.location_id,
                      user_id=user.user_id,
                      )

        db.session.add(score)
        db.session.commit()

        return score


class PlaceCriterion(db.Model):
    """Saves users favorite places with importance level"""

    __tablename__ = "place_criteria"

    place_criterion_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    place_type_id = db.Column(db.String, db.ForeignKey('place_types.place_type_id'))
    importance = db.Column(db.Integer, autoincrement=True)
    max_distance = db.Column(db.Integer, default=16093) #default set to 10 miles
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'))
    name = db.Column(db.String, default=None)

    user = db.relationship('User', backref='place_criteria')
    place_type = db.relationship('PlaceType', backref='place_criteria')

    #location_place_criteria = list of location_meets_criteria objects

    def __repr__(self):
        return "".join((f'<Place Criterion id={self.place_criterion_id} ',
                        f'user_id={self.user_id} '
                        f'place_type_id={self.place_type_id} '
                        f'name={self.name}>'))

    def attr_dict(self):
        """Return dictionary of object's key attributes"""
    
        return {'id': self.place_criterion_id, 
                'place_type': self.place_type.title, 
                'importance': self.importance,
                'max_distance': self.max_distance,
                'user_id': self.user_id,
                'name': self.name}

    def get_yelp_response(self, latitude, longitude):
        """Make Yelp API call and get response based on PlaceCriterion 
        attributes"""

        #Setting up arguments for Yelp API
        url = 'https://api.yelp.com/v3/businesses/search'
        headers = {'Authorization': ('Bearer '+ YELP_TOKEN)} 
        payload = {'latitude': latitude,
                   'longitude': longitude,
                   'radius': self.max_distance,
                   'limit': 1,
                   'categories':self.place_type_id,
                   'term':self.place_type.place_category_id}

        return requests.get(url, headers=headers, params=payload).json()
        

class LocationPlaceCriterion(db.Model):

    __tablename__ = "location_place_criteria"

    lpc_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    meets_criterion = db.Column(db.Boolean, nullable=False)
    results = db.Column(db.Integer, nullable=False)
    location_id = db.Column(db.Integer, db.ForeignKey('locations.location_id'))
    place_criterion_id = db.Column(db.Integer, db.ForeignKey('place_criteria.place_criterion_id'))

    location = db.relationship('Location', backref='location_place_criteria')
    place_criteria = db.relationship('PlaceCriterion', backref='location_place_criteria')

    def __repr__(self):
        return "".join((f'<LocationPlaceCriteria id={self.lpc_id} ',
                        f'meets_criteria={self.meets_criterion} '
                        f'place_criteria_id={self.place_criterion_id} '
                        f'location_id={self.location_id}>'))


class PlaceType(db.Model):
    """Place type such as grocery_store, restaurant, or DMV"""

    __tablename__ = "place_types"

    place_type_id = db.Column(db.String, primary_key=True, unique=True)
    title = db.Column(db.String)
    place_category_id = db.Column(db.String, 
                                  db.ForeignKey('place_categories.place_category_id'),
                                  )

    #place_criteria = list of place_criteria
    place_category = db.relationship('PlaceCategory', backref='place_types')

    def __repr__(self):
        return f'<PlaceType place_type_id={self.place_type_id}>'


class PlaceCategory(db.Model):
    """Broader categorization of places i.e. 'restaurants', 'food'"""

    __tablename__ = "place_categories"

    place_category_id = db.Column(db.String, primary_key=True)

    #place_types = a list of place_types



class Score(db.Model):
    """Score a location based user criteria"""

    __tablename__ = "scores"

    score_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    score = db.Column(db.Integer)
    location_id = db.Column(db.Integer, db.ForeignKey('locations.location_id'))
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'))

    location = db.relationship('Location', backref='scores')
    user = db.relationship('User', backref='scores')

    def __repr__(self):
        return f'<Score score_id={self.score_id}, score={self.score}>'


def example_data():
    """Create some sample data"""

    #Empty out existing data
    Score.query.delete()
    LocationPlaceCriterion.query.delete()
    PlaceCriterion.query.delete()
    Location.query.delete()
    User.query.delete()

    #Add sample users
    harry = User(email='harry@hogwarts.com',
                 username='hpotter', 
                 first_name='Harry', 
                 last_name='Potter', 
                 password='hedwig')
    remus = User(email='remus@howarts.com',
                 username='rlupin', 
                 first_name='Remus', 
                 last_name='Lupin', 
                 password='moon')
    # hermione = User('hermione@hogwarts.com', 'Hermione', 'Granger', 'time')
    # luna = User('luna@hogwarts.com', 'Luna', 'Lovegood', 'quibbler')

    db.session.add(harry)
    db.session.add(remus)
    db.session.commit()

    #Add place criteria
    harry.add_place_criterion('bubbletea', 3, max_distance=8047)
    harry.add_place_criterion('grocery', 5, name='Hmart')
    harry.add_place_criterion('parks', 4)
    harry.update_max_points()

    #Add locations
    fm = harry.score_location('Fort Morgan, CO')
    chicago = harry.score_location('60611')
    la = harry.score_location('San Gabriel, CA')


def connect_to_db(flask_app, db_uri='postgresql:///locus', echo=False):
    flask_app.config['SQLALCHEMY_DATABASE_URI'] = db_uri
    # flask_app.config['SQLALCHEMY_ECHO'] = echo
    flask_app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.app = flask_app
    db.init_app(flask_app)

    print('Connected to the db!')



if __name__ == '__main__':
    from server import app

    # Call connect_to_db(app, echo=False) if your program output gets
    # too annoying; this will tell SQLAlchemy not to print out every
    # query it executes.

    connect_to_db(app)