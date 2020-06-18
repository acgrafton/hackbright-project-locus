from unittest import TestCase
from server import app

from model import db, connect_to_db, example_data
import crud, server

class FlaskTests(TestCase):

  def setUp(self):

    self.client = app.test_client()
    app.config(['TESTING']) = True


  def test_home(self):
    """Tests the '/' route"""

    result. = self.client.get('/')
    self.assertEqual(result.status_code, 200)
    self.assetIn(b'sign up', result.data)



  class FlaskTestsDatabase(TestCase):
    """Flask tests that use the database"""

    def setUp(self):

    self.client = app.test_client()
    app.config(['TESTING']) = True

    connect_to_db(app, "postgresql:///testdb")

    db.create_all()
    example_data()

    def tearDown(self):

      db.session.remove()
      db.drop_all()
      db.engine.dispose()
      

    def test_register(self):
      """Test login page."""

      reg_data = {'email': 'jo@penguin.com', 'username': 'jmarch',
                  'first-name': 'jo','last-name': 'march','password': 'pen'}

      result = self.client.post("/new_user", 
                                data=(reg_data), 
                                follows_redirects=True)

      self.assertIn(b"Your account has been successfuly created.", result.data)

    
    def test_add_criteria(self):
      """Test set_criteria route"""

      data = {'place-type': 'bubbletea', 'importance': '5'}

      result = self.client.post("/api/set_criteria",
                                data=data,
                                follows_redirects=True)

      self.assertIn(b'Bubble Tea', result.data)


    # def test_add_location(self):
    #   """Test set_criteria route"""

    #   data = {'address': '', 'point': ''}

    #   result = self.client.post("/api/criteria",
    #                             data=data,
    #                             follows_redirects=True)

    #   self.assertIn(b'', result.data)


    def test_logout(self):
      """Test login page with correct login."""

      result = self.client.post("/login", 
                                data=(login_data), 
                                follows_redirects=True)

      self.assertIn(b"<h2>sign up</h2>'", result.data)

    def test_correct_login(self):
    """Test login page with correct login."""

      login_data = {'username': 'jmarch', 'password': 'pen'}

      result = self.client.post("/login", 
                                data=(login_data), 
                                follows_redirects=True)

      self.assertIn(b"Your account has been successfuly created.", result.data)





