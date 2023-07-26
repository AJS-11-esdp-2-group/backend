import express, { Request, Router, Response } from "express";
import processFile from "../middlewares/upload";
import {format} from "util";
import {Storage} from "@google-cloud/storage";
import db from "../db/db";
import {uploadPath} from '../../config';
import fs from "fs";

const controller: Router = express.Router();

const storage = new Storage({
  projectId: "rugged-night-391816",
  credentials: require('../../google-cloud-key.json')
});
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

controller.post("/", async(req: Request, res: Response) => {
    await processFile(req, res);
    const fileOriginalName = req.file?.originalname;

    try {
        const imageData = {...req.body};
        if(!imageData.id_bouquet) return res.status(400).send({message: 'Id of bouquet is required'});

        if (!req.file) {
          return res.status(400).send({ message: "Please upload a file!" });
        }
    
        const blob = bucket.file(req.file.originalname);
        const blobStream = blob.createWriteStream({
          resumable: false,
        });
        
        const fileOriginalname = req.file.originalname;

        blobStream.on("error", (err) => {
          res.status(500).send({ message: err.message });
        });
    
        blobStream.on("finish", async () => {
          const publicUrl = format(
            `https://storage.googleapis.com/${bucket.name}/${blob.name}`
          );
          
          try {
            const bouquetImage = await db.query(`
                INSERT INTO bouquets_images (id_bouquet, image) 
                VALUES ($1, $2)
                RETURNING *
            `, [parseInt(imageData.id_bouquet), publicUrl]);
            } catch (error) {
            res.status(500).send({error:error.message}); 
            }
    
          res.status(200).send({
            message: "Uploaded the file successfully: " + fileOriginalname,
            url: publicUrl,
          });
        });
    
        blobStream.end(req.file.buffer);
    } catch (err) {
        res.status(500).send({
          message: `Could not upload the file: ${fileOriginalName}. ${err}`,
        });
    }
});

controller.get('/:id', async(req: Request, res: Response) => {
    try {
        const images = await db.query(`
            SELECT * FROM bouquets_images b
            WHERE b.id_bouquet = $1
        `, [req.params.id]);

        res.status(200).send(images.rows);
    } catch (error) {
        res.status(500).send({error: error.message});
    }
});

controller.delete('/:id', async(req:Request, res: Response) => {
    try {
        const image = await db.query(`
            SELECT * FROM bouquets_images b
            WHERE b.id = $1
        `, [req.params.id]);

        if(image.rows.length === 0) return res.status(401).send({error: 'Image not found'});

        await db.query(`
            DELETE FROM bouquets_images b
            WHERE b.id = $1
        `, [req.params.id]);

        fs.unlink((uploadPath +'/' + image.rows[0].image), (err) => {
            if(err) throw err;
        });
        res.status(200).send({success: 'Image delete success!'});
    } catch (error) {
        res.status(500).send({error: error.message});
    }
});

export default controller;