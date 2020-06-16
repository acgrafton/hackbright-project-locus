from flask import (Flask, render_template, request, flash, session, redirect, jsonify)
from model import connect_to_db
import crud
import os
import googlemaps
from pprint import pformat

from jinja2 import StrictUndefined 

app = Flask(__name__)
app.secret_key = "dev"
app.jinja_env.undefined = StrictUndefined

API_KEY = os.environ['GOOGLE_TOKEN']

gmaps = googlemaps.Client(key=API_KEY)

@app.route('/')
def show_homepage():
    """Show homepage if not logged in, otherwise redirect to profile page"""

    if session.get('user') is None:

        return render_template("homepage.html")

    else:

        username = session['user']

        return redirect(f'/profile/{username}')


@app.route('/new_user', methods=['POST'])
def register_user():
    """Register new user"""
    
    email = request.form.get('email')
    username = request.form.get('username')
    first_name = request.form.get('first-name')
    last_name = request.form.get('last-name')
    password = request.form.get('password')

    print(email, username, first_name, last_name, password)

    if crud.get_user(email):
        flash('This email has already been created.')
    else: 
        user = crud.create_user(email, username, first_name, last_name, password)
        flash('Your account has been successfuly created. Now let\'s set your location criteria.')
        
    return redirect('profile/<username>')


@app.route('/api/login', methods=['POST'])
def log_in_user():
    """Provided correct email and password, log-in user"""


    username = request.form.get('username')
    password = request.form.get('password')
    print(username,password)

    #Check email in database
    if crud.get_user(username) == None:
        flash('Incorrect username.')

    #Check password match
    elif crud.verify_password(username, password) == False:
        flash('Incorrect password.') 

    #Save user to session
    else: 
        session['user'] = username
        session['logged_in'] = 'yes'
        flash(f'You are logged in')

    return redirect(f'/profile/{username}')


@app.route('/api/logout', methods=['POST'])
def log_out_user():
    """Clear user out of session data"""
    session.pop('user', None)
    flash('You have logged out')

    return redirect('/')


@app.route('/api/edit_user', methods=['POST'])
def save_user_changes():
    """Save user changes"""

    first_name = request.form.get('edit-first-name')
    last_name = request.form.get('edit-last-name')
    email = request.form.get('edit-email')

    username = session['user']
    user = crud.get_user(username)
    
    info_changed = False

    if user.first_name != first_name:
        user.update_first_name(first_name)
        info_changed = True
    if user.last_name != last_name:
        user.update_last_name(last_name)
        info_changed = True
    if user.email != email:
        user.update_email(email)
        info_changed = True

    if info_changed == True:
        flash('Changes saved')
    else:
        flash('No change')

    return redirect(f'/profile/{username}')


@app.route('/api/remove_user', methods=['POST'])
def remove_user():
    """Remove a user"""

    try:
        crud.delete_user(session['user'])
        session.pop('user', None)

        return jsonify({'success': True})

    except Exception as err:
        return jsonify({'success': False,
                        'error': str(err)})


@app.route('/api/edit_password', methods=['POST'])
def save_password_changes():
    """Save password changes"""

    password = request.form.get('edit-password')

    username = session['user']
    user = crud.get_user(username)

    if user.password != password:
        user.update_password(password)
        flash('Password changed')
    else:
        flash('No change')

    return redirect(f'/profile/{username}')


@app.route('/profile/<username>')
def show_profile(username):
    """Render user profile page if logged in. Otherwise, redirect to homepage"""

    if session.get('user') == username and session['logged_in'] == 'yes':
        user = crud.get_user(username)
        criteria = user.place_criteria #list of PlaceCriteria objects
        scores = user.scores #list of Location object

        return render_template('profile.html', 
                                user=user,
                                criteria=criteria,
                                scores=scores,
                                )
    else:
        return redirect('/')


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

    username = session['user']
    user = crud.get_user(username)
    selected_place_type = request.form.get('place-type')
    selected_importance = request.form.get('importance')

    place_type_id = crud.get_place_type_id_by_title(selected_place_type)

    user.add_place_criterion(place_type_id, selected_importance)

    flash('Criteria saved!')

    return redirect(f'/profile/{username}')


@app.route('/api/remove_criteria', methods=['POST'])
def remove_criteria():
    """Remove a criteria from a user"""

    #Retrieve data in parsed JSON form
    data = request.json

    #Retrieve user
    username = session['user']
    user = crud.get_user(username)

    place_type_id = data['placeID']

    try:
        user.del_place_crit(place_type_id)

        return jsonify({'success': True})

    except Exception as err:
        return jsonify({'success': False,
                        'error': str(err)})




@app.route('/api/criteria', methods=['POST'])
def get_user_criteria_json():
    """Return criteria in JSON"""

    #User selected location
    address = request.json['address']
    
    #Retrieve user
    user = crud.get_user(session['user'])
    
    #Get dictionary of score and criteria
    return jsonify(user.score_location(address))


@app.route('/search_location')
def display_location_search():
    """Display location search page"""

    return render_template('location.html',
                            key=API_KEY)





if __name__ == '__main__':
    connect_to_db(app)
    app.run(host='0.0.0.0', debug=True)
