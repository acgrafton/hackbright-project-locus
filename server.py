import os

from flask import (Flask, render_template, request, flash, session, redirect, jsonify)
from model import connect_to_db
import crud
import googlemaps
from jinja2 import StrictUndefined 

app = Flask(__name__)
app.secret_key = "dev"
app.jinja_env.undefined = StrictUndefined

API_KEY = os.environ['GOOGLE_TOKEN']

gmaps = googlemaps.Client(key=API_KEY)


@app.route('/')
def show_homepage():
    """Show homepage if not logged in, otherwise redirect to profile page"""

    return render_template("homepage.html")


@app.route('/api/new_user', methods=['POST'])
def register_user():
    """Register new user."""
    
    data = request.json

    #Retrieve formdata
    email = data['email']
    username = data['username']
    first_name = data['firstName']
    last_name = data['lastName']
    password = data['password']

    #Alert if email already exists
    if crud.get_user(email):
        return jsonify({'success': False})
    
    #Otherwise, create new user account, add to session, and redirect to profile
    else:
        print('hello') 
        print(crud.create_user(email, username, first_name, last_name, password))
        session['user'] = username
        session['logged_in'] = 'yes'
        return jsonify({'success': True})


@app.route('/api/login', methods=['POST'])
def login_user():
    """Provided correct email and password, log-in user"""
    
    data = request.json

    #Retrieve formdata
    username = data['username']
    password = data['password']

    #Check email in database
    if crud.get_user(username) is None:
        print('Incorrect username.')

    #Check password match
    elif crud.verify_password(username, password) is False:
        print('Incorrect password.') 

    #Save user to session
    else: 
        session['user'] = username
        session['logged_in'] = 'yes'
        print('You are logged in')

    return redirect(f'/profile/{username}')


@app.route('/api/logout', methods=['POST'])
def log_out_user():
    """Clear user out of session data"""

    try:
        session.pop('user', None)
        session['logged_in'] = 'no'

        return jsonify({'success': True})

    except Exception as err:
        return jsonify({'success': False,
                        'error': str(err)})


@app.route('/api/edit_user', methods=['POST'])
def save_user_changes():
    """Save user changes"""

    #Get form data
    first_name = request.form.get('edit-first-name')
    last_name = request.form.get('edit-last-name')
    email = request.form.get('edit-email')

    #Get usename from session and get User object
    username = session['user']
    user = crud.get_user(username)
    
    #Track changes
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

    if info_changed:
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

@app.route('/api/add_commute_loc')
def save_commute_location():
    """Save commute location"""

    data = request.json

    username = session['user']
    user = crud.get_user(username)

    try:
        user.add_commute_loc(address = data['address'],
                            name = data['name'],
                            latitude=data['latitude'],
                            longitude=data['longitude'])

        return jsonify({'success': True})

    except Exception as err:
        return jsonify({'success': False,
                        'error': str(err)})


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


@app.route('/api/edit_criteria', methods=['POST'])
def save_criteria_edits():
    """Save users criteria into database"""

    username = session['user']
    user = crud.get_user(username)
    selected_place_type = request.form.get('place-type')
    selected_importance = request.form.get('importance')

    place_type_id = crud.get_place_type_id_by_title(selected_place_type)

    user.add_place_criterion(place_type_id, selected_importance)

    return redirect(f'/profile/{username}')


@app.route('/api/criteria')
def get_criteria_json():
    """Get json of criteria"""

    username = session['user']
    user = crud.get_user(username)

    criteria = user.get_place_criteria()

    print(criteria)

    return jsonify(criteria)


@app.route('/api/remove_criteria', methods=['POST'])
def remove_criteria():
    """Remove a criteria from a user"""

    #Retrieve data in parsed JSON form
    data = request.json

    #Retrieve user
    username = session['user']
    user = crud.get_user(username)

    try:
        #Delete criteria from database using placeId to get criteria
        user.del_place_crit(data['placeId'])

        return jsonify({'success': True})

    except Exception as err:
        
        return jsonify({'success': False,
                        'error': str(err)})


@app.route('/questionaire')
def display_questionaire():
    """Display questionaire"""

    return render_template('questionaire.html')


@app.route('/api/questionaire', methods=['POST'])
def process_questionaire():
    """Process questionaire by creating Place Criterion for user in database"""

    new_user_criteria = request.json

    user = crud.get_user(session['user'])

    try:
        crud.batch_add_pl_crit(user, new_user_criteria)

    except:
        return jsonify({'success': False,
                        'error': str(err)})


@app.route('/api/score_location', methods=['POST'])
def get_searched_location_json():
    """Return criteria in JSON and score location"""

    #Geocode info from searched location
    geocode = request.json
    
    #Retrieve user
    user = crud.get_user(session['user'])
    
    #Get dictionary of score and criteria
    return jsonify(crud.score_location(user, geocode))


@app.route('/search_location')
def display_location_search():
    """Display location search page"""

    return render_template('location.html',
                            key=API_KEY)


@app.route('/api/scored_locations')
def get_scored_locations_json():
    """Get json of scored locations"""

    username = session['user']
    user = crud.get_user(username)

    scored_locations = user.get_scores()

    return jsonify(scored_locations)


@app.route('/api/remove_location', methods=['POST'])
def remove_location():
    """Remove a user's score for a location"""

    #Retrieve data in parsed JSON form
    data = request.json

    score_id = data['scoreId']

    try:
        crud.del_score(score_id)

        return jsonify({'success': True})

    except Exception as err:
        return jsonify({'success': False,
                        'error': str(err)})

if __name__ == '__main__':
    connect_to_db(app)
    app.run(host='0.0.0.0', debug=True)
