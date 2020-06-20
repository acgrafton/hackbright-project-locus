"""Logic for scoring locatons based on User criteria"""

#Scoring rubric for banks, hospitals, and pharmacies. The key represents the
#number of miles away but translated to meters. The values are points given
#based on the distance. '
#For example, a place 1 mile away would get 5 points if it's 
#affiliated with the user or 4 points if not.


ESSENTIAL_SVC = {'affiliated': {1609: 5, 4828: 4, 8047: 3, 16093: 2}, 
                 'general':  {1609: 4, 4828: 3, 8047: 2, 16093: 1},
                }


def points_lookup(distance, table='general'):
  """Return number of points from the affiliated table based on the distance"""

  for threshold in ESSENTIAL_SVC[table]:
    
    if distance < threshold:
      return ESSENTIAL_SVC[table][threshold]

    return 0


def affiliate_points(num_results, distance):
  """Given the number of results and distance of the closest match, 
  return points to be used for the overall Location Score"""

  if not num_results:
    return 0

  return points_lookup(distance, 'affiliated')


def general_points(num_results, distance):
  """Given the number of results and distance of the closest match, 
  return points to be used for the overall Location Score"""

  if not num_results:
    return 0

  return points_lookup(distance, 'general')

def index_(loc_points, user_max_points):
  """Given a location's points and a user's max points, convert it to an index
  based off 100 max"""

  return (loc_points / user_max_points) * 100

  

    
