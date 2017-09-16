from werkzeug import generate_password_hash, check_password_hash
from flask import render_template, make_response, request, json, jsonify, flash
#https://pythonhosted.org/flask-mail/
#from mailer import sendMail
from app import app_secret, db
from access_control import userRequired

import os,sys,inspect
currentdir = os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
parentdir = os.path.dirname(currentdir)
sys.path.insert(0,parentdir) 

from speech_analysis import SpeechAnalysis


#file (fileKey)
#fileName

import model

@userRequired
def testMeals():
    #_token = request.form['token']
    #_audio_file = request.form['audio_file']

    return testNutrition(SpeechAnalysis.parse_foods('../data/chicken_dinner.mp3')).to_json(orient='values')

def testNutrition(foods):
    #_token = request.form['token']
    #_audio_file = request.form['audio_file']
    return nutritionBalance(SpeechAnalysis.nutrition_df(foods))

def nutritionBalance(df):
    #_token = request.form['token']
    #_audio_file = request.form['audio_file']
    return SpeechAnalysis.nutrition_balance_df(df)    
    