const express = require("express");
const Joi = require("joi");
const admin = require("firebase-admin");
const logger = require("../logger");

const db = admin.firestore();
const router = express.Router();

// Validate input
const schema = Joi.object({
  name: Joi.string()
    .pattern(/^[a-zA-Z0-9 !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/)
    .max(40)
    .required(),
  description: Joi.string()
    .pattern(/^[a-zA-Z0-9 !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/)
    .max(100)
    .required(),
});

router.get("/", async (req, res) => {
  try {
    const collectionRef = db.collection("collections");
    const snapshot = await collectionRef.get();

    const collections = [];
    snapshot.forEach((doc) => {
      collections.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).send(collections);
    logger.info("Collections fetched successfully", {
      action: "COLLECTION_RETRIEVED",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching collections" });
    logger.error("Error fetching collections", {
      action: "COLLECTION_RETRIEVAL_ERROR",
    });
  }
});

router.post("/add", async (req, res) => {
  try {
    const { value, error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const collectionRef = db.collection("collections");
    const result = await db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(
        collectionRef.orderBy("id", "desc").limit(1)
      );
      let nextId = 1;

      if (!snapshot.empty) {
        nextId = snapshot.docs[0].data().id + 1;
      }

      // New document reference with auto-incremented ID
      const newCollectionRef = collectionRef.doc(`${nextId}`);
      const newCollectionData = { id: nextId, ...value, wishlist: [] };

      transaction.set(newCollectionRef, newCollectionData);

      return newCollectionData;
    });

    res.status(200).json({ message: "Collection added", data: result });
    logger.info(`Collection with ID ${result.id} is added`, {
      action: "COLLECTION_ADDED",
      collectionId: result.id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error adding collection" });
    logger.error("Error adding collection", {
      action: "COLLECTION_ADDITION_ERROR",
    });
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
    logger.info(`Collection with ID ${id} is updated`, {
      action: "COLLECTION_UPDATED",
      collectionId: id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error updating collection" });
    logger.error("Error updating collection", {
      action: "COLLECTION_UPDATE_ERROR",
    });
  }
});

router.delete("/delete", async (req, res) => {
  try {
    const id = req.query.id;

    if (!id) {
      return res.status(400).json({ error: "Missing ID parameter" });
    }

    const collectionRef = db.collection("collections");
    const docRef = collectionRef.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Collection not found" });
    }

    await docRef.delete();
    res
      .status(200)
      .json({ message: "Collection deleted successfully", id: id });
    logger.info(`Collection with ID ${id} is deleted`, {
      action: "COLLECTION_DELETED",
      collectionId: id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error deleting collection" });
    logger.error("Error deleting collection", {
      action: "COLLECTION_DELETION_ERROR",
    });
  }
});

module.exports = router;
