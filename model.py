"""Models for locus app."""

import os
from flask_sqlalchemy import SQLAlchemy
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
    max_points = db.Column(db.Integer, default=0)

    #place_criteria = a list of PlaceCriteria objects
    #scores = a list of score objects

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


    def add_place_criterion(self, place_type_id, importance=5, name=None):
        """Add a place criterion for a user"""

        criterion = PlaceCriterion(user_id=self.user_id,
                                   place_type_id=place_type_id,
                                   name=name, 
                                   importance=importance)

        db.session.add(criterion)
        db.session.commit()
        self.update_max_points()

        return criterion


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


    def score_location(self, geocode):
        """Scores a location and returns a dictionary of results"""

        locq = Location.query
        scoreq = Score.query

        #Get record from Location table
        location = locq.filter(Location.address == geocode['address']).first()

        #If no record for location exists, create a new one
        if location is None:
            location = self.create_loc(geocode)

        #Get record from Score table
        score = scoreq.filter(Score.location_id == location.location_id,
                              Score.user_id == self.user_id).first()

        #Evaluate the location
        evaluation = location.evaluate(self)

        #If no score record exists, create a new one
        if score is None:
            score = Score(score=evaluation['score'],
              location_id=location.location_id,
              user_id=self.user_id,
              )
            db.session.add(score)
            db.session.commit()

        #Otherwise, update score record
        else:
            score.score = evaluation['score']

        return evaluation


    def update_first_name(self, email):
        """Update first name"""

        self.first_name = first_name
        db.session.commit()

        return first_name

    def update_last_name(self, email):
        """Update last name"""

        self.last_name = last_name
        db.session.commit()

        return last_name

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

    def serialize(self):
        """Return a dictionary of core attributes"""

        return {'id': self.location_id, 'label': self.label, 
                'address': self.address,'lng': longitude, 'lat': latitude}


    def add_lpcrit(self, plcriterion_id, num_results, meets_criterion=False):
        """Add Location Place Criterion"""

        lpcrit = LocPlCriterion(location_id=self.location_id,
                                              plcriterion_id=plcriterion_id,
                                              num_results=num_results,
                                              meets_criterion=meets_criterion)
        db.session.add(lpcrit)
        db.session.commit()

        return lpcrit


    # def evaluate(self, user):
    #     """Given a user, return a dictionary with final score 
    #       and criteria evaluated"""

    #     #Shortcut
    #     locplcritq = LocPlCriterion.query

    #     #Tally points based on results, track criteria 
    #     points = 0
    #     evaluation = {'criteria':[]}

    #     #Loop through criteria and add points based on if results are found.
    #     #Add each criteria and its results to evaluation dictionary.
    #     for crit in user.place_criteria:

    #         #Get Location Place Criterion
    #         locplcrit = locplcritq.filter(
    #                             LocPlCriterion.location_id == self.location_id,
    #                             LocPlCriterion.plcriterion_id == crit.plcriterion_id
    #                             ).first()


    #         if crit.place_type_id in ['banks', 'pharmacy', 'hospitals']:
                   
    #                 #API call to pull data from google
    #                 data = gmaps.places_nearby(
    #                                 location={'lat': self.latitude, 
    #                                           'lng': self.longitude},
    #                                 radius=dist,
    #                                 type=self.place_type_id,
    #                                 name=crit.name,
    #                                 )
    #                 results = data['results']
    #                 num_results = len(results)
                   
    #                 #Calculate points based whether criterion has specific name
    #                 if not crit.name:
    #                     points = (name_rubric[dist] 
    #                              if num_results > 0 else gen_rubric[dist])

    #                 #Create a new Location Place Criterion object if not already
    #                 #in table
    #                 if not locplcrit and not num_results:
    #                     self.add_lpcrit(crit.plcriterion_id, num_results, True)

    #                 elif not locplcrit and num_results:
    #                     self.add_lpcrit(crit.plcriterion_id, num_results)

    #                 elif num_results and locplcrit:
    #                     locplcrit.meets_criterion == True
    #                     locplcrit.num_results = num_results

    #                 else:
    #                     locplcrit.meets_criterion == False
    #                     locplcrit.num_results = num_results

    #         evaluation['criteria'].append({'place_type': crit.place_type_id,'importance': crit.importance, 'distance': crit.max_distance,'google': results,'yelp': None})

    #         else:

    #             #Get yelp business search endpoint data
    #             data = crit.yelp(self.latitude, self.longitude)
    #             num_results = data['total']
                
    #             #Create new Loc Place Criterion object if record does not exist
    #             #Update meets_criteria and num_results if it does
    #             #Increment points by importance level if there's at least one result
    #             if num_results and not locplcrit:

    #                 points += crit.importance
                    
    #                 self.add_lpcrit(crit.plcriterion_id, num_results, True)

    #             elif num_results and locplcrit:
                    
    #                 points += crit.importance
                    
    #                 locplcrit.meets_criterion = True
    #                 locplcrit.num_results = num_results

    #             elif not num_results and not locplcrit:
                    
    #                 self.add_lpcrit(crit.plcriterion_id, num_results) 
                   
    #             else:

    #                 locplcrit.meets_criterion = False
    #                 locplcrit.num_results = num_results
                
    #             evaluation['criteria'].append({'place_type': crit.place_type_id,
    #                                            'importance': crit.importance,
    #                                            'distance': crit.max_distance,
    #                                            'google': None,
    #                                            'yelp': data['businesses'],
    #                                           })

    #     #Calculate points out of max and multiply by 100
    #     points = (points / user.max_points) * 100

    #     #Add to evaluation dictionary
    #     evaluation['score'] = points

    #     return evaluation


class PlaceCriterion(db.Model):
    """Saves users favorite places with importance level"""

    __tablename__ = "place_criteria"

    plcriterion_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    place_type_id = db.Column(db.String, db.ForeignKey('place_types.place_type_id'))
    importance = db.Column(db.Integer, default=5)
    max_distance = db.Column(db.Integer, default=8049) #default set to 5 miles
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

    def yelp(self, latitude, longitude):
        """Make Yelp API call and get response based on PlaceCriterion 
        attributes"""

        print(self.place_type_id)

        #Setting up arguments for Yelp API
        url = 'https://api.yelp.com/v3/businesses/search'
        headers = {'Authorization': ('Bearer '+ YELP_TOKEN)} 
        payload = {'latitude': latitude,
                   'longitude': longitude,
                   'radius': self.max_distance,
                   'limit': 10,
                   'categories':self.place_type_id,
                   'term':self.place_type.place_category_id}

        return requests.get(url, headers=headers, params=payload).json()
        

class LocPlCriterion(db.Model):

    __tablename__ = "location_place_criteria"

    lpc_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    meets_criterion = db.Column(db.Boolean, nullable=False)
    num_results = db.Column(db.Integer, nullable=False)
    location_id = db.Column(db.Integer, db.ForeignKey('locations.location_id'))
    plcriterion_id = db.Column(db.Integer, db.ForeignKey('place_criteria.plcriterion_id'))

    location = db.relationship('Location', backref='location_place_criteria')
    place_criteria = db.relationship('PlaceCriterion', backref='location_place_criteria')

    def __repr__(self):
        return "".join((f'<LocationPlaceCriteria id={self.lpc_id} ',
                        f'meets_criteria={self.meets_criterion} '
                        f'place_criteria_id={self.plcriterion_id} '
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