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
    if session.get('user') is not None:
        user = session['user']
        return redirect(f'/profile/{user}')
    else:
        return render_template("homepage.html")


@app.route('/api/new_user', methods=['POST'])
def register_user():
    """Register new user."""
    email = request.form.get('email')
    first_name = request.form.get('firstName')
    last_name = request.form.get('lastName')
    password = request.form.get('password')
    #If user does not yet exist in database, create new user.  
    if crud.get_user(email):
        # return jsonify({'success': False})
        return redirect(f'/profile/${email}')
    else:
        crud.create_user(email, first_name, last_name, password)
        session['user'] = email
        session['logged_in'] = 'yes'
        return jsonify({'success': True})


@app.route('/api/login', methods=['POST'])
def login_user():
    """Provided correct email and password, log-in user"""
    email = request.form.get('email')
    password = request.form.get('password')
    if crud.get_user(email) is None or crud.verify_password(email, password) is False:
        return jsonify(({'success': False, 'err': "Incorrect email or password"}))
    else: 
        session['user'] = email
        first_name = crud.get_user_info(email)
        session['logged_in'] = 'yes'
        return jsonify(({'success': True, 'first_name': first_name, 'email': session['user']}))


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

# @app.route('/api/edit_user', methods=['POST'])
# def save_user_changes():
#     """Save user changes"""
#     #Get form data
#     first_name = request.form.get('edit-first-name')
#     last_name = request.form.get('edit-last-name')
#     email = request.form.get('edit-email')
#     #Get email from session and get User object
#     email = session['user']
#     user = crud.get_user(email)
#     #Track changes
#     info_changed = False

#     if user.first_name != first_name:
#         user.update_first_name(first_name)
#         info_changed = True
#     if user.last_name != last_name:
#         user.update_last_name(last_name)
#         info_changed = True
#     if user.email != email:
#         user.update_email(email)
#         info_changed = True

#     return redirect(f'/profile/{email}')

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


@app.route('/profile/<email>')
def show_profile(email):
    """Render user profile page if logged in. Otherwise, redirect to homepage"""
    if session.get('user') == email and session['logged_in'] == 'yes':
        user = crud.get_user(email)
        criteria, scores = user.get_criteria, user.get_scores()
        return render_template('profile.html', 
                                user=user,
                                criteria=criteria,
                                scores=scores,
                                )
    return redirect('/')


@app.route('/api/criteria')
def get_user_criteria():
    """Get json of criteria"""
    email = session['user']
    return jsonify(crud.get_criteria(email))


@app.route('/api/remove_criteria', methods=['POST'])
def remove_criteria():
    """Remove a criteria from a user"""
    crit_id = request.json['critId']
    try:
        crud.del_criterion(crit_id)
        return jsonify({'success': True})
    except Exception as err:
        return jsonify({'success': False,
                        'error': str(err)})

@app.route('/questionaire')
def display_questionaire():
    """Display questionaire"""
    return render_template('questionaire.html')


@app.route('/api/add_criteria', methods=['POST'])
def add_criteria():
    """Add one criteria to database."""
    try:
        email = session['user']
        place_type = request.form.get('place-type')
        DOW = request.form.get('DOW')
        TOD = request.form.get('TOD') #time of day
        mode = request.form.get('mode')
        crud.add_criterion(email, place_type, DOW, TOD, mode)
        return jsonify({'success': True})
    except Exception as err:
        return jsonify({'success': False,
                        'error': str(err)})


@app.route('/api/score_location', methods=['POST'])
def get_searched_location_json():
    """Return criteria in JSON and score location"""
    #Geocode info from searched location
    geocode = request.json
    #Retrieve user
    email = session['user']
    #Get dictionary of score and criteria
    return jsonify(crud.score_location(email, geocode))


@app.route('/search_location')
def display_location_search():
    """Display location search page"""
    return render_template('location.html',
                            key=API_KEY)


@app.route('/api/scored_locations')
def get_scored_locations_json():
    """Get json of scored locations"""
    email = session['user']
    scored_locations = crud.get_scores(email)
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


@app.route('/api/get_place_types', methods=['GET'])
def get_place_types():
    return jsonify(crud.get_place_types())


if __name__ == '__main__':
    connect_to_db(app)
    app.run(host='0.0.0.0', debug=True)
