const express = require("express");
const Joi = require("joi");
const admin = require("firebase-admin");
const logger = require("../logger");

const db = admin.firestore();
const router = express.Router();

// Validate input
const schema = Joi.object({
  name: Joi.string().max(40).required(),
  price: Joi.number().max(255).positive().required(),
  platform: Joi.string().required(),
  link: Joi.string().uri().required(),
  status: Joi.string().valid("on going", "completed").required(),
});

// Format Time & Datetime
const formatTime = (timestamp) => {
  let postDate;

  if (timestamp instanceof admin.firestore.Timestamp) {
    postDate = timestamp.toDate();
  } else if (timestamp instanceof Date) {
    postDate = timestamp;
  } else if (typeof timestamp === "string") {
    postDate = new Date(timestamp);
  } else {
    console.error("Format timestamp tidak valid.");
    return "";
  }

  const now = new Date();
  const diffMs = now - postDate;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  return `${diffMinutes}`;
};

const formatDatetime = (firestoreTimestamp) => {
  let date;

  if (firestoreTimestamp instanceof admin.firestore.Timestamp) {
    date = firestoreTimestamp.toDate();
  } else if (firestoreTimestamp instanceof Date) {
    date = firestoreTimestamp;
  } else if (typeof firestoreTimestamp === "string") {
    date = new Date(firestoreTimestamp);
  } else {
    console.error("Format timestamp tidak valid.");
    return "";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  }).format(new Date(date));
};

router.get("/", async (req, res) => {
  try {
    const collectionId = req.query.collection;

    if (!collectionId) {
      return res.status(400).json({ error: "Missing collection ID parameter" });
    }

    const collectionRef = db.collection("collections").doc(collectionId);
    const collectionDoc = await collectionRef.get();

    if (!collectionDoc.exists) {
      return res.status(404).json({ error: "Collection not found" });
    }

    const collectionData = collectionDoc.data() || {};
    const wishlistIds = collectionData.wishlist || [];
    const wishlistIdArray = wishlistIds.map((wishlist) => wishlist.id);

    // Fetch wishlist data from collection wishlist based on wishlistIds
    const wishlistPromises = wishlistIdArray.map(async (wishlistId) => {
      const wishlistDocRef = db
        .collection("wishlist")
        .doc(wishlistId.toString());
      const wishlistDoc = await wishlistDocRef.get();
      if (wishlistDoc.exists) {
        return wishlistDoc.data();
      }
      return null;
    });

    const wishlistData = await Promise.all(wishlistPromises);

    res.status(200).json({ wishlist: wishlistData });
    logger.info(`Wishlist from collection with ID ${collectionId} is fetched`, {
      action: "WISHLIST_FETCHED",
      collectionId: collectionId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching wishlist" });
    logger.error("Error fetching wishlist from collections", {
      action: "WISHLIST_RETRIEVAL_ERROR",
    });
  }
});

router.post("/add", async (req, res) => {
  try {
    const { name, price, platform, link, status } = req.body;
    const collectionId = req.query.collection;

    if (!collectionId) {
      return res.status(400).json({ error: "Missing collection ID parameter" });
    }

    const wishlistDocs = await db
      .collection("wishlist")
      .orderBy("id", "desc")
      .get();

    let newWishId = 1;
    if (!wishlistDocs.empty) {
      const latestWish = wishlistDocs.docs[0].data();
      const latestWishId = latestWish ? latestWish.id : 0;
      newWishId = latestWishId + 1;
    }

    const collectionRef = db.collection("collections").doc(collectionId);
    const collectionDoc = await collectionRef.get();

    if (!collectionDoc.exists) {
      return res.status(404).json({ error: "Collection not found" });
    }

    const collectionData = collectionDoc.data() || {};
    const wishes = collectionData.wishlist || [];
    const date = new Date();
    const newWish = {
      id: newWishId,
      name,
      price,
      date: date,
      platform,
      link,
      status,
    };

    const updatedWishes = { id: newWishId, date: date };
    wishes.push(updatedWishes);
    collectionData.wishlist = wishes;

    await collectionRef.update(collectionData);
    await db.collection("wishlist").doc(newWishId.toString()).set(newWish);

    res
      .status(200)
      .json({ message: "Wish added to collection", data: newWish });
    logger.info(`Wish with ID ${newWishId} is added`, {
      action: "WISH_ADDED",
      wishId: newWishId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error adding wish to collection" });
  }
});

router.patch("/edit", async (req, res) => {
  try {
    const id = req.query.id;
    const { value, error } = schema.validate(req.body);

    if (!id) {
      return res.status(400).send("Missing ID parameter");
    }

    if (error) {
      return res.status(400).send(error.details[0].message);
    }

    const collectionRef = db.collection("collections");
    const docRef = collectionRef.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).send("Collection not found");
    }

    await docRef.update(value);
    const result = {
      id: id,
      ...value,
    };

    res.status(200).json({
      message: `Collection updated successfully`,
      data: result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error updating collection" });
  }
});

router.delete("/delete", async (req, res) => {
  try {
    const collectionId = req.query.collection;
    const wishId = req.query.wish;

    if (!collectionId || !wishId) {
      return res
        .status(400)
        .json({ error: "Missing collection ID or wish ID parameter" });
    }

    const collectionRef = db.collection("collections").doc(collectionId);
    const collectionDoc = await collectionRef.get();

    if (!collectionDoc.exists) {
      return res.status(404).json({ error: "Collection not found" });
    }

    const collectionData = collectionDoc.data() || {};
    const wishes = collectionData.wishlist || [];

    // Cek apakah ID wish ada dalam array wishlist
    const wishIndex = wishes.findIndex((wish) => wish.id === parseInt(wishId));

    if (wishIndex === -1) {
      return res
        .status(400)
        .json({ error: "Wish not found in the collection" });
    }

    // Hapus wish dari array wishlist
    wishes.splice(wishIndex, 1);
    collectionData.wishlist = wishes;

    await collectionRef.update(collectionData);
    await db.collection("wishlist").doc(wishId).delete();

    res.status(200).json({ message: "Wish deleted", wishId: parseInt(wishId) });
    logger.info(`Wish with ID ${wishId} is deleted`, {
      action: "WISH_DELETED",
      wishId: parseInt(wishId),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error deleting wish" });
  }
});

module.exports = router;
