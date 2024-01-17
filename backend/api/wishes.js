const express = require("express");
const Joi = require("joi");
const admin = require("firebase-admin");

const db = admin.firestore();
const router = express.Router();

// Validate input
const schema = Joi.object({
  name: Joi.string().max(40).required(),
  price: Joi.number().max(255).positive().required(),
  platform: Joi.string().required(),
  link: Joi.string().uri().required(),
  status: Joi.string().valid("target", "completed").required(),
});

router.get("/", async (req, res) => {
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

    const collectionData = { ...doc.data() };
    res.status(200).send(collectionData);
    console.log(`Collection with ID ${id} is fetched`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching collection" });
  }
});

router.post("/add", async (req, res) => {
  try {
    const { name, price, platform, link, status } = req.body;
    const collectionId = req.query.id;

    if (!collectionId) {
      return res.status(400).json({ error: "Missing collection ID parameter" });
    }

    // Mendapatkan koleksi berdasarkan ID
    const collectionRef = db.collection("collections").doc(collectionId);
    const collectionDoc = await collectionRef.get();

    if (!collectionDoc.exists) {
      return res.status(404).json({ error: "Collection not found" });
    }

    const wishes = collectionDoc.data().wishes || [];
    const newWish = {
      id: wishes.length + 1, // Atau gunakan auto-increment ID jika tersedia
      name,
      price,
      date: new Date(),
      platform,
      link,
      status,
    };

    wishes.push(newWish);

    // Menyimpan kembali koleksi dengan data wishes yang diperbarui
    await collectionRef.update({ wishes });

    res
      .status(200)
      .json({ message: "Wish added to collection", data: newWish });
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
    console.log(`Collection with ID ${id} is deleted`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error deleting collection" });
  }
});

module.exports = router;
