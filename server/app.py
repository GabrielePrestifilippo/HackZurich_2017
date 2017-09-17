from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import config
import os

app = Flask(__name__)

app.config.from_object(config)
app_secret = 'q9837asdvn23io4qu34#4534230989l1orubxalskdf'

db = SQLAlchemy(app)
db.init_app(app)

import routing_accounts
import routing_meals


@app.route('/')
def test():
    return 'Test, API call!'

# @app.route('/recommendations')
# def test_chicken():
#     filename = "mock_hz.txt"
#     f = open(filename, "r")
#     return f.read()