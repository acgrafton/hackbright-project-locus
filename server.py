from flask import (Flask, render_template, request, flash, session, redirect)
from model import connect_to_db
import crud
import os
import googlemaps
from pprint import pformat
from datetime import datetime

from jinja2 import StrictUndefined 

app = Flask(__name__)
app.secret_key = "dev"
app.jinja_env.undefined = StrictUndefined

API_KEY = os.environ['GOOGLE_TOKEN']

gmaps = googlemaps.Client(key=API_KEY)

@app.route('/')
def show_homepage():
    """Show homepage"""

    return render_template("homepage.html")

@app.route('/search')
def show_results():
    """Show results of nearby places"""

    #Retrieve user-input address
    address = request.args.get('address')


    geocode_results = gmaps.geocode(address)
    location = geocode_results[0]['geometry']['location']
    latitude = location['lat']
    longitude = location['lng']

    police = gmaps.places_nearby(location=location, radius=5000, type='police')
    pharmacy = gmaps.places_nearby(location=location, radius=5000, type='pharmacy')
    post_office = gmaps.places_nearby(location=location, radius=5000, type='post_office')
    gov = gmaps.places_nearby(location=location, radius=5000, type='local_government_office')
    city_hall = gmaps.places_nearby(location=location, radius=5000, type='city_hall')
    bank = gmaps.places_nearby(location=location, radius=5000, type='bank')
    #returns a list of places
    timezone = gmaps.timezone(location)['timeZoneName']

    #Show result page categorized by Public Services
    return render_template("search_results.html",
                            results=geocode_results)

@app.route('/login')
def log_in_user():
    """Provided correct email and password, log-in user"""

    #Check email in database
    if crud.get_user_by_email(email) == None:
        flash('Incorrect email.')

    #Check password match
    elif crud.verify_password(email, password) == False:
        flash('Incorrect password.') 

    #Save user to session
    else: 
        user = crud.get_user_by_email(email)
        session['user'] = user
        flash('Logged in!')

    return redirect('/')

@app.route('/new_user', methods=['POST'])
def register_user():
    """Register new user"""
    
    email = requests.form.get('email')
    first_name = requests.form.get('first-name')
    last_name = requests.form.get('last-name')
    password = requests.form.get('password')

    if crud.get_user_by_email(email):
        flash('This email has already been created.')
    else: 
        user = crud.create_user(email, first_name, last_name, password)
        flash('Your account has been successfuly created. Please log in.')
        
    return redirect('/')


if __name__ == '__main__':
    connect_to_db(app)
    app.run(host='0.0.0.0', debug=True)
