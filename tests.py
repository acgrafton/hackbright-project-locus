import unittest
from server import app
import os
from model import db, connect_to_db
import crud, server

class FlaskTests(unittest.TestCase):

  def setUp(self):

    self.client = app.test_client()
    app.config['TESTING'] = True


  def test_home(self):
    """Tests the '/' route"""

    result = self.client.get('/')
    self.assertEqual(result.status_code, 200)
    self.assertIn(b'Finding Where You Want To Be', result.data)


class FlaskTestsDatabase(unittest.TestCase):
  """Flask tests that use the database"""

  def setUp(self):
    os.system('createdb testdb')

    self.client = app.test_client()
    app.config['TESTING'] = True

    connect_to_db(flask_app=app, db_uri='postgresql:///testdb')
    db.create_all()
    crud.create_user('rgreen@yahoo.com', 'rachel', 'green', 'diamonds')
    crud.create_user('pbuffay@yahoo.com', 'phoebe', 'buffay', 'smellycat')


  def tearDown(self):
    db.session.remove()
    db.drop_all()
    db.engine.dispose()
    os.system('dropdb testdb')
    

  def test_register_success(self):
    """Test new user registration with unique new user info."""
    reg_data = {'email': 'jo@penguin.com', 'firstName': 'jo','lastName': 'march','password': 'pen'}
    result = self.client.post("/api/new_user", 
                              data=(reg_data))
    self.assertIn(b'"success":true', result.data)

  def test_register_fail(self):
    """Test new user registration with existing new user info"""
    reg_data = {'email': 'jo@penguin.com', 'firstName': 'jo','lastName': 'march','password': 'pen'}
    self.client.post("/api/new_user", data=(reg_data))
    result = self.client.post("/api/new_user", data=(reg_data))
    self.assertIn(b'"success":false', result.data)

  def test_correct_login(self):
    """Test login page with correct login."""
    login_data = {'email': 'rgreen@yahoo.com', 'password': 'diamonds'}
    result = self.client.post("/login", data=(login_data))
    self.assertIn(b'"success":true', result.data)
  
  
  # def test_add_criteria(self):
  #   """Test set_criteria route"""

  #   data = {'place-type': 'bubbletea', 'importance': '5'}

  #   result = self.client.post("/api/set_criteria",
  #                             data=data,
  #                             follows_redirects=True)

  #   self.assertIn(b'Bubble Tea', result.data)


  # def test_logout(self):
  #   """Test login page with correct login."""

  #   result = self.client.post("/login", 
  #                             data=(login_data), 
  #                             follows_redirects=True)

  #   self.assertIn(b"<h2>sign up</h2>'", result.data)

  

if __name__ == "__main__":
  unittest.main()




