from flask import Flask, jsonify
import requests
import time

app = Flask(__name__)


WINDOW_SIZE = 10
TEST_SERVER_URL = "http://test-server.com/numbers/{}"
TIMEOUT = 0.5 


window = []

@app.route('/numbers/<numberid>', methods=['GET'])
def get_numbers(numberid):
    global window
    
    
    numbers = fetch_numbers(numberid)
    
    
    for num in numbers:
        if num not in window:
            if len(window) == WINDOW_SIZE:
                window.pop(0)
            window.append(num)
    
    
    avg = sum(window) / len(window) if window else 0.0
    
    
    response = {
        "numbers": numbers,
        "windowPrevState": window[:-len(numbers)],
        "windowCurrState": window,
        "avg": avg
    }
    
    return jsonify(response)

def fetch_numbers(numberid):
    url = TEST_SERVER_URL.format(numberid)
    try:
        response = requests.get(url, timeout=TIMEOUT)
        response.raise_for_status()
        return response.json()
    except (requests.exceptions.RequestException, ValueError):
        return []

if __name__ == '__main__':
    app.run(host='localhost', port=9876, debug=False)