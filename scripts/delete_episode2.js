const admin = require('firebase-admin');

const sa = require('./serviceAccount.json');
admin.initializeApp({
    credential:    admin.credential.cert(sa),
    storageBucket: 'eric-arcade.firebasestorage.app',
});

const db = admin.firestore();

async function cleanup() {
    console.log('🧹 Cleaning up Episode 2 from Firestore...');

    const storyRef    = db.collection('dino-island').doc('story');
    const episodesRef = storyRef.collection('episodes');

    // Fetch all episodes > 1
    const snapshot = await episodesRef.where('episodeNumber', '>', 1).get();

    if (snapshot.empty) {
        console.log('ℹ️ No episodes after Episode 1 found.');
    } else {
        const batch = db.batch();
        snapshot.docs.forEach(doc => {
            console.log(`🗑️ Deleting doc: ${doc.id}`);
            batch.delete(doc.ref);
        });
        await batch.commit();
    }

    // Reset story metadata back to Episode 1
    await storyRef.set({
        totalEpisodes:       1,
        latestEpisodeNumber: 1,
        latestEpisodeTitle:  'The Breaking of Lab 7',
        lastGeneratedAt:     admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    console.log('✅ Cleaned up! Story metadata reset to Episode 1.');
    process.exit(0);
}

cleanup().catch(err => {
    console.error('❌ Cleanup failed:', err);
    process.exit(1);
});
