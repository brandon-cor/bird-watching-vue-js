"""
This file defines the database models
"""

import datetime
from .common import db, Field, auth
from pydal.validators import *

import csv


def get_user_email():
    return auth.current_user.get('email') if auth.current_user else None

def get_time():
    return datetime.datetime.utcnow()



# Define the species table
db.define_table(
    "species",
    Field("name", "string", unique=True, notnull=True, label="Common Name"),
    format="%(name)s",
)

# Define the checklists table
db.define_table(
    "checklists",
    Field("sampling_event_id", "string", unique=True, notnull=True, label="Sampling Event ID"),
    Field("latitude", "double", notnull=True, label="Latitude"),
    Field("longitude", "double", notnull=True, label="Longitude"),
    Field("observation_date", "date", notnull=True, label="Observation Date"),
    Field("start_time", "time", notnull=True, label="Time Observations Started"),
    Field("observer_id", "string", notnull=True, label="Observer ID"),
    Field("duration_minutes", "integer", requires=IS_INT_IN_RANGE(1, None), label="Duration (Minutes)"),
)

# Define the sightings table
db.define_table(
    "sightings",
    Field("checklist_id", "reference checklists", notnull=True, label="Checklist ID"),
    Field("species_id", "reference species", notnull=True, label="Species ID"),
    Field("observation_count", "integer", requires=IS_INT_IN_RANGE(1, None), label="Observation Count"),
)

#species: order of values
#COMMON NAME
if db(db.species).isempty():
    with open('species.csv', 'r') as f:
        reader = csv.reader(f)
        for row in reader:
            db.species.insert(name=row[0])
            
#checklist: order of values
#SAMPLING EVENT IDENTIFIER,LATITUDE,LONGITUDE,OBSERVATION DATE,TIME OBSERVATIONS STARTED,OBSERVER ID,DURATION MINUTES
if db(db.checklist).isempty():
    with open('species.csv', 'r') as f:
        reader = csv.reader(f)
        for row in reader:
            db.species.insert(sampling_event_id=row[0],
                                latitude=row[1],
                                longitude=row[2],
                                observation_date=row[3],
                                start_time=row[4], observer_id=row[5], duration_minutes=row[6])
            
#sightings: order of values
#SAMPLING EVENT IDENTIFIER,COMMON NAME,OBSERVATION COUNT
if db(db.sightings).isempty():
    with open('sightings.csv', 'r') as f:
        reader = csv.reader(f)
        for row in reader:
            db.species.insert(checklist_id=row[0], species_id=row[1], observation_count=row[2])

db.commit()