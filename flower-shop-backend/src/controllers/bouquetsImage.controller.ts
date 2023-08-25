import express, { Request, Router, Response } from "express";
import processFile from "../middlewares/upload";
import { format } from "util";
import { Storage } from "@google-cloud/storage";
import db from "@src/db/db";
import { uploadPath } from '../../config';
import fs from "fs";
import { nanoid } from 'nanoid';
import path from 'path';
import { BouquetsImage } from "@src/models/bouquetsImages.models";

const controller: Router = express.Router();

const storage = new Storage({ keyFilename: "google-cloud-key.json" });
const bucket = storage.bucket("flower_shop_1");

controller.get('/', async (req: Request, res: Response) => {
  try {
    const images = await db.query(`
        SELECT * FROM bouquets_images
      `);

    res.status(200).send(images.rows);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

controller.post("/", processFile, async (req: Request, res: Response) => {
  const imageData = { ...req.body } as BouquetsImage;
  try {
    if (!imageData.id_bouquet) return res.status(400).send({ message: 'Id of bouquet is required' });
    let publicUrl = '';
    const insertIntoDatabase = async () => {
      try {
        const bouquetImage = await db.query(`
                INSERT INTO bouquets_images (id_bouquet, image) 
                VALUES ($1, $2)
                RETURNING *
            `, [imageData.id_bouquet, publicUrl]);

        res.sendStatus(200)
      } catch (error) {
        res.status(500).send({ error: error.message });
      }
    }

    if (req.file) {
      const blob = bucket.file(nanoid() + path.extname(req.file.originalname));

      const blobStream = blob.createWriteStream({
        resumable: false,
      });

      blobStream.on("error", (err) => {
        res.status(500).send({ message: err.message });
      });

      blobStream.on("finish", () => {
        publicUrl = format(
          `https://storage.googleapis.com/${bucket.name}/${blob.name}`
        );
        insertIntoDatabase();
      });

      blobStream.end(req.file.buffer);
    } else {
      insertIntoDatabase();
    }

  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

controller.get('/:id', async (req: Request, res: Response) => {
  try {
    const images = await db.query(`
            SELECT * FROM bouquets_images b
            WHERE b.id_bouquet = $1
        `, [req.params.id]);

    res.status(200).send(images.rows);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

controller.delete('/:id', async (req: Request, res: Response) => {
  try {
    const image = await db.query(`
            SELECT * FROM bouquets_images b
            WHERE b.id = $1
        `, [req.params.id]);

    if (image.rows.length === 0) return res.status(401).send({ error: 'Image not found' });

    await db.query(`
            DELETE FROM bouquets_images b
            WHERE b.id = $1
        `, [req.params.id]);

    fs.unlink((uploadPath + '/' + image.rows[0].image), (err) => {
      if (err) throw err;
    });
    res.status(200).send({ success: 'Image delete success!' });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

export default controller;