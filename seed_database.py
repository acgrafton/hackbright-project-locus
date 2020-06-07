import os
import crud, model, server
from random import randint, choice

os.system('dropdb locus')
os.system('createdb locus')

model.connect_to_db(server.app)
model.db.create_all()

lname = ['smith', 'brown', 'doe', 'jones', 'william', 'chan', 
        'lee', 'hong', 'gonzales', 'lopez']
for n in range(10):
    email = f'user{n}@test.com'
    first_name= 'jane'
    last_name= f'{choice(lname)}'
    password = 'test'

    user = crud.create_user(email, first_name, last_name, password)

    print(user)