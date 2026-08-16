import firebase_admin
from firebase_admin import credentials, firestore
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

cred_path = r'c:\Users\freit\Downloads\eric-arcade-firebase-adminsdk-fbsvc-cafbfa411a.json'
cred = credentials.Certificate(cred_path)
firebase_admin.initialize_app(cred)

db = firestore.client()

print("--- FETCHING USERS ---")
users_ref = db.collection('users')
docs = users_ref.stream()

for doc in docs:
    data = doc.to_dict()
    print(f"USER ID: {doc.id} -> {data}")
    saves_ref = db.collection('users').document(doc.id).collection('saves')
    saves = saves_ref.stream()
    for s in saves:
        print(f"   SAVE [{s.id}]: {s.to_dict()}")

print("\n--- FETCHING ALL FIRESTORE COLLECTIONS ---")
cols = db.collections()
for c in cols:
    print(f"COLLECTION: {c.id}")
    for d in c.stream():
        print(f"   DOC [{d.id}]: {d.to_dict()}")
