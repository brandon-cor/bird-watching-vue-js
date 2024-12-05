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
    Field("latitude", "double", label="Latitude"),
    Field("longitude", "double", label="Longitude"),
    Field("observation_date", "date", label="Observation Date"),
    Field("start_time", label="Time Observations Started"),
    Field("observer_id", "string", label="Observer ID"),
    Field("duration_minutes", "double", label="Duration (Minutes)"),
)

# Define the sightings table
db.define_table(
    "sightings",
    Field("checklist_id", "string", label="Checklist ID"),
    Field("speciesss", "string", label="Species ID"),
    Field("observation_count", "double", requires=IS_FLOAT_IN_RANGE(1, None), label="Observation Count"),
)

#species: order of values
#COMMON NAME
if db(db.species).isempty():
    with open('apps/birdwatching/species.csv', 'r') as f:
        next(f)
        reader = csv.reader(f)
        for row in reader:
            db.species.insert(name=row[0])
            
#checklist: order of values
#SAMPLING EVENT IDENTIFIER,LATITUDE,LONGITUDE,OBSERVATION DATE,TIME OBSERVATIONS STARTED,OBSERVER ID,DURATION MINUTES
# Import checklists: order of values - SAMPLING EVENT IDENTIFIER,LATITUDE,LONGITUDE,OBSERVATION DATE,TIME OBSERVATIONS STARTED,OBSERVER ID,DURATION MINUTES
# Import checklists: order of values - SAMPLING EVENT IDENTIFIER,LATITUDE,LONGITUDE,OBSERVATION DATE,TIME OBSERVATIONS STARTED,OBSERVER ID,DURATION MINUTES
if db(db.checklists).isempty():
    with open('apps/birdwatching/checklists.csv', 'r') as f:
        next(f)
        reader = csv.reader(f)
        # next(reader)  # Skip the header row
        for row in reader:
            # try:
            #     duration = int(float(row[6])) if row[6].strip() else None
            #     if duration is None:
            #         print(f"Skipping row due to missing duration: {row}")
            #         continue
            #     id = db.checklist.insert(sampling_event_id=row[0],observation_date=row[3],
                    
            #         observer_id=row[5],)

            #     if row[1]:
            #         db(db.checklist.id == id).update(latitude=row[1])
            #     if row[2]:
            #         db(db.checklist.id == id).update(longitude=row[2]) 
            #     if row[4]:
            #         db(db.checklist.id == id).update(start_time=row[4]) 
            #     if row[6]:
            #         db(db.checklist.id == id).update(duration_minutes=row[6])     
                db.checklists.insert(
                    sampling_event_id=row[0],
                    latitude=float(row[1]),  # Ensure latitude is a float
                    longitude=float(row[2]),  # Ensure longitude is a float
                    observation_date=row[3],
                    start_time=row[4],
                    observer_id=row[5],
                    duration_minutes=row[6]  # Use the validated duration
                )
            # except ValueError as e:
            #     print(f"Skipping row due to error: {row} -> {e}")


#sightings: order of values
#SAMPLING EVENT IDENTIFIER,COMMON NAME,OBSERVATION COUNT
if db(db.sightings).isempty():
    with open('apps/birdwatching/sightings.csv', 'r') as f:
        next(f)
        reader = csv.reader(f)
        a = 0
        for row in reader:
            a += 1
            print(a)
            db.sightings.insert(checklist_id=row[0], speciesss=row[1], observation_count=row[2])

db.commit()