"""Models for locus app."""

import os
from flask_sqlalchemy import SQLAlchemy
import pickle
import googlemaps
import requests
import score_logic

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
    max_points = db.Column(db.Integer, default=0) #max points based on # of criteria

    #place_criteria = a list of PlaceCriteria objects
    #scores = a list of score objects
    #commute_locations = a list of commute locations

    def __repr__(self):
        return "".join((f'<User user_id={self.user_id} ',
              f'name={self.first_name}_{self.last_name} ',
              f'email={self.email}>'))

    def serialize(self):
        """Return a dictionary of core user attributes"""

        return {'username': self.username, 'email': self.email,
                'first_name': self.first_name, 'last_name': self.last_name}


    @staticmethod    
    def create_loc(geocode):
        """Given geocode dict (including point, lat, long, address)"""

        location = Location(address=geocode['address'],
                            latitude=geocode['point']['lat'],
                            longitude=geocode['point']['lng'],
                            )

        db.session.add(location)
        db.session.commit()

        return location


    def add_place_criterion(self, place_type_id, importance, name=None):
        """Add a place criterion for a user"""

        criterion = PlaceCriterion(user_id=self.user_id,
                                   place_type_id=place_type_id,
                                   importance=importance,
                                   name=name,
                                   )

        db.session.add(criterion)
        db.session.commit()
        self.update_max_points()

        return criterion


    def add_commute_location(self, address, name=None):
        """Add commute location to profile"""

        new_cloc = CommuteLocation(address=address, name=name, 
                                   latitude=data['geometry']['latitude'],
                                   longitude=data['geometry']['longitude'],
                                   user_id = self.user_id)

        return new_cloc


    def del_place_crit(self, place_type_id):
        """Delete PlaceCriterion object"""

        criterion = PlaceCriterion.query.filter(PlaceCriterion.place_type_id ==place_type_id,
                                   PlaceCriterion.user_id ==self.user_id).first()

        db.session.delete(criterion)
        db.session.commit()


    def update_max_points(self):
        """Return maximum points to be used to calculate location 
        score for user"""

        points = 0

        for criterion in self.place_criteria:
            points += criterion.importance

        self.max_points = points
        db.session.commit()

        return points


    def update_first_name(self):
        """Update first name"""

        self.first_name = self.first_name
        db.session.commit()

        return self.first_name

    def update_last_name(self):
        """Update last name"""

        self.last_name = self.last_name
        db.session.commit()

        return self.last_name

    def update_email(self, email):
        """Update email"""

        self.email = email
        db.session.commit()

        return email

    def update_password(self, password):
        """Update password"""

        self.password = password
        db.session.commit()

    def get_scores(self):
        """Return a list of score dictionaries"""

        return [score.serialize() for score in self.scores]

    def get_place_criteria(self):
        """Return a list of criteria dictionaries"""

        return [place_criterion.serialize() 
                for place_criterion in self.place_criteria]
 
class CommuteLocation(db.Model):
    """User work location"""
    __tablename__ = "commute_locations"

    cloc_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    name = db.Column(db.String)
    address = db.Column(db.String, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'))

    user = db.relationship('User', backref='commute_locations')

    def __repr__(self):
        return "".join((f'<CommuteLocation cloc_id={self.cloc_id}',
                        f'name {self.name}',
                        f'address {self.address}'))



class Location(db.Model):
    """Potential move locations"""

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

    def serialize(self):
        """Return a dictionary of core attributes"""

        return {'id': self.location_id, 'label': self.label, 
                'address': self.address,'lng': self.longitude, 'lat': self.latitude}


    def add_lpcrit(self, plcrit_id, eval_pts, gresults=None, yresults=None, 
                   closest_dist=None):
        """Add Location Place Criterion"""

        lpcrit = LocPlCriterion(location_id=self.location_id,
                                plcriterion_id=plcrit_id,
                                eval_points=eval_pts,
                                gresults=gresults,
                                yresults=yresults,
                                closest_dist=closest_dist,
                                )
        db.session.add(lpcrit)
        db.session.commit()

        return lpcrit


class PlaceCriterion(db.Model):
    """Saves users favorite places with importance level"""

    __tablename__ = "place_criteria"

    plcriterion_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    place_type_id = db.Column(db.String, db.ForeignKey('place_types.place_type_id'))
    max_distance = db.Column(db.Integer, default=8049) #default set to 5 miles
    importance = db.Column(db.Integer, default=5)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'))
    name = db.Column(db.String, default=None)

    user = db.relationship('User', backref='place_criteria')
    place_type = db.relationship('PlaceType', backref='place_criteria')

    #location_place_criteria = list of location_meets_criteria objects

    def __repr__(self):
        return "".join((f'<Place Criterion id={self.plcriterion_id} ',
                        f'user_id={self.user_id} '
                        f'place_type_id={self.place_type_id} '
                        f'name={self.name}>'))


    def serialize(self):
        """Return dictionary of object's key attributes"""
    
        return {'id': self.plcriterion_id, 
                'place_title': self.place_type.title,
                'place_id': self.place_type_id,
                'importance': self.importance,
                'max_distance': self.max_distance,
                'name': self.name}


        

class LocPlCriterion(db.Model):
    """aka LPC"""

    __tablename__ = "location_place_criteria"

    lpc_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    eval_points = db.Column(db.Integer, nullable=False)
    gresults = db.Column(db.PickleType)
    yresults = db.Column(db.PickleType)
    closest_dist = db.Column(db.Integer)
    location_id = db.Column(db.Integer, db.ForeignKey('locations.location_id'))
    plcriterion_id = db.Column(db.Integer, db.ForeignKey('place_criteria.plcriterion_id'))

    location = db.relationship('Location', backref='location_place_criteria')
    place_criterion = db.relationship('PlaceCriterion', backref='location_place_criteria')

    def __repr__(self):
        return "".join((f'<LocationPlaceCriteria id={self.lpc_id} ',
                        f'eval_points={self.eval_points} ',
                        f'place_criteria_id={self.plcriterion_id} ',
                        f'location_id={self.location_id}>'))

    def serialize(self):
        """Return dictionary of object's key attributes for delivery to user
        display"""
    
        return {'criterion': self.place_criterion.place_type_id, 
                'eval_points': self.eval_points,
                'importance': self.place_criterion.importance,
                'gresults': None if not self.gresults else pickle.loads(self.gresults),
                'yresults': None if not self.yresults else pickle.loads(self.yresults),
                'closest_dist': self.closest_dist,
                'name': self.place_criterion.name}


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

    def serialize(self):
        """Return dictionary of core attributes"""

        return {'score_id': self.score_id, 'score': self.score, 
                'address': self.location.address}


def example_data():
    """Create some sample data"""

    #Empty out existing data
    Score.query.delete()
    LocPlCriterion.query.delete()
    PlaceCriterion.query.delete()
    Location.query.delete()
    User.query.delete()

    #Add sample users Top Chef season 17 theme
    melissa = User(email='melissak@tc.com',
                 username='mking', 
                 first_name='Melissa', 
                 last_name='King', 
                 password='scallops')
    kevin = User(email='kgillespie@tc.com',
                 username='kgillespie@tc.com', 
                 first_name='Kevin', 
                 last_name='Gillespie', 
                 password='pork')
    stephanie = User(email='stephaniec@tc.com',
                 username='stephaniec', 
                 first_name='Stephanie', 
                 last_name='lamb', 
                 password='pasta')
    bryan = User(email='bryanv@tc.com',
                 username='bryanv', 
                 first_name='Bryan', 
                 last_name='Voltaggio', 
                 password='carrots')

    gregory = User(email='gregoryg@tc.com',
                 username='gregoryg', 
                 first_name='Gregory', 
                 last_name='Gourdet', 
                 password='chicken')

    db.session.add_all([melissa, kevin, stephanie, bryan, gregory])
    db.session.commit()


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