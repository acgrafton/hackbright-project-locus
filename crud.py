"""CRUD Operations to manage changes and query database"""

import os
import re
import pickle
import requests
from model import (User, Location, PlaceType, PlaceCategory, Score, LocPlCriterion, db, connect_to_db)
from score_logic import affl_points, gen_points, conv_index
import googlemaps
# from datetime import datetime


API_KEY = os.environ['GOOGLE_TOKEN']
YELP_TOKEN = os.environ['YELP_TOKEN']

gmaps = googlemaps.Client(key=API_KEY)

CATEGORIES = ['active', 'airports', 'arts', 'restaurants', 'grocery', 
                 'homeandgarden', 'education', 'utilities', 'auto', 
                 'localservices', 'financialservices', 'laundryservices',
                 'petservices', 'beautysvc', 'parks', 'gym', 'publicservicesgovt',
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

    #Automatically add these criteria as core criteria
    new_user.add_place_criterion('banks', 5)
    new_user.add_place_criterion('hospitals', 5)

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

    return [user.add_place_criterion(place, name) for place, name in place_types.items()]


def yelp(place_criterion, location, plcrit_name=None):
    """Make Yelp API call and return response based on PlaceCriterion 
    attributes"""

    #Setting up arguments for Yelp API
    url = 'https://api.yelp.com/v3/businesses/search'
    headers = {'Authorization': ('Bearer '+ YELP_TOKEN)} 
    payload = {'latitude': location.latitude,
               'longitude': location.longitude,
               'radius': 16093,
               'limit': 10,
               'categories':place_criterion.place_type_id,
               'term': (plcrit_name 
                        if plcrit_name is not None 
                        else place_criterion.plcriterion_id)}

    return requests.get(url, headers=headers, params=payload).json()


def googleplnb(place_criterion, location, plcrit_name=None):
    """Make Google API call and return response based on Place Criterion and 
    Location"""

    keyword = plcrit_name if plcrit_name else place_criterion.place_type_id

    return gmaps.places_nearby(location={'lat': location.latitude, 
                                         'lng': location.longitude},
                               radius=16093,
                               keyword=keyword,
                               )

def googledm(location, destination):
    """Given a location object and a place_id for the destination, return
    a dictionary with the distance and duration"""

    data = gmaps.distance_matrix(origins=(location.latitude, location.longitude),
                                  destinations=destination)

    return data['rows'][0]['elements'][0]


def update_lpc_wresults(location, lpc, plcriterion, points, closest_match_dist, 
                        gresults=None, yresults=None):
    """Given an LocPlCriterion (lpc) object, PlaceCriterion object, loc_points, 
    distance of closest match, and pickled results from yelp or google, 
    either create or update the lpc object."""

    if lpc: 
        lpc.eval_points = points
        lpc.gresults = gresults
        lpc.yresults = yresults
        lpc.closest_dist = closest_match_dist

    else: 
        lpc = location.add_lpcrit(plcrit_id=plcriterion.plcriterion_id, 
                                  eval_pts=points,
                                  gresults=gresults,
                                  yresults=yresults,
                                  closest_dist=closest_match_dist)
        db.session.add(lpc)

    db.session.commit()

    return lpc


def update_lpc_noresults(location, lpc, plcriterion, points):
    """Given an LocPlCriterion (lpc) object, PlaceCriterion object, loc_points, 
    distance of closest match, and pickled results from yelp or google, 
    either create or update the lpc object."""

    if lpc: 
        lpc.eval_points = points

    else: 
        lpc = location.add_lpcrit(plcrit_id=plcriterion.plcriterion_id, 
                                  eval_pts=points)
        db.session.add(lpc)

    db.session.commit()

    return lpc



def evaluate(user, location):
    """Given a user location, return a list of lpc objects with results"""

    #Store points based on points scored against each criteria
    points = 0

    #List of LPC objects
    evaluated_lpc = []

    #Loop through each criterion and get points based on score logic.
    #Increment points variable for each criteria and create a LPC object to
    #store results.
    for crit in user.place_criteria:

        locplcrit = LocPlCriterion.query.filter(LocPlCriterion.location_id == location.location_id, LocPlCriterion.plcriterion_id == crit.plcriterion_id).first()

        core_cat = crit.place_type_id in CORE_CAT
        targeted = bool(crit.name)

        pl_data = (googleplnb(crit, location, plcrit_name=crit.name)
                   if core_cat else yelp(crit, location))

        api = 'google' if 'results' in pl_data.keys() else 'yelp'

        results = pl_data['results'] if api == 'google' else pl_data['businesses']

        #If no results from targeted search with name, do a general search
        if not results:
            pl_data = (googleplnb(crit, location, plcrit_name=None)
                       if core_cat else yelp(crit, location, plcrit_name=None))

            api = 'google' if 'results' in pl_data.keys() else 'yelp'

            results = pl_data['results'] if api == 'google' else pl_data['businesses']
            targeted = False

            #If still no results, create an lpc object and go to next criterion
            if not results:
                print(crit, 'no results')
                update_lpc_noresults(location, locplcrit, crit, 0).serialize()
                continue

        #Pull latlng of the closest match
        closest_match = (results[0]['geometry']['location'] if api == 'google'
                         else (results[0]['coordinates']['latitude'],
                               results[0]['coordinates']['longitude']))

        #Get the distance from the closest match
        clm_dist = googledm(location, closest_match)['distance']['value']

        #Using the distance as an argument, get the points
        crit_pts = affl_points(clm_dist) if targeted else gen_points(clm_dist)
        print(crit, 'crit_pts', crit_pts)

        #Tally overall location points and factor in importance
        points += ((crit_pts + crit.importance) / 2)
        print(points)

        #Pickle the search results for db storage
        pickled_results = pickle.dumps(results)

        #Update LPC with result and add to evaluated lpc set
        if api == 'google':
            evaluated_lpc.append(update_lpc_wresults(location, locplcrit, crit,
                                                  crit_pts, clm_dist,
                                                  gresults=pickled_results).serialize())
        else:
            evaluated_lpc.append(update_lpc_wresults(location, locplcrit, crit,
                                                  crit_pts, clm_dist,
                                                  yresults=pickled_results).serialize())
    print('max points', user.max_points)
    points = conv_index(points, user.max_points)
    print('final points', points)

    return {'score': points, 'criteria': evaluated_lpc}

def score_location(user, geocode):
    """Scores a location and returns a list of lpc objects"""

    locq = Location.query
    scoreq = Score.query

    #Get record from Location table
    location = locq.filter(Location.address == geocode['address']).first()

    #If no record for location exists, create a new one
    if location is None:
        location = user.create_loc(geocode)

    #Get record from Score table
    score = scoreq.filter(Score.location_id == location.location_id,
                          Score.user_id == user.user_id).first()

    #Evaluate the location
    evaluation = evaluate(user, location)

    #If no score record exists, create a new one
    if score is None:
        score = Score(score=evaluation['score'],
          location_id=location.location_id,
          user_id=user.user_id,
          )
        db.session.add(score)
        db.session.commit()

    #Otherwise, update score record
    else:
        score.score = evaluation['score']

    return evaluation



if __name__ == '__main__':
    from server import app

    # Call connect_to_db(app, echo=False) if your program output gets
    # too annoying; this will tell SQLAlchemy not to print out every
    # query it executes.

    connect_to_db(app)
