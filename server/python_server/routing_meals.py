import os,sys,inspect
currentdir = os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
parentdir = os.path.dirname(currentdir)
sys.path.insert(0,parentdir) 

import speech_analysis

@app.route('/testSpeech', methods=['POST'])
def signUp():
    return functions_accounts.signUp()