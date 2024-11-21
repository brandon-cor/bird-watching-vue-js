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


### Define your table below

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

db.commit()
