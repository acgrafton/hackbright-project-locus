const GROCERY_STORES = {'Q': 'grocery store', 'dbPlaceType': 'grocery',
'options': ['Safeway', 'Albertsons', 'Vons', 'Jewel-Osco', 'Acme Markets', 'Shaw\'s',
'Andronico\'s', 'Carrs', 'Haggen', 'Lucky', 'Pavilions', 'Randalls', 
'Star Market', 'Tom Thumb', 'United Supermarkets', 'Food Lion', 'Stop & Shop', 
'Giant Food Stores', 'Hannaford', 'Giant Food', 'Kroger', 'Harris Teeter', 
'King Soopers', 'Roundy\'s', 'Smith\'s', 'Fred Meyer', 'QFC', 'Ruler Foods', 
'Food 4 Less', 'City Market', 'Baker\'s', 'Dillons', 'Fry\'s', 'Gerbes', 
'JayC Food Stores', 'Mariano\'s Fresh Market', 'Owen\'s', 
'Pay Less Super Markets', 'Ralphs', 'Target', 'Walmart', 'The Fresh Market',
'Sprouts Farmers Market', 'Trader Joe\'s', 'Whole Foods']};

const BANKS = {'Q': 'bank', 'dbPlaceType': 'banks', 'options': ['Huntington National Bank', 
'Wells Fargo Bank', 'Chase Bank', 'Allahabad Bank', 'U.S. Bank', 'PNC Bank', 
'BB&T', 'Regions Bank', 'SunTrust Bank', 'TD Bank', 'Fifth Third Bank',   
'KeyBank', 'Citizens Bank', 'M&T Bank', 'Citibank', 'Capital One Bank',
'Woodforest National Bank', 'Huntington Bank', 'Scotia Bank', 'Compass Bank']};

const RESTAURANTS = {'Q': 'restaurant', 'dbPlaceType': 'restaurant', 'options': ['LongHorn Steakhouse', 
'Texas Roadhouse', 'Cracker Barrel', 'Olive Garden', 'Red Lobster', 'Outback Steakhouse', 'TGI Fridays', 
'Applebee’s', 'Denny’s', 'Red Robin', 'Ruby Tuesday', 'Chili’s']};

const ETHNIC_RESTAURANTS = {'Q': 'ethnic restaurant category', 'dbPlaceType': 'restaurants',
'options': ['Asian Fusion', 'Chinese', 'Ethiopian', 'French', 'Italian',
'Indian', 'Japanese', 'Korean', 'Mexican', 'Mediteranean']}

const COFFEE = {'Q': 'coffee and tea', 'dbPlaceType': 'coffee', 'options': ['Starbucks', 'Dunkin', 
'Dutch Bros. Coffee', 'Seattle\'s Best Coffee', 'Caribbou Cofee', 
'Peet\'s Coffee and Tea', 'The Coffee Bean & Tea Leaf', 
'Dunn Bros Coffee', 'Tully\'s Coffee', 'PJ\'s Coffee of New Orleans']};

const ACTIVITIES = {'Q': 'leisure activities','label': 'leisure', 'options': {'Air Travel': 'airports',
'Beach': 'beaches','Hiking': 'hiking', 'Movie': 'movietheaters', 'Museums': 'museums',  
'Nightlife': 'nightlife', 'Parks': 'parks', 'Shopping': 'shopping'}};

const CHILDCARE = {'Q': 'childcare','label': 'childcare', 'options': {'Daycare': 'childcare', 
'Preschool': 'preschools'}};

const EDUCATION = {'Q': 'schools', 'label': 'education',
                 'options': {'Elementary Schools': 'elementaryschools', 
                            'Middle Schools and High Schools': 'highschools'}};

const CATEGORY_SET1 = [GROCERY_STORES, BANKS, COFFEE];

const CATEGORY_SET2 = [ACTIVITIES, CHILDCARE, EDUCATION];

const CATEGORIES = {'food': 'Food', 'health': 'Health', 'education': 'Education', 'financialservices': 'Financial Services',
                    'gym': 'Gym', 'publicservicesgovt': 'Government', 'petservices': 'Pet Services',
                    'religiousorgs': 'Religious', 'restaurants': 'Restaurants', 'shopping': 'Shopping'}
