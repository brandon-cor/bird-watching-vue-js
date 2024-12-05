"""
This file defines the database models
"""
print("Models.py loaded.")


import datetime
from .common import db, Field, auth
from pydal.validators import *

import csv


def get_user_email():
    return auth.current_user.get('email') if auth.current_user else None

def get_time():
    return datetime.datetime.utcnow()

# Species table
db.define_table(
    "species",
    Field("name", "string", unique=True, notnull=True, label="Common Name"),
    format="%(name)s",
)

# Checklists table
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

# Sightings table
db.define_table(
    "sightings",
    Field("sampling_event_identifier", "string", notnull=True, label="Sampling Event ID"),
    Field("common_name", "string", notnull=True, label="Common Name"),
    Field("observation_count", "integer", requires=IS_INT_IN_RANGE(1, None), label="Observation Count"),
)


db.commit()

#species: order of values
#COMMON NAME
if db(db.species).isempty():
    with open('apps/birdwatching/species.csv', 'r') as f:
        reader = csv.reader(f)
        next(reader)  # Skip the header row
        for row in reader:
            db.species.insert(name=row[0])
            
#checklist: order of values
#SAMPLING EVENT IDENTIFIER,LATITUDE,LONGITUDE,OBSERVATION DATE,TIME OBSERVATIONS STARTED,OBSERVER ID,DURATION MINUTES
if db(db.checklists).isempty():
    with open('apps/birdwatching/checklists.csv', 'r') as f:
        reader = csv.reader(f)
        next(reader)  # Skip the header row
        for row in reader:
            try:
                db.checklists.insert(
                sampling_event_id=row[0] if row[0] else None,
                latitude=float(row[1]) if row[1] else None,  # Ensure this is a float
                longitude=float(row[2]) if row[2] else None,  # Ensure this is a float
                observation_date=row[3] if row[3] else None,
                start_time=row[4] if row[4] else "00:00:00",
                observer_id=row[5] if row[5] else None,
                duration_minutes=int(float(row[6])) if row[6] else None  # Convert duration_minutes to an integer or set to None if empty
            )
            except Exception as e:
                print(f"Error inserting row: {row}")
                print(e)
#sightings: order of values
#SAMPLING EVENT IDENTIFIER,COMMON NAME,OBSERVATION COUNT
if db(db.sightings).isempty():
    with open('apps/birdwatching/sightings.csv', 'r') as f:
        reader = csv.reader(f)
        next(reader)  # Skip the header row
        for row in reader:
            try:                
                # Insert into sightings table
                db.sightings.insert(
                    sampling_event_identifier=row[0],  # Use integer ID
                    common_name=row[1],     # Use integer ID
                    observation_count=int(row[2]) if row[2] != 'X' else 0  # Ensure count is an integer, set to 0 if 'X'
                )
            except Exception as e:
                print(f"Error inserting row {row}: {e}")
db.commit()
