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

        // --- Ensure isPublic field ---
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

        // --- Add empty tags array if missing ---
        if (!('tags' in bookData)) {
            updateObj.tags = []; // Start with an empty array
            console.log(`➕ Added missing tags[] array to book ${bookId}`);
        } else if (!Array.isArray(bookData.tags)) {
            console.warn(`⚠️ Book ${bookId} has a non-array tags field, skipping tag fix.`);
        } else if (bookData.tags.length > 20) {
            // Trim the tags if somehow there are too many
            updateObj.tags = bookData.tags.slice(0, 20);
            console.log(`Trimmed tags array to 20 items for book ${bookId}`);
        }

        if (Object.keys(updateObj).length > 0) {
            await bookDocRef.update(updateObj);
        }

        // --- Clean Up Chapter Docs (optional cleanup, comment out if not needed) ---
        /*
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
        */
    }

    console.log('✅ Done: Normalized book visibility and ensured tags field.');
}

cleanUpBooksAndChapters().catch(console.error);
