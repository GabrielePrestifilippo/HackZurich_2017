from model import getCurrentUser
from flask import render_template

def userRequired(func):
    def wrapper():
        user = getCurrentUser()
        if user:
            return func()
        return "Not allowed"
    return wrapper

def objectBelongsToUser(object):
    user = getCurrentUser()
    if user:
    	if object.created_by == user.usrId:
            return True
    return False


def groupify(object):
    group = getCurrentGroup()
    if group:
        if(objectBelongsToUser(object)):
            if object.group_id:
                object.group_id = None
            else:
                object.group_id = group.grpId
            return True
    return False



