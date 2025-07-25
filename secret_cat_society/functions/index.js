/* eslint-disable max-len */
const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.publishBook = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Log in, chaos monkey.");
  }

  const bookId = data.bookId;
  const userId = context.auth.uid;

  const bookRef = admin.firestore().collection("books").doc(bookId);
  const bookSnap = await bookRef.get();

  if (!bookSnap.exists || bookSnap.data().ownerId !== userId) {
    throw new functions.https.HttpsError("permission-denied", "This ain't your book.");
  }

  await bookRef.update({isPublic: true});

  return {success: true};
});
