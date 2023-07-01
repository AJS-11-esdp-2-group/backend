import express, { Request, Router, Response } from "express";
import db from "@src/db/db";
import validate from "@src/middlewares/validateRequest";
import multer from 'multer';
import path from 'path';
import {nanoid} from 'nanoid';
import {uploadPath} from '../../config';
import BouquetsImagesSchema from "@src/models/bouquetsImages.models";
import fs from "fs";

const controller: Router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cd) => {
        cd(null, uploadPath);
    },
    filename(req, file, cd) {
        cd(null, nanoid() + path.extname(file.originalname));
    },
});

const upload = multer({storage});

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

controller.post("/", upload.single('image'), validate(BouquetsImagesSchema), async(req: Request, res: Response) => {
    const imageData = {...req.body};
    
    try {
        const bouquetImage = await db.query(`
            INSERT INTO bouquets_images (id_bouquet, image) 
            VALUES ($1, $2)
            RETURNING *
        `, [parseInt(imageData.id_bouquet), req.file?.filename]);

        res.status(201).send(bouquetImage.rows);
    } catch (error) {
       res.status(500).send({error:error.message}); 
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