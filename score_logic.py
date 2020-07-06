"""Logic for scoring locatons based on User criteria"""

#Scoring rubric for banks and hospitals. The key represents the
#number of miles away but translated to meters. The values are points given
#based on the distance. '
#For example, a place 1 mile away would get 5 points if it's 
#affiliated with the user or 4 points if not.

import os
from model import User, Location, PlaceType, PlaceCategory, Score, LocPlCriterion, CommuteLocation, db, connect_to_db
from crud import create_loc
import googlemaps
import requests
import pickle

API_KEY = os.environ['GOOGLE_TOKEN']
YELP_TOKEN = os.environ['YELP_TOKEN']

gmaps = googlemaps.Client(key=API_KEY)


ESSENTIAL_SVC = {'affiliated': {1609: 5, 4828: 4, 8047: 3, 16093: 2}, 
                 'general':  {1609: 4, 4828: 3, 8047: 2, 16093: 1},
                }

CATEGORIES = ['active', 'hotelstravel', 'arts', 'restaurants', 'grocery', 
                 'homeandgarden', 'education', 'utilities', 'auto', 
                 'localservices', 'financialservices', 'laundryservices',
                 'petservices', 'beautysvc', 'gym', 'publicservicesgovt',
                 'religiousorgs', 'shopping', 'martialarts', 'food', 'health']

CORE_CAT = ['banks', 'hospitals', 'grocery']


def points_lookup(distance, table='general'):
  """Return number of points from the affiliated table based on the distance"""

  for threshold in ESSENTIAL_SVC[table].keys():
    
    if distance < threshold:
      return ESSENTIAL_SVC[table][threshold]

  return 0


def affl_points(distance):
  """Given the distance of the closest match, 
  return points to be used for the overall Location Score"""

  return points_lookup(distance, table='affiliated')


def gen_points(distance):
  """Given the distance of the closest match, 
  return points to be used for the overall Location Score"""

  return points_lookup(distance, table='general')

  
def conv_index(loc_points, user_max_points):
  """Given a location's points and a user's max points, convert it to an index
  based off 100 max"""

  return int((loc_points / user_max_points) * 100)

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
                              keyword=keyword,
                              rank_by='distance'
                              )

def googledm(location, destination):
  """Given a location object and an address or lat/long for the destination, return
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

def get_lpc(location, crit):

  return LocPlCriterion.query.filter(LocPlCriterion.location_id == location.location_id, LocPlCriterion.plcriterion_id == crit.plcriterion_id).first()


def use_google(crit):
  """Return a boolean given a place criteria whether the place type is a core category or if there is a specified name."""

  return (crit.place_type_id in CORE_CAT or bool(crit.name))



def evaluate(user, location):
  """Given a user instance and location instance, return a dictionary with the score and a list of lpc objects with results"""

  #Store points based on points scored against each criteria
  points = 0

  #List of LPC objects
  evaluated_lpc = []

  #Loop through each criterion and get points based on score logic.
  #Increment points variable for each criteria and create a LPC object to
  #store results.
  for crit in user.place_criteria:
    print('crit', crit)

    locplcrit = get_lpc(location, crit)

    pl_data = (googleplnb(crit, location, plcrit_name=crit.name) if use_google(crit) else yelp(crit, location))

    api = 'google' if 'results' in pl_data.keys() else 'yelp'

    results = pl_data['results'][:10] if api == 'google' else pl_data['businesses']

    #If no results from targeted search with name, do a general search
    if not results:
        pl_data = (googleplnb(crit, location, plcrit_name=None)
                    if api == 'google' else yelp(crit, location, plcrit_name=None))

        api = 'google' if 'results' in pl_data.keys() else 'yelp'

        results = pl_data['results'][:10] if api == 'google' else pl_data['businesses']

        #If still no results, create an lpc object and go to next criterion
        if not results:
            update_lpc_noresults(location, locplcrit, crit, 0).serialize()
            continue

    #Pull latlng of the closest match
    closest_match = (results[0]['geometry']['location'] if api == 'google'
                      else (results[0]['coordinates']['latitude'],
                            results[0]['coordinates']['longitude']))

    #Get the distance from the closest match
    clm_dist = googledm(location, closest_match)['distance']['value']
    print('clm_dist')

    #Using the distance as an argument, get the points
    crit_pts = affl_points(clm_dist) if bool(crit.name) else gen_points(clm_dist)
    print('crit_pts', crit_pts)

    #Tally overall location points and factor in importance
    points = ( points + (crit_pts + crit.importance) / 2) if crit_pts > 0 else points
    print('points', points)

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
  points = conv_index(points, user.max_points)
  print('arg_points', points)
  print('max', user.max_points)
  print('final after conversion', points)

  return {'score': points, 'criteria': evaluated_lpc}

def score_location(user, geocode):
  """Scores a location and returns a list of lpc objects"""

  locq = Location.query
  scoreq = Score.query

  #Get record from Location table
  location = locq.filter(Location.address == geocode['address']).first()

  #If no record for location exists, create a new one
  if location is None:
      location = create_loc(geocode)

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

    
