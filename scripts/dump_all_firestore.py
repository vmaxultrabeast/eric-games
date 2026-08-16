import firebase_admin
from firebase_admin import credentials, firestore
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

cred_path = r'c:\Users\freit\Downloads\eric-arcade-firebase-adminsdk-fbsvc-cafbfa411a.json'
cred = credentials.Certificate(cred_path)
firebase_admin.initialize_app(cred)

db = firestore.client()

print("=== ALL FIRESTORE COLLECTIONS ===")
for col in db.collections():
    print(f"\nCollection: {col.id}")
    for doc in col.stream():
        d_dict = doc.to_dict()
        # strip raw image binaries if any
        printable = {}
        for k, v in d_dict.items():
            if isinstance(v, str) and len(v) > 200:
                printable[k] = v[:60] + "..."
            else:
                printable[k] = v
        print(f"  Doc [{doc.id}]: {printable}")
        
        # Subcollections
        for subcol in doc.reference.collections():
            print(f"    Subcollection: {subcol.id}")
            for subdoc in subcol.stream():
                print(f"      Subdoc [{subdoc.id}]: {subdoc.to_dict()}")
