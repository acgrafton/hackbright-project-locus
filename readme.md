## Locus
Locus is a tool that helps people looking to move to quickly find out if a given location has the places and services that they want nearby. Users save a list of place types in their criteria and then can get locations scored by entering in the address and see the places that meet the criteria on a map. Scored locations can be viewed together so that users can compare locations based on their scores.

## About Me
Angela has always had an interest in coding deriving from her work as a Revenue Management professional in the hospitality industry and working in various industry software systems as the field evolved. Working full-time and taking care of two young children left little time to pursue other interests but due to the Covid-19 impact on travel, she found herself furloughed for the first time. With encouragement from her software engineer brother, she took the opportunity to take the Hackbright Software Engineering Prep course and found that her detail-oriented skill and love for creative problem-solving and critical analysis crossed over seamlessly into computer programming,  She entered Hackbright’s Full-time Software Engineering after finding it a great fit with its emphasis on Python and additional key programming languages as well as providing community support for her journey down this new path. She is enthusiastic and dedicated to launching a new career as a Full-Stack Developer. 

## Contents
* [Tech Stack](#tech-stack)
* [Features](#features)

## <a name="tech-stack"></a>Technologies
* Python
* Flask
* Jinja2
* PostgresQL
* SQLAlchemy ORM
* HTML
* CSS
* Bootstrap
* jQuery
* Google Maps Api
* Yelp Api

## <a name="features"></a>Features

#### Homepage - User Registration / Login / Get Started Questionaire
User registration and login is managed server-side using Flask. After registration, user is redirected to a questionaire with common criteria to get started.

![alt text](https://github.com/acgrafton/hackbright-project-locus/raw/master/static/images/homepage.png "Locus Homepage")

![alt text](https://github.com/acgrafton/hackbright-project-locus/raw/master/static/images/get_started.png "Get Started")


#### User Mainpage - Manage User Info and Criteria / View Scored Locations
User can make changes to their user info. 

![alt text](https://github.com/acgrafton/hackbright-project-locus/raw/master/static/images/user.png "User")

Criteria tab: User can see a larger category menu and then some additional place types. Categories and Place Types from Yelp API. 

![alt text](https://github.com/acgrafton/hackbright-project-locus/raw/master/static/images/criteria.png "Criteria")

Scored Locations tab: User can view and/or remove previously scored locations. Location cards show the name of the closest match for each criteria. Users can also click on Add Locations to get redirected Location Scoring page.

![alt text](https://github.com/acgrafton/hackbright-project-locus/raw/master/static/images/scored_loc.png "Scored Locations")

#### Score a Location
User can enter in location using the Google Autocomplete and see it on the Google Map. User can click on Score Location to see location matches of the User's criteria pinned on the map as well as the location score displayed.

![alt text](https://github.com/acgrafton/hackbright-project-locus/raw/master/static/images/add_location.png "Score a Location")


