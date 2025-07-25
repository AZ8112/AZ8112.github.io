const admin = require('firebase-admin');
const serviceAccount = require('./../../serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function cleanUpBooksAndChapters() {
    const booksCollection = db.collection('books');
    const bookDocs = await booksCollection.listDocuments();

    for (const bookDocRef of bookDocs) {
        const bookId = bookDocRef.id;

        // --- Handle Book Doc ---
        const bookSnapshot = await bookDocRef.get();
        if (!bookSnapshot.exists) {
            console.warn(`⚠️ Skipping ${bookId}: book document does not exist`);
            continue;
        }

        const bookData = bookSnapshot.data();
        let updateObj = {};

        if ('published' in bookData) {
            updateObj.isPublic = bookData.published;
            updateObj.published = admin.firestore.FieldValue.delete();
            console.log(`🔁 Converted published → isPublic on book ${bookId}`);
        } else if (!('isPublic' in bookData)) {
            updateObj.isPublic = false;
            console.log(`➕ Added missing isPublic to book ${bookId}`);
        } else {
            console.log(`✅ Book ${bookId} already has isPublic`);
        }

        if (Object.keys(updateObj).length > 0) {
            await bookDocRef.update(updateObj);
        }

        // --- Clean Up Chapter Docs ---
        const chaptersCol = bookDocRef.collection('chapters');
        const chapterDocs = await chaptersCol.get();

        for (const chapterDoc of chapterDocs.docs) {
            try {
                await chapterDoc.ref.update({
                    isPublic: admin.firestore.FieldValue.delete()
                });
                console.log(`🧹 Removed isPublic from chapter ${chapterDoc.id} under book ${bookId}`);
            } catch (err) {
                console.warn(`⚠️ Could not update chapter ${chapterDoc.id}: ${err.message}`);
            }
        }
    }

    console.log('✅ Done: Normalized book visibility and scrubbed chapters.');
}

cleanUpBooksAndChapters().catch(console.error);
