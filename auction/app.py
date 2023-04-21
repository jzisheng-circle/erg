'''
pip3 install firebase_admin
pip3 install flask
pip3 install flask-cors
'''

import firebase_admin
import json
import random
import string
from firebase_admin import credentials, db
from flask import Flask, request
from flask_cors import CORS

cred = credentials.Certificate("../../serviceAccountKey.json")
firebase_admin.initialize_app(cred, {
    "databaseURL": "https://auction-erg-jchang-default-rtdb.firebaseio.com"
})


DB_REF = "/bids/Bid/"

''' helper methods '''

def id_generator(size=6, chars=string.ascii_uppercase + string.digits):
    return ''.join(random.choice(chars) for _ in range(size))

def setup():
    ref = db.reference(DB_REF)

    with open("bids.json", "r") as f:
        file_contents = json.load(f)

    for key, value in file_contents.items():
        ref.push().set(value)
        # print(key,value)


def getHighBidDb():
    ref = db.reference(DB_REF)
    return ref.order_by_child("Price").limit_to_last(1).get().popitem()[1]

def getAllBidsDb():
    ref = db.reference(DB_REF)
    d = ref.order_by_child("Price").get()
    
    result = []
    for key, value in d.items():
        result.append(value)
    return result[::-1]

def insertBidDb(price, name):
    ref = db.reference(DB_REF)
    highestBid = float(getHighestBid()['Price'])
    highestBidName = getHighestBid()['Name']
    if price > 0 and price > highestBid and name != highestBidName:
        ref.push({'Name':name,'Price':price})
    else:
        raise Exception('Did not push bid')
        

# setup()
# getHighestBid()
# bid(id_generator(), 133.1)

'''
actual flask app
'''

app = Flask(__name__)
CORS(app)

@app.route('/getBids')
def getBids():
    return getAllBidsDb()

@app.route('/getHighestBid')
def getHighestBid():
    return getHighBidDb()

@app.route('/bid', methods=['POST'])
def bid():
    try: 
        price = float(request.json['bid'])
        name = request.json['name']
        insertBidDb(price, name)
        return {"status":200}
    except:
        return {"status":400} 
