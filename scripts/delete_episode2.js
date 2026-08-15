const admin = require('firebase-admin');

const sa = require('./serviceAccount.json');
admin.initializeApp({
    credential:    admin.credential.cert(sa),
    storageBucket: 'eric-arcade.firebasestorage.app',
});

const db = admin.firestore();

async function cleanup() {
    console.log('🧹 Cleaning up episodes > 1 from Firestore...');

    const path1Ref = db.collection('dino-island').doc('episodes').collection('all');
    const path2Ref = db.collection('dino-island').doc('story').collection('episodes');

    const snap1 = await path1Ref.where('episodeNumber', '>', 1).get();
    const snap2 = await path2Ref.where('episodeNumber', '>', 1).get();

    // Also check for doc id episode-002 specifically
    const doc2_1 = await path1Ref.doc('episode-002').get();
    const doc2_2 = await path2Ref.doc('episode-002').get();

    const batch = db.batch();
    if (!snap1.empty) snap1.docs.forEach(doc => { console.log(`🗑️ Deleting path1 doc: ${doc.id}`); batch.delete(doc.ref); });
    if (!snap2.empty) snap2.docs.forEach(doc => { console.log(`🗑️ Deleting path2 doc: ${doc.id}`); batch.delete(doc.ref); });
    if (doc2_1.exists) { console.log(`🗑️ Deleting path1 episode-002`); batch.delete(doc2_1.ref); }
    if (doc2_2.exists) { console.log(`🗑️ Deleting path2 episode-002`); batch.delete(doc2_2.ref); }

    await batch.commit();

    // Reset story metadata back to Episode 1
    await db.collection('dino-island').doc('story').set({
        totalEpisodes:       1,
        latestEpisodeNumber: 1,
        latestEpisodeTitle:  'The Breaking of Lab 7',
        lastGeneratedAt:     admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    await db.collection('dino-island').doc('episodes').set({
        totalEpisodes:       1,
        latestEpisodeNumber: 1,
        latestEpisodeTitle:  'The Breaking of Lab 7',
    }, { merge: true });

    console.log('✅ Cleaned up! Story metadata reset to Episode 1.');
    process.exit(0);
}

cleanup().catch(err => {
    console.error('❌ Cleanup failed:', err);
    process.exit(1);
});
