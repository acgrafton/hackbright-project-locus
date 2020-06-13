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
    password = request.args.get('password')

    #Check email in database
    if crud.get_user_by_email(email) == None:
        flash('Incorrect email.')

    #Check password match
    elif crud.verify_password_by_email(email, password) == False:
        flash('Incorrect password.') 

    #Save user to session
    else: 
        session['user'] = email
        flash(f'You are logged in')

    return redirect('/profile')

@app.route('/api/logout', methods=['POST'])
def lof_out_user():
    """Clear user out of session data"""
    session.pop('user', None)
    flash('You have logged out')

    return redirect('/')


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
        session['new_user': True]
        flash('Your account has been successfuly created. Now let\'s set your location criteria.')
        
    return render_template("profile.html")

@app.route('/profile')
def show_profile():

    if not session.get('user') is None:
        user = crud.get_user_by_email(session['user'])
        criteria = user.place_criteria #list of PlaceCriteria objects
        scores = user.scores #list of Location object


    return render_template('profile.html', 
                            user=user,
                            criteria=criteria,
                            scores=scores ,
                            )

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


@app.route('/api/set_criteria', methods=['POST'])
def save_user_criteria():
    """Save users criteria into database"""

    user = crud.get_user_by_email(session['user'])
    selected_place_type = request.form.get('place-type')
    selected_importance = request.form.get('importance')

    place_type_id = crud.get_place_type_id_by_title(selected_place_type)

    user.add_place_criterion(place_type_id, selected_importance)

    flash('Criteria saved!')

    return redirect('/profile')




if __name__ == '__main__':
    connect_to_db(app)
    app.run(host='0.0.0.0', debug=True)
