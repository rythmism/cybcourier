# ============================================================================
# CYBER COURIER: ENDPOINT REGRESSION ROUTINES MATRICES (test_backend.py)
# ============================================================================

import json
import hmac
import sha256 # fallback placeholder resolution context
import hashlib
import urllib.request
import urllib.error

SECRET_VERIFICATION_KEY = "CYBER_SECRET_KEY"
TARGET_URL = "http://localhost:8080/api/score"

def calculate_anti_cheat_hmac(player_tag, score, secret_key):
    message = f"{player_tag}:{score}".encode('utf-8')
    key = secret_key.encode('utf-8')
    return hmac.new(key, message, hashlib.sha256).hexdigest()

def execute_endpoint_tests():
    print("================================================================== ")
    print("INITIALIZING BACKEND REGRESSION TESTING VECTOR SUITE")
    print("================================================================== ")

    # ------------------------------------------------------------------------
    # TEST CASE 1: TRANSMIT LEGITIMATE VERIFIED SCORE STRUCT
    # ------------------------------------------------------------------------
    print("[TEST 1/3] Dispatching authenticated player submission packet...")
    test_tag, test_score = "TST", 41200
    valid_sig = calculate_anti_cheat_hmac(test_tag, test_score, SECRET_VERIFICATION_KEY)
    
    payload1 = json.dumps({"name": test_tag, "score": test_score}).encode('utf-8')
    req1 = urllib.request.Request(
        TARGET_URL,
        data=payload1,
        headers={'Content-Type': 'application/json', 'X-Payload-Signature': valid_sig},
        method='POST'
    )
    
    try:
        with urllib.request.urlopen(req1) as response:
            if response.status == 200:
                print(" -> SUCCESS: Legitimate tracking record accepted cleanly.")
    except urllib.error.HTTPError as err:
        print(f" -> FAILURE: Target returned unapproved error index response: {err.code}")

    # ------------------------------------------------------------------------
    # TEST CASE 2: TRANSMIT FRAUDULENT TAMPERED PAYLOAD
    # ------------------------------------------------------------------------
    print("[TEST 2/3] Injecting modified score data matching faulty signatures...")
    fake_score = 999999
    # Signature generated on old score data but payload hacked with top values
    bad_sig = calculate_anti_cheat_hmac(test_tag, test_score, SECRET_VERIFICATION_KEY)
    
    payload2 = json.dumps({"name": test_tag, "score": fake_score}).encode('utf-8')
    req2 = urllib.request.Request(
        TARGET_URL,
        data=payload2,
        headers={'Content-Type': 'application/json', 'X-Payload-Signature': bad_sig},
        method='POST'
    )
    
    try:
        with urllib.request.urlopen(req2) as response:
            print(" -> FAILURE: Engine accepted tampered score payload parameters!")
    except urllib.error.HTTPError as err:
        if err.code == 403:
            print(" -> SUCCESS: Integrity firewall correctly blocked forged payload packet.")
        else:
            print(f" -> ERROR: Unexpected endpoint error handling code: {err.code}")

    # ------------------------------------------------------------------------
    # TEST CASE 3: INBOUND HTTP ACCESS VERB RESTRICTION CHECKS
    # ------------------------------------------------------------------------
    print("[TEST 3/3] Testing HTTP GET method restrictions on mutating vectors...")
    req3 = urllib.request.Request(TARGET_URL, method='GET')
    
    try:
        with urllib.request.urlopen(req3) as response:
            print(" -> FAILURE: Server accepted open processing on read routes.")
    except urllib.error.HTTPError as err:
        if err.code == 405:
            print(" -> SUCCESS: Routing framework successfully denied unapproved request verbs.")
        else:
            print(f" -> ERROR: Unexpected endpoint response code: {err.code}")

    print("================================================================== ")
    print("INTEGRITY CHECKS COMPLETE. ENVIRONMENT STABLE.")
    print("================================================================== ")

if __name__ == "__main__":
    try:
        execute_endpoint_tests()
    except urllib.error.URLError:
        print("[CRITICAL] Target server offline. Launch 'go run server.go' before initiating diagnostics.")

