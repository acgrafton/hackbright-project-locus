"""Logic for scoring locatons based on User criteria"""

#Scoring rubric for banks and hospitals. The key represents the
#number of miles away but translated to meters. The values are points given
#based on the distance. '
#For example, a place 1 mile away would get 5 points if it's 
#affiliated with the user or 4 points if not.

import os
from model import User, LocCrit, Score, db, connect_to_db
import crud
import googlemaps
import requests
import pickle

API_KEY = os.environ['GOOGLE_TOKEN']
YELP_TOKEN = os.environ['YELP_TOKEN']

gmaps = googlemaps.Client(key=API_KEY)


def yelp(crit, loc):
  """Make Yelp API call and return response based on PlaceCriterion 
  attributes"""

  #Setting up arguments for Yelp API
  url = 'https://api.yelp.com/v3/businesses/search'
  headers = {'Authorization': ('Bearer '+ YELP_TOKEN)} 
  payload = {'latitude': loc.latitude,
              'longitude': loc.longitude,
              'radius': 16093,
              'limit': 10,
              'categories':crit.place_type_alias,
              # 'term': (plcrit_name 
              #         if plcrit_name is not None 
              #         else place_criterion.plcriterion_id)
              }

  return requests.get(url, headers=headers, params=payload).json()


def get_matches(yelp_endpoint, crit, loc):
    results = {'count': 0,
              crit.time1: [],
              crit.time2: [],
              crit.time3: [],
    }
    if not yelp_endpoint['total']:
      return results
    else:
      for i, biz in enumerate(yelp_endpoint['businesses']):
        if i + 1 > 9:
          break
        google_endpoint = googledm(loc, biz['coordinates'], crit)
        duration = google_endpoint['duration']
        name = biz['name']
        if duration['value'] <= crit.time1:
          results[crit.time1].append((biz['coordinates'], duration, name))
          results['count'] += 1
        elif duration['value'] <= crit.time2:
          results[crit.time2].append((biz['coordinates'], duration, name))
          results['count'] += 1
        elif duration['value'] <= crit.time3:
          results.get(crit.time3).append((biz['coordinates'], duration, name))
          results['count'] += 1
      return results

def recordLocCrit(match_results, crit, loc):
  count, ideal, great, good = match_results
  if match_results[ideal]:
    closest = match_results[ideal][0]
    points = 3
  elif match_results[great]:
    closest = match_results[great][0]
    points = 2
  elif match_results[good]:
    closest = match_results[good][0]
    points = 1
  else:
    points = 0

  if not match_results or not points:
    new = LocCrit(points=0,
                cl_match=None,
                match_time=None,
                match_time_str=None,
                num_matches=None,
                latlong=loc.latlong,
                crit_id=crit.crit_id,
                top_five=None)
  else:
    top_five = []
    i = 0
    while len(top_five) < 5 and i < len(match_results[ideal]):
      top_five.append(match_results[ideal][i][0])
      i += 1
    i = 0
    while len(top_five) < 5 and i < len(match_results[great]):
      top_five.append(match_results[great][i][0])
      i += 1
    i = 0
    while len(top_five) < 5 and i < len(match_results[good]):
      top_five.append(match_results[good][i][0])
      i += 1
    new = LocCrit(points=points,
                  cl_match=closest[2],
                  match_time=closest[1]['value'],
                  match_time_str=closest[1]['text'],
                  num_matches=match_results[count],
                  latlong=loc.latlong,
                  crit_id=crit.crit_id,
                  top_five=pickle.dumps(top_five))
  db.session.add(new)
  db.session.commit()
  return new


def calcScore(email, loc):
  total_points = 0
  for crit in crud.get_user(email).criteria:
    yelp_endpoint = yelp(crit, loc)
    matches = get_matches(yelp_endpoint, crit, loc)
    loccrit = recordLocCrit(matches, crit, loc)
    total_points += loccrit.points
  index = (total_points / crud.get_user(email).get_max_pts()) * 100
  score = Score(index=index,
                latlong=loc.latlong,
                email=email)
  db.session.add(score)
  db.session.commit()
  return score


def googleplnb(place_criterion, location, plcrit_name=None):
  """Make Google API call and return response based on Place Criterion and 
  Location"""

  keyword = plcrit_name if plcrit_name else place_criterion.place_type_id

  return gmaps.places_nearby(location={'lat': location.latitude, 
                                        'lng': location.longitude},
                              keyword=keyword,
                              rank_by='distance'
                              )

def googledm(location, dest_coords, crit):
  """Given a location object and an address or lat/long for the destination, return
  a dictionary with the distance and duration"""

  data = gmaps.distance_matrix(origins=(location.latitude, location.longitude),
                               destinations=(dest_coords['latitude'], 
                                             dest_coords['longitude']), 
                                mode=crit.mode.lower(), 
                                )

  return data['rows'][0]['elements'][0]



if __name__ == '__main__':
    from server import app

    # Call connect_to_db(app, echo=False) if your program output gets
    # too annoying; this will tell SQLAlchemy not to print out every
    # query it executes.

    connect_to_db(app)

    
