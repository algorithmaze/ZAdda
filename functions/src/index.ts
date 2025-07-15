/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {initializeApp} from "firebase-admin/app";
import {getFirestore, FieldValue} from "firebase-admin/firestore";
import {onCall, HttpsError} from "firebase-functions/v2/https";
// import * as logger from "firebase-functions/logger";

initializeApp();
const db = getFirestore();

export const acceptFriendRequest = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "The function must be called while authenticated.",
    );
  }

  const {requestId} = request.data;
  if (!requestId || typeof requestId !== "string") {
    throw new HttpsError(
      "invalid-argument",
      "The function must be called with a string 'requestId' argument.",
    );
  }

  const callingUid = request.auth.uid;

  const requestRef = db.collection("friendRequests").doc(requestId);

  try {
    return await db.runTransaction(async (transaction) => {
      const requestDoc = await transaction.get(requestRef);

      if (!requestDoc.exists) {
        throw new HttpsError("not-found", "Friend request not found.");
      }

      const requestData = requestDoc.data();
      if (!requestData) {
        throw new HttpsError("internal", "Friend request data is empty.");
      }

      const {fromUserId, toUserId, status} = requestData;

      if (toUserId !== callingUid) {
        throw new HttpsError(
          "permission-denied",
          "You can only accept requests sent to you.",
        );
      }

      if (status !== "pending") {
        throw new HttpsError(
          "failed-precondition",
          "This friend request has already been handled.",
        );
      }

      // Update friend request status
      transaction.update(requestRef, {status: "accepted"});

      const timestamp = FieldValue.serverTimestamp();

      // Add friend for the recipient
      const recipientFriendRef = db
        .collection("users")
        .doc(toUserId)
        .collection("friends")
        .doc(fromUserId);
      transaction.set(recipientFriendRef, {friendSince: timestamp});

      // Add friend for the sender
      const senderFriendRef = db
        .collection("users")
        .doc(fromUserId)
        .collection("friends")
        .doc(toUserId);
      transaction.set(senderFriendRef, {friendSince: timestamp});

      return {success: true, message: "Friend request accepted."};
    });
  } catch (error) {
    // logger.error("Transaction failed: ", error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError("internal", "Failed to accept friend request.");
  }
});
