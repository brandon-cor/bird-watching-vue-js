"""
This file defines actions, i.e. functions the URLs are mapped into
The @action(path) decorator exposed the function at URL:

    http://127.0.0.1:8000/{app_name}/{path}

If app_name == '_default' then simply

    http://127.0.0.1:8000/{path}

If path == 'index' it can be omitted:

    http://127.0.0.1:8000/

The path follows the bottlepy syntax.

@action.uses('generic.html')  indicates that the action uses the generic.html template
@action.uses(session)         indicates that the action uses the session
@action.uses(db)              indicates that the action uses the db
@action.uses(T)               indicates that the action uses the i18n & pluralization
@action.uses(auth.user)       indicates that the action requires a logged in user
@action.uses(auth)            indicates that the action requires the auth object

session, db, T, auth, and tempates are examples of Fixtures.
Warning: Fixtures MUST be declared with @action.uses({fixtures}) else your app will result in undefined behavior
"""

from py4web import action, request, abort, redirect, URL
from yatl.helpers import A
from .common import db, session, T, cache, auth, logger, authenticated, unauthenticated, flash
from py4web.utils.url_signer import URLSigner
from .models import get_user_email, get_time
import urllib.parse
import uuid

url_signer = URLSigner(session)

@action('index')
@action.uses('index.html', db, auth.user, url_signer)
def index():
    return dict(
        # COMPLETE: return here any signed URLs you need.
        my_callback_url = URL('my_callback', signer=url_signer),
        get_user_stats_url = URL('get_user_stats', signer=url_signer),
        get_species_trends_url = URL('get_species_trends', signer=url_signer),
        search_species_url = URL('search_species', signer=url_signer),
        heatmap_data_url = URL('heatmap_data', signer=url_signer),
        add_checklist_url = URL('add_checklist', signer=url_signer),
    )

@action('my_callback')
@action.uses() # Add here things like db, auth, etc.
def my_callback():
    # The return value should be a dictionary that will be sent as JSON.
    return dict(my_value=2)

@action("stats", method=["GET"])
@action.uses("stats.html", auth.user)
def stats():
    return dict()

@action("get_user_stats", method=["GET"])
@action.uses(db, auth.user)
def get_user_stats():
    user_email = auth.current_user.get("email")
    print(f"Logged-in user: {user_email}")
    try:
        stats = db.executesql('''
            SELECT common_name, SUM(observation_count) AS total_count
            FROM sightings
            JOIN checklists ON sightings.sampling_event_identifier = checklists.sampling_event_id
            WHERE checklists.observer_id = ?
            GROUP BY common_name
        ''', [user_email])
        print(f"Query results: {stats}")
        return dict(stats=[{"common_name": row[0], "total_count": row[1]} for row in stats])
    except Exception as e:
        return dict(error=str(e))

@action("get_species_trends", method=["GET"])
@action.uses(db, auth.user)
def get_species_trends():
    species_name = request.params.get("species", "").strip()
    user_email = auth.current_user.get("email")
    if not species_name:
        return dict(error="Species name is required.")
    try:
        trends = db.executesql('''
            SELECT observation_date, SUM(observation_count) AS count
            FROM sightings
            JOIN checklists ON sightings.sampling_event_identifier = checklists.sampling_event_id
            WHERE checklists.observer_id = ? AND sightings.common_name = ?
            GROUP BY observation_date
            ORDER BY observation_date ASC
        ''', [user_email, species_name])
        return dict(trends=[{"observation_date": row[0], "count": row[1]} for row in trends])
    except Exception as e:
        return dict(error=str(e))

@action("search_species", method=["GET"])
@action.uses(db)
def search_species():
    query = request.params.get("q", "").strip()
    if not query:
        return dict(species=[], message="Query is empty.")
    species = db(db.species.name.contains(query)).select(limitby=(0, 20)).as_list()
    return dict(species=species)

@action("get_overall_trends", method=["GET"])
@action.uses(db, auth.user)
def get_overall_trends():
    user_email = auth.current_user.get("email")
    rows = db.executesql('''
        SELECT strftime('%Y-%m', observation_date) AS month, SUM(observation_count) AS total_count
        FROM checklists
        JOIN sightings ON checklists.sampling_event_id = sightings.sampling_event_identifier
        WHERE checklists.observer_id = ?
        GROUP BY month
        ORDER BY month ASC
    ''', [user_email])
    return dict(trends=[
        {"month": row[0], "total_count": row[1]} for row in rows
    ])


@action('heatmap_data', method=['GET'])
@action.uses(db)
def heatmap_data():
    # Get the full query string
    query_string = request.query_string
    
    # Check if the query string contains a second '?' and split it
    if "?" in query_string:
        query_string = query_string.split("?", 1)[1]
    
    # Parse the query string manually
    query_params = urllib.parse.parse_qs(query_string)
    species_name = query_params.get("species_name", [""])[0].strip()

    if not species_name:
        rows = db.executesql('''
            SELECT
                c.latitude,
                c.longitude,
                SUM(s.observation_count) AS density
            FROM checklists c
            JOIN sightings s ON c.sampling_event_id = s.sampling_event_identifier
            GROUP BY c.latitude, c.longitude
        ''', as_dict=True)
        return dict(data=rows)
    rows = db.executesql('''
        SELECT
            c.latitude,
            c.longitude,
            SUM(s.observation_count) AS density
        FROM checklists c
        JOIN sightings s ON c.sampling_event_id = s.sampling_event_identifier
        WHERE s.common_name = ?
        GROUP BY c.latitude, c.longitude
    ''', [species_name], as_dict=True)
    return dict(data=rows)

@action("checklist")
@action.uses("checklist.html", db, auth.user)
def checklist():
    return dict(
        get_checklist_url = URL('get_checklist'),
        search_species_url = URL('search_species'),
        update_checklist_url = URL('update_checklist'),
        delete_sighting_url = URL('delete_sighting')
    )

@action("add_checklist", method="POST")
@action.uses(db, auth.user)
def add_checklist():
    user_email = get_user_email()
    latitude = request.json.get('latitude')
    longitude = request.json.get('longitude')
    current_sample_id = "S" + str(uuid.uuid4())
    date_time = get_time()
    db.checklists.insert(
                sampling_event_id=current_sample_id,
                latitude=float(latitude),
                longitude=float(longitude),
                observation_date=date_time.date(),
                start_time=date_time.time().strftime("%H:%M:%S"),
                observer_id=user_email,
                duration_minutes=0,
                )
    return dict(c_id=current_sample_id)

@action("get_checklist", method="POST")
@action.uses(db, auth.user)
def get_checklist():
    user_email = get_user_email()
    sample_id = request.json.get("sample_id")
    alist = db((db.checklists.sampling_event_id == sample_id) & (db.checklists.observer_id == user_email)).select().as_list()
    blist = db(db.sightings.sampling_event_identifier == sample_id).select().as_list()
    return dict(list=alist, sightings=blist)

@action("update_checklist", method="POST")
@action.uses(db, auth.user)
def get_checklist():
    user_email = get_user_email()
    sightings = request.json.get("sightings")
    sample_id = request.json.get("sample_id")
    date = request.json.get("date")
    start_time = request.json.get("start_time")
    duration = request.json.get("duration")

    # update checklist info
    db((db.checklists.sampling_event_id == sample_id)).update(
                # latitude=float(row[1]) if row[1] else None,  # Ensure this is a float
                # longitude=float(row[2]) if row[2] else None,  # Ensure this is a float
                observation_date=date,
                start_time=start_time,
                # observer_id=row[5] if row[5] else None,
                duration_minutes=duration# Convert duration_minutes to an integer or set to None if empty
            )

    # update sightings
    for sighting in sightings:
        db.sightings.update_or_insert((db.sightings.sampling_event_identifier == sample_id) & (db.sightings.common_name == sighting["common_name"]),
                                        sampling_event_identifier=sample_id,
                                        common_name=sighting["common_name"],
                                        observation_count=sighting["observation_count"])

    return dict()

@action('delete_sighting', method="POST")
@action.uses(db, auth.user)
def delete_sighting():
    sample_id = request.json.get('sample_id')
    name = request.json.get('name')
    db((db.sightings.sampling_event_identifier == sample_id) & (db.sightings.common_name == name)).delete()
    return "ok"

@action("mychecklist")
@action.uses("mychecklist.html", db, auth.user)
def mychecklist():
    return dict(
        get_checklist_url = URL('get_checklist'),
        search_species_url = URL('search_species'),
        update_checklist_url = URL('update_checklist'),
        delete_sighting_url = URL('delete_sighting'),
        load_checklists_url = URL('load_checklists'),
        delete_checklist_url = URL('delete_checklist')
    )

@action("load_checklists")
@action.uses(db, auth.user)
def load_checklists():
    user_email = get_user_email()
    user_checklists = db((db.checklists.observer_id == user_email)).select().as_list()

    # load sightings for each checklist
    for user in user_checklists:
        user["sightings"] = db(db.sightings.sampling_event_identifier == user["sampling_event_id"]).select().as_list()
        

    return dict(checklists=user_checklists)

@action('delete_checklist', method="POST")
@action.uses(db, auth.user)
def delete_sighting():
    sample_id = request.json.get('sample_id')
    db((db.sightings.sampling_event_identifier == sample_id)).delete()
    db((db.checklists.sampling_event_id == sample_id)).delete()
    return "ok"