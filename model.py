"""Models for locus app."""

import os
from flask_sqlalchemy import SQLAlchemy
import pickle

db = SQLAlchemy()

class User(db.Model):
    """A user."""

    __tablename__= "users"

    email = db.Column(db.String, unique=True, nullable=False, primary_key=True)
    fname = db.Column(db.String, nullable=False)
    lname = db.Column(db.String, nullable=False)
    pw = db.Column(db.String, nullable=False)

    #criteria = a list of Criterion objects
    #scores = a list of score objects

    def __repr__(self):
        return "".join((f'<name={self.fname}_{self.lname} ',
                        f'email={self.email}>'))

    def info(self):
        """Return a dictionary of core user attributes"""
        return {'email': self.email,
                'first_name': self.fname, 
                'last_name': self.lname}

    def add_crit(self, place_type, dow, tod, mode='DRIVING'):
        """Add a place criterion for a user"""
        criterion = Criterion(email=self.email,
                              place_type_alias=place_type,
                              travel_dow=dow,
                              travel_time_of_day=tod,
                              mode=mode)
        db.session.add(criterion)
        db.session.commit()
        return criterion

    def del_crit(self, place_type_id):
        """Delete PlaceCriterion object"""
        criterion = Criterion.query.filter(Criterion.place_type_id ==place_type_id,
                                   Criterion.email ==self.email).first()
        for score in self.scores :
            for lpc in score.location.location_place_criteria:
                if lpc.place_criterion == criterion:
                    db.session.delete(lpc)
                    db.session.commit()
        db.session.delete(criterion)
        db.session.commit()

    def get_fname(self):
        """Get first name"""
        return self.fname

    def set_fname(self):
        """Update first name"""
        self.first_name = self.first_name
        db.session.commit()
        return self.fname

    def get_lname(self):
        return self.lname

    def set_lname(self):
        """Update last name"""
        self.last_name = self.last_name
        db.session.commit()
        return self.lname

    def get_email(self):
        return self.email

    def set_email(self, email):
        """Update email"""
        self.email = email
        db.session.commit()
        return self.email

    def get_pw(self):
        return self.pw

    def set_pw(self, password):
        """Update password"""
        self.pw = password
        db.session.commit()

    def get_criteria(self):
        """Return a list of criteria dictionaries"""
        return [crit.info() for crit in self.criteria]

    def get_scores(self):
        """Return a list of score dictionaries"""
        return [score.info() for score in self.scores]

    def get_max_pts(self):
        return len(self.get_criteria()) * 3


class Location(db.Model):
    """A location defined by latlong."""

    __tablename__ = "locations"

    latlong = db.Column(db.String, primary_key=True)
    address = db.Column(db.String, nullable=False) #formatted address
    longitude = db.Column(db.Float, nullable=False)
    latitude = db.Column(db.Float, nullable=False)

    #loc_criteria = list of loc_criteria objects
    #scores = list of score objects

    def __repr__(self):
        return "".join((f'<User Location location_id={self.latlong} ',
                        f'address={self.address}>'))

    def info(self):
        """Return a dictionary of core attributes"""
        return {'id': self.latlong, 'address': self.address,
                'lng': self.longitude, 'lat': self.latitude}

    def add_loccrit(self, plcrit_id, eval_pts, gresults=None, yresults=None, 
                   closest_dist=None):
        """Add Location Place Criterion"""
        loccrit = LocCrit(location_id=self.location_id,
                                plcriterion_id=plcrit_id,
                                eval_points=eval_pts,
                                gresults=gresults,
                                yresults=yresults,
                                closest_dist=closest_dist,
                                )
        db.session.add(loccrit)
        db.session.commit()
        return loccrit


class Criterion(db.Model):
    """Saves users favorite places with importance level"""

    __tablename__ = "criteria"

    crit_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    place_type_alias = db.Column(db.String, 
                                 db.ForeignKey('place_types.alias')) #Yelp Place Type
    travel_dow = db.Column(db.String, default=None) #Weekday or Weekend
    travel_time_of_day = db.Column(db.String, default=None) # Morning, Afternoon, Evening, Commute
    mode = db.Column(db.String, default='driving') #Driving, Walking, Bicycling, Transit
    time1 = db.Column(db.Integer, default=600) #default 15 minutes (900 sec)
    time2 = db.Column(db.Integer, default=1200) #default 30 minutes (1800 sec)
    time3 = db.Column(db.Integer, default=2700) #default 45 minutes (2700 sec)
    email = db.Column(db.String, db.ForeignKey('users.email'))

    user = db.relationship('User', backref='criteria')
    place_type = db.relationship('PlaceType', backref='criteria')

    #loc_crit = list of loccrit objects
    #crit_place_names = list of

    def __repr__(self):
        return "".join((f'<Place Criterion id={self.plcriterion_id} ',
                        f'user_id={self.user_id} '
                        f'place_type_id={self.place_type_id} '
                        f'name={self.name}>'))

    def info(self):
        """Return dictionary of object's key attributes"""
        return {'id': self.crit_id, 
                'place_type': self.place_type.info(),
                'DOW': self.travel_dow,
                'TOD': self.travel_time_of_day,
                'mode': self.mode}


class CritPlaceNames(db.Model):

    __tablename__ = "crit_place_names"

    cpn_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    name = db.Column(db.String, unique=True)
    loccrit_id = db.Column(db.Integer, 
                           db.ForeignKey('loc_criteria.loccrit_id'))

    loccrit = db.relationship('LocCrit', backref='crit_place_names')


class PlaceType(db.Model):

    __tablename__ = 'place_types'

    alias = db.Column(db.String, unique=True, primary_key=True)
    desc = db.Column(db.String)
    parent = db.Column(db.String, default=None)

    def info(self):
        return {'alias': self.alias, 'desc': self.desc, 'parent': self.parent}


class LocCrit(db.Model):
    """LocCrit object stores the points calculated based on the a location's 
    matches to a criterion."""

    __tablename__ = "loc_criteria"

    loccrit_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    points = db.Column(db.Integer, nullable=False) #Scale 1-3 points based on time threshold
    cl_match = db.Column(db.String) #name
    match_time = db.Column(db.Integer) #in seconds
    match_time_str = db.Column(db.String) #hours and minutes
    num_matches = db.Column(db.Integer) #num of matches inside time threshold 3
    top_five = db.Column(db.PickleType) #list of latlongs
    latlong = db.Column(db.String, db.ForeignKey('locations.latlong'))
    crit_id = db.Column(db.Integer, db.ForeignKey('criteria.crit_id'))

    location = db.relationship('Location', backref='loc_criteria')
    criterion = db.relationship('Criterion', backref='loc_criteria')

    def __repr__(self):
        return "".join((f'<LocCriteria id={self.loccrit_id} ',
                        f'points={self.points} ',
                        f'crit_id={self.crit_id} ',
                        f'loc_id={self.loc_id}>'))

    def info(self):
        """Return dictionary of object's key attributes for delivery to user
        display"""
        return {'crit': self.criterion.place_type.desc, 
                'points': self.points,
                'cl_match': self.cl_match,
                'match_time': self.match_time,
                'match_time_str': self.match_time_str,
                'num_matches': self.num_matches,
                'top_five': None if self.top_five is None else pickle.loads(self.top_five),
                'latlong' : self.latlong, 
                'crit_id': self.crit_id}


class Score(db.Model):
    """Score a location based user criteria"""

    __tablename__ = "scores"

    score_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    index = db.Column(db.Integer) #out of 100
    latlong = db.Column(db.String, db.ForeignKey('locations.latlong'))
    email = db.Column(db.String, db.ForeignKey('users.email'))

    location = db.relationship('Location', backref='scores')
    user = db.relationship('User', backref='scores')

    def __repr__(self):
        return f'<Score score_id={self.score_id}, score={self.score}>'

    def get_loccrit(self):
        """Return a dictionary of criteria type and criteria score"""
        loccrits = []
        for crit in self.user.criteria:
            loccrit = LocCrit.query.filter_by(latlong=self.latlong,
                                              crit_id=crit.crit_id).first()
            if loccrit:
                loccrits.append(loccrit.info())
        return loccrits

    def info(self):
        """Return dictionary of core attributes"""
        return {'score_id': self.score_id, 
                'score': self.index, 
                'address': self.location.address, 
                'criteria': self.get_loccrit()}


def connect_to_db(flask_app, db_uri='postgresql:///locus', echo=False):
    flask_app.config['SQLALCHEMY_DATABASE_URI'] = db_uri
    # flask_app.config['SQLALCHEMY_ECHO'] = echo
    flask_app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.app = flask_app
    db.init_app(flask_app)

    print('Connected to the db!')


if __name__ == '__main__':
    from server import app
    connect_to_db(app)