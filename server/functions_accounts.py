from werkzeug import generate_password_hash, check_password_hash
from flask import render_template, make_response, request, json, jsonify, flash
#https://pythonhosted.org/flask-mail/
#from mailer import sendMail
from app import app_secret, db
from access_control import userRequired

import model # #? do I need to import here if it is already imported in app?

def signUp():
    _email = request.form['inputEmail']
    _username = request.form['inputUsername']
    _password = request.form['inputPassword']
    _hashed_password = generate_password_hash(_password)
    if _email and _username and _password:

        user = model.User.query.filter_by(usrEmail=_email).first()
        if(user):
            return json.dumps({'warning':'A user already exists with the same email!!', 'success':'false', 'warning_type':'danger'})

        user = model.User.query.filter_by(usrUsername=_username).first()
        if(user):
            return json.dumps({'warning':'A user already exists with the same username!!', 'success':'false', 'warning_type':'danger'})

        token = generate_password_hash(_username+_password)
        user = model.User(_email, _username, _hashed_password, token)
        db.session.add(user)
        db.session.commit()

        #TODO find a way to check that the registry is already in the DB
        user = model.User.query.filter_by(usrEmail=_email).first()

        #sendMail('Activate your HTImagr account', _email, 'Some body', '<h1>Some HTML</h1>')

        if(user):
            return json.dumps({'warning':'New User Created Successfully !!','success':'true', 'warning_type':'success'})
        else:
            return json.dumps({'warning':'Something went wrong :(','success':'false', 'warning_type':'danger'})
        
    else:
        return json.dumps({'warning':'Enter the required fields', 'success':'false', 'warning_type':'danger'})

def signIn():

    _email = request.form['inputEmail']
    _password = request.form['inputPassword']

    if _email and _password :
        user = model.User.query.filter_by(usrEmail=_email).first()
        
        if(user):
            if not user.usrActive:
                return json.dumps({'warning':'User not activated!! Please check your email inbox and find an email with an activation link', 'success':'false', 'warning_type':'danger'})

            if check_password_hash(user.usrPassword, _password):
                user.usrPassword = ''
                resp = make_response(json.dumps({'success': 'true', 'user': model.User.serialize(user), "token": user.usrToken}))
                return resp
                # return json.dumps({'warning':'Successful Sign In!!','token':_token, 'success':'true', 'warning_type':'success'})
            else:
                return json.dumps({'warning':'Failed Sign In!! Wrong password', 'success':'false', 'warning_type':'danger'})
        else:
            return json.dumps({'warning':'Failed Sign In!!', 'success':'false', 'warning_type':'danger'})
    else:
        return json.dumps({'warning':'Enter the required fields</span>'})


def updateUser():

    _name = request.form['usrName']
    _lastname = request.form['usrLastname']
    _username = request.form['usrUsername']

    user = model.getCurrentUser()

    user.usrUsername = _username
    user.usrLastname = _lastname
    user.usrName = _name
    db.session.commit()

    sendMail('Your HTImagr profile has been updated', user.usrEmail, 'Some body', '<h1>Some HTML</h1>')

    user.usrPassword = ''
    resp = make_response(json.dumps({'success': 'true', 'user': model.User.serialize(user), 'warning':'The data was updated successfully', 'warning_type':'success'}))
    return resp


def showSettings():

    user = model.getCurrentUser()
    return render_template("account_settings.html", user = user, groups = user.groups)
