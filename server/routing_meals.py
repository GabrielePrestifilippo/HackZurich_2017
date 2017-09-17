from app import app

import functions_meals

@app.route('/parseAudio', methods=['GET'])
def parseAudio():
    return functions_meals.parseAudio()

@app.route('/recommend', methods=['GET'])
def recommend():
    return functions_meals.recommend()