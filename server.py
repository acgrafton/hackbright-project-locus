from flask import (Flask, render_template, request, flash, session, redirect)
from model import connect_to_db
import crud
import os
import requests
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
                            police=police,
                            pharmacy=pharmacy,
                            post_office=post_office)



if __name__ == '__main__':
    connect_to_db(app)
    app.run(host='0.0.0.0', debug=True)
    geocode(address="San+Francisco")
