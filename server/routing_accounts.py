from app import app
from flask import render_template, make_response, request, json, jsonify, flash

import functions_accounts

@app.route('/signUp', methods=['POST'])
def signUp():
    return functions_accounts.signUp()

@app.route('/signIn', methods=['POST'])
def signIn():
    return functions_accounts.signIn()

@app.route('/updateUser', methods=['POST'])
def updateUser():
    return functions_accounts.updateUser()

@app.route('/signOut')
def signOut():
    resp = make_response(render_template("index.html"))
    resp.set_cookie('token', '', expires=-1)
    resp.set_cookie('username', '', expires=-1)
    return resp