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
    return config.SQLALCHEMY_DATABASE_URI#'Test, API call!'

# @app.route('/login')
# def login():
#     return 'Login call!'

# @app.route('/logout')
# def logout():
#     return 'Logout call!'

# @app.route('/sigup')
# def sigup():
#     return 'signup call!'

# @app.route('/recover_password')
# def recover_password():
#     return 'recover_password call!'

# @app.route('/get_history')
# def get_history():
#     return 'get_history call!'

# @app.route('/get_suggestion')
# def get_suggestion():
#     return 'get_suggestion call!'

# @app.route('/upload_meal')
# def upload_meal():
#     return 'upload_meal call!'

# @app.route('/upload_meal_and_get_suggestion')
# def upload_meal_and_get_suggestion():
#     return 'upload_meal_and_get_suggestion call!'