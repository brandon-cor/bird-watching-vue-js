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
from .models import get_user_email

url_signer = URLSigner(session)

@action('index')
@action.uses('index.html', db, auth, url_signer)
def index():
    return dict(
        # COMPLETE: return here any signed URLs you need.
        my_callback_url = URL('my_callback', signer=url_signer),
    )

@action('my_callback')
@action.uses() # Add here things like db, auth, etc.
def my_callback():
    # The return value should be a dictionary that will be sent as JSON.
    return dict(my_value=3)

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

