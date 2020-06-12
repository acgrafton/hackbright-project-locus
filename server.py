from flask import (Flask, render_template, request, flash, session, redirect, jsonify)
from model import connect_to_db
import crud
import os
# import googlemaps
from pprint import pformat

from jinja2 import StrictUndefined 

app = Flask(__name__)
app.secret_key = "dev"
app.jinja_env.undefined = StrictUndefined

API_KEY = os.environ['GOOGLE_TOKEN']

# gmaps = googlemaps.Client(key=API_KEY)

@app.route('/')
def show_homepage():
    """Show homepage"""

    return render_template("homepage.html")

# @app.route('/search')
# def show_results():
#     """Show results of nearby places"""

#     #Retrieve user-input address
#     address = request.args.get('address')


#     geocode_results = gmaps.geocode(address)
#     location = geocode_results[0]['geometry']['location']
#     latitude = location['lat']
#     longitude = location['lng']

#     police = gmaps.places_nearby(location=location, radius=5000, type='police')
#     pharmacy = gmaps.places_nearby(location=location, radius=5000, type='pharmacy')
#     post_office = gmaps.places_nearby(location=location, radius=5000, type='post_office')
#     gov = gmaps.places_nearby(location=location, radius=5000, type='local_government_office')
#     city_hall = gmaps.places_nearby(location=location, radius=5000, type='city_hall')
#     bank = gmaps.places_nearby(location=location, radius=5000, type='bank')
#     #returns a list of places
#     timezone = gmaps.timezone(location)['timeZoneName']

#     #Show result page categorized by Public Services
#     return render_template("search_results.html",
#                             results=geocode_results)

@app.route('/login')
def log_in_user():
    """Provided correct email and password, log-in user"""

    email = request.args.get('email')
    print(email)
    password = request.args.get('password')
    print(password)

    #Check email in database
    if crud.get_user_by_email(email) == None:
        print('incorrect email')
        flash('Incorrect email.')

    #Check password match
    elif crud.verify_password_by_email(email, password) == False:
        flash('Incorrect password.') 
        print('incorrect password')

    #Save user to session
    else: 
        session['user'] = email
        flash('Logged in!')
        print(session)

    return redirect('/api/profile')

@app.route('/new_user', methods=['POST'])
def register_user():
    """Register new user"""
    
    email = request.form.get('email')
    first_name = request.form.get('first-name')
    last_name = request.form.get('last-name')
    password = request.form.get('password')

    if crud.get_user_by_email(email):
        flash('This email has already been created.')
    else: 
        user = crud.create_user(email, first_name, last_name, password)
        flash('Your account has been successfuly created. Now let\'s set your location criteria.')
        
    return render_template("profile.html")

@app.route('/api/profile')
def show_profile():

    # print(session)

    return render_template('profile.html')

@app.route('/api/place_categories')
def get_place_categories_json():
    """Return a JSON response with all place categories"""

    categories = crud.get_place_categories()

    list_categories = []

    for category in categories:
        list_categories.append(category.place_category_id)

    return jsonify(list_categories)


@app.route('/api/place_types/<selected_category>')
def get_place_types_json(selected_category):
    """Return a JSON response with all place types provided a selected category"""

    place_type = crud.get_place_type_ids_by_category(selected_category)

    return jsonify({selected_category: place_type})

@app.route('/api/save_place_type', methods=['POST'])
def save_place_type():
    """Save form submission data to database"""

    place_type_id = request.form.get('place-type')
    session['user'].add_place_criterion(place_type_id, 5)

    return redirect('api/profile')

if __name__ == '__main__':
    connect_to_db(app)
    app.run(host='0.0.0.0', debug=True)
