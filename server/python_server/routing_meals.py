from app import app
import os,sys,inspect
currentdir = os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
parentdir = os.path.dirname(currentdir)
sys.path.insert(0,parentdir) 

from speech_analysis import SpeechAnalysis

@app.route('/testSpeech', methods=['GET'])
def testSpeech():
    return SpeechAnalysis.parse_foods('../data/chicken_dinner.mp3')