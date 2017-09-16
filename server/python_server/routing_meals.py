from app import app

import functions_meals

@app.route('/testSpeech', methods=['GET'])
def testSpeech():
    return functions_meals.testMeals()