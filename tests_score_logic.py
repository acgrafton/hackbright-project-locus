import os
import score_logic
import crud
from server import app
from model import db, connect_to_db, example_data, Location, User, LocPlCriterion
import model

from unittest import TestCase
import unittest
import json
import googlemaps

API_KEY = os.environ['GOOGLE_TOKEN']
YELP_TOKEN = os.environ['YELP_TOKEN']

gmaps = googlemaps.Client(key=API_KEY)

class ScoreLogic(TestCase):

  def test_points_lookup_general(self):

    self.assertEqual(score_logic.points_lookup(1000), 4)

  def test_affl_points(self):

    self.assertEqual(score_logic.affl_points(5000), 3)

  def test_conv_index(self):

    self.assertEqual(score_logic.conv_index(8, 10), 80)

class TestUserAndLocation(TestCase):
  """Flask tests that use the database"""

  def setUp(self):

    os.system('createdb testdb')

    self.client = app.test_client()
    app.config['TESTING'] = True

    connect_to_db(app, 'postgresql:///testdb')

    db.create_all()

    grocerycat  = model.PlaceCategory(place_category_id='grocery')
    airportcat = model.PlaceCategory(place_category_id='hotelsandtravel')
    grocery = model.PlaceType(place_type_id='grocery', title='Grocery Stores', place_category_id='grocery')
    airports = model.PlaceType(place_type_id='airports', title='Airports', place_category_id='hotelsandtravel')
    db.session.add_all([grocerycat, airportcat, grocery, airports])
    db.session.commit()

    example_data()

  def tearDown(self):

    db.session.remove()
    db.drop_all()
    print('removing')
    db.engine.dispose()
    os.system('dropdb testdb')

  def test_get_user(self):

    self.assertIsInstance(crud.get_user('mking'), User)

  def test_create_loc(self):

    geocode_result = gmaps.geocode('60611')[0]
    geocode_formatted = {'address': geocode_result['formatted_address'],
                         'point': geocode_result['geometry']['location']}

    self.assertIsInstance(crud.create_loc(geocode_formatted), Location)

class TestApiCalls(TestCase):
  """Flask tests that use the database"""

  def setUp(self):

    os.system('createdb testdb')

    self.client = app.test_client()
    app.config['TESTING'] = True

    connect_to_db(app, 'postgresql:///testdb')

    db.create_all()

    grocerycat  = model.PlaceCategory(place_category_id='grocery')
    airportcat = model.PlaceCategory(place_category_id='hotelsandtravel')
    grocery = model.PlaceType(place_type_id='grocery', title='Grocery Stores', place_category_id='grocery')
    airports = model.PlaceType(place_type_id='airports', title='Airports', place_category_id='hotelsandtravel')
    db.session.add_all([grocerycat, airportcat, grocery, airports])
    db.session.commit()

    example_data()

  def tearDown(self):

    db.session.remove()
    db.drop_all()
    db.engine.dispose()
    os.system('dropdb testdb')

  def test_yelp(self):

    geocode_result = gmaps.geocode('60611')[0]
    geocode_formatted = {'address': geocode_result['formatted_address'],
                        'point': geocode_result['geometry']['location']}

    mel = crud.get_user('mking')
    loc = crud.create_loc(geocode_formatted)
    crit = mel.place_criteria[0]

    self.assertIn('whole-foods-market-chicago-15',
                  score_logic.yelp(crit,loc,'Whole Foods')['businesses'][0]['alias'])

  def test_googleplnb(self):

    geocode_result = gmaps.geocode('60611')[0]
    geocode_formatted = {'address': geocode_result['formatted_address'],
                        'point': geocode_result['geometry']['location']}

    
    mel = crud.get_user('mking')
    loc = crud.create_loc(geocode_formatted)
    crit = mel.place_criteria[0]

    self.assertIn('Whole Foods Market', 
                  score_logic.googleplnb(crit, loc, 'Whole Foods')['results'][0]['name'])

  def test_googledm(self):

    geocode_result = gmaps.geocode('60611')[0]
    geocode_formatted = {'address': geocode_result['formatted_address'],
                        'point': geocode_result['geometry']['location']}

    loc = crud.create_loc(geocode_formatted)
    dest = {'lat': 41.9399847, 'lng': -87.668204}

    self.assertEqual(score_logic.googledm(loc, dest)['duration']['value'], 1003)


class Scoring(TestCase):
  """Flask tests that use the database"""

  def setUp(self):

    os.system('createdb testdb')

    self.client = app.test_client()
    app.config['TESTING'] = True

    connect_to_db(app, 'postgresql:///testdb')

    db.create_all()

    grocerycat  = model.PlaceCategory(place_category_id='grocery')
    airportcat = model.PlaceCategory(place_category_id='hotelsandtravel')
    grocery = model.PlaceType(place_type_id='grocery', title='Grocery Stores', place_category_id='grocery')
    airports = model.PlaceType(place_type_id='airports', title='Airports', place_category_id='hotelsandtravel')
    db.session.add_all([grocerycat, airportcat, grocery, airports])
    db.session.commit()

    example_data()

  def tearDown(self):

    db.session.remove()
    db.drop_all()
    db.engine.dispose()
    os.system('dropdb testdb')

  def test_update_lpc_wresults_1(self):
    """Test with lpc argument = None"""

    geocode_result = gmaps.geocode('60611')[0]
    geocode_formatted = {'address': geocode_result['formatted_address'],
                        'point': geocode_result['geometry']['location']}

    
    mel = crud.get_user('mking')
    loc = crud.create_loc(geocode_formatted)
    crit = mel.place_criteria[0]

    self.assertIsInstance(score_logic.update_lpc_wresults(loc, None, crit, points=5, closest_match_dist=8685), LocPlCriterion)

  def test_update_lpc_wresults_2(self):
    """Test with existing lpg argument"""

    geocode_result = gmaps.geocode('60611')[0]
    geocode_formatted = {'address': geocode_result['formatted_address'],
                        'point': geocode_result['geometry']['location']}

    mel = crud.get_user('mking')
    loc = crud.create_loc(geocode_formatted)
    crit = mel.place_criteria[0]

    lpc = loc.add_lpcrit(plcrit_id=1, 
                                eval_pts=4,
                                gresults=None,
                                yresults=None,
                                closest_dist=8685)
    db.session.add(lpc)
    db.session.commit()

    score_logic.update_lpc_wresults(loc, lpc, crit, points=5, closest_match_dist=9000)

    self.assertEqual(lpc.eval_points, 5)
    self.assertEqual(lpc.closest_dist, 9000)

  



  

if __name__ == '__main__':
  unittest.main()