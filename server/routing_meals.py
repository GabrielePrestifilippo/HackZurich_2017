from app import app

import functions_meals

@app.route('/testSpeech', methods=['POST'])
def testSpeech():
    return functions_meals.recommend()