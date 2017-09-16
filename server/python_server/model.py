import types

from app import db, app_secret
from flask import request
from werkzeug import check_password_hash
from sqlalchemy.ext.declarative import declared_attr

from datetime import datetime

#Read this on how to serialize
# http://stackoverflow.com/questions/7102754/jsonify-a-sqlalchemy-result-set-in-flask

def getCurrentUser():
    if not 'token' in request.form:
        return None
    token = request.form['token']
    user = User.query.filter_by(usrToken=token).first()
    if not user:
        return None
    return user

#Serializer and extra capabilities for models
class Serializer(object):
    created_at = db.Column(db.DateTime)
    #created_by = db.Column(db.Integer);#, db.ForeignKey('user.usrId'))
    #group_id = db.Column(db.Integer)
    modified_at = db.Column(db.DateTime)
    modified_by = db.Column(db.Integer)
    deleted = db.Column(db.Boolean)

    @declared_attr
    def created_by(cls):
        return db.Column(db.Integer, db.ForeignKey('user.usrId'), nullable=True)

    def basic(self):
        self.created_at = datetime.now()
        user = getCurrentUser()
        if user:
            self.created_by = getCurrentUser().usrId

    def logChanges(self):
        user = getCurrentUser()
        if user:
            self.modified_by = getCurrentUser().usrId
        self.modified_at = datetime.now()

    def softDelete(self):
        self.deleted = True
        self.logChanges()

    def serialize(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

    @staticmethod
    def serialize_list(l):
        return [m.serialize() for m in l]

    @staticmethod
    def serialize_join(l):
        alist = []
        for i in l:
            adict = {}
            for j in i:
                adict.update(j.serialize())
            alist.append(adict)
        return alist

    def reverseSerialize(self, form):
        for key in form:
            if hasattr(self, key):
                if form[key] == '0' or len(form[key]) == 0:
                    setattr(self, key, None)
                else:
                    setattr(self, key, form[key])


def str_to_class(s):
    if s in globals():
        return globals()[s]
    return None

def getObject(type, pk_name, pk):
    cls = str_to_class(type)
    if cls:
        print "Class exists"
        obj = cls.query.filter(getattr(cls, pk_name) == pk).first()
        return obj
    return None



class User(db.Model, Serializer):
    usrId = db.Column(db.Integer, primary_key=True)
    usrUsername = db.Column(db.String(80), unique=True)
    usrEmail = db.Column(db.String(80), unique=True)
    usrToken = db.Column(db.String(80), unique=True)
    usrName = db.Column(db.String(120), unique=False)
    usrLastname = db.Column(db.String(120), unique=False)
    usrPassword = db.Column(db.String(120), unique=False)
    usrActive = db.Column(db.Boolean, unique=False, default=1)

    meals = db.relationship('Meal', backref=db.backref('user'), lazy='dynamic')

    def __init__(self, email, username, password, token):
        print "a"
        self.basic()
        print "b"
        self.usrUsername = username
        print "c"
        self.usrEmail = email
        print "d"
        self.usrPassword = password
        print "e"
        self.usrToken = token

    def __repr__(self):
        return '<User %r>' % self.usrUsername


class Meal(db.Model, Serializer):
    meaId = db.Column(db.Integer, primary_key=True)
    meaName = db.Column(db.String(300), primary_key=False)
    meaTotalCalories = db.Column(db.Integer, primary_key=False)
    meaCarbsPercent = db.Column(db.Integer, primary_key=False)
    meaFatPercent = db.Column(db.Integer, primary_key=False)
    meaProtsPercent = db.Column(db.Integer, primary_key=False)


    def __init__(self, type):
        self.basic()
        self.locType = type

    def __repr__(self):
        return '<Localition %r>' % self.locType


db.create_all()