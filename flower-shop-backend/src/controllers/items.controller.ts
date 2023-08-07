/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import express, { Request, Router, Response } from 'express';
import processFile from "../middlewares/upload";
import {format} from "util";
import {Storage} from "@google-cloud/storage";
import db from '@src/db/db';
import ItemsSchema, { Items } from '@src/models/item.model';
import validate from '@src/middlewares/validateRequest';
import multer from 'multer';
import path from 'path';
import { nanoid } from 'nanoid';
import { uploadPath } from '../../config';

const controller: Router = express.Router();

const storage = new Storage({ keyFilename: "google-cloud-key.json" });
const bucket = storage.bucket("flower_shop_1");

controller.get('/', async (req: Request, res: Response) => {
  try {
    const item = await db.query(`
    SELECT
    s.id,
    s.item_name,
    s.price,
    s.item_description,
    s.image_small,
    s.create_date,
    u.username,
	s.id_category
FROM
    items s
    INNER JOIN items_categories c ON s.id_category = c.id
    INNER JOIN users u ON u.id = s.id_user`);

    res.status(200).send(item.rows);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});


controller.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const item = await db.query(`
        SELECT
        s.id,
        s.item_name,
        s.price,
        s.item_description,
        s.id_category,
        s.id_subcategory,
        s.id_under_subcategory,
        s.image_small,
        s.create_date,
        s.id_user,
        u.username
        FROM items s
        INNER JOIN items_categories ic ON ic.id = s.id_category
        INNER JOIN items_subcategories isc ON isc.id = s.id_subcategory
        INNER JOIN items_under_subcategories iusc ON iusc.id = s.id_under_subcategory
        INNER JOIN users u ON u.id = s.id_user
        WHERE s.id = $1`, [id]);

    if (item.rows.length === 0) {
      res.status(404).send({ error: 'Item not found' });
    } else {
      res.status(200).send(item.rows);
    }
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

controller.post('/', async (req: Request, res: Response) => {
  await processFile(req, res);
  const fileOriginalName = req.file?.originalname;
    try {
      const token = req.get('Authorization');
      
      if(!token) res.status(400).send({message: "Token must be present"})
      const user = (await db.query(
        'SELECT * FROM users WHERE token = $1',
        [token],
      )).rows[0]; 
        
      if (user.id_role !== 1 && user.id_role !== 2) return res.status(403).send({ message: 'Access forbidden'});

      const itemData = {...req.body};

      if(!itemData.item_name) return res.status(400).send({message: "Name is required"})
      if(!itemData.id_category) return res.status(400).send({message: "Goods category is required"})
      if(!itemData.id_subcategory) return res.status(400).send({message: "Goods subcategory is required"})

      const {
        item_name,
        item_description,
        id_category,
        id_subcategory,
        id_under_subcategory,
        price,
      } = req.body as Items;

      const create_date = new Date().toISOString();
      const id_user = user.id as number;

      if (!req.file) {
        return res.status(400).send({ message: "Please upload a file!" });
      }
    
      const blob = bucket.file(nanoid() + path.extname(req.file.originalname));
        
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
          const newItem = (await db.query(
            `INSERT INTO items (
            item_name,
            item_description,
            id_category,
            id_subcategory,
            id_under_subcategory,
            image_small,
            create_date,
            id_user,
            price
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8, 0), $9) RETURNING *`,
            [
              item_name,
              item_description,
              id_category,
              id_subcategory,
              id_under_subcategory,
              publicUrl,
              create_date,
              id_user,
              price,
            ],
          )).rows[0];

          res.status(200).send({
            message: 'Item created successfully',
            item: newItem,
          });
        } catch (error) {
          res.status(500).send({ error: error.message });
        }
      });
    
      blobStream.end(req.file.buffer);
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  });

controller.put(
  '/:id',
  validate(ItemsSchema),
  async (req: Request, res: Response) => {
    try {
      const token = req.get('Authorization');
      const user = await db.query('SELECT id FROM users WHERE token = $1', [
        token,
      ]);

      if (user.rows.length === 0) {
        return res.status(401).send({ error: 'Unauthorized' });
      }

      const {
        item_name,
        item_description,
        id_category,
        id_subcategory,
        id_under_subcategory,
        price,
      } = req.body as Items;

      const id = req.params.id;
      let image_small = 'img.jpeg';

      if (req.file) {
        image_small = req.file.path;
      }

      const id_user = user.rows[0].id as number;

      const updatedItem = await db.query(
        `UPDATE items
          SET
            item_name = $1,
            item_description = $2,
            id_category = $3,
            id_subcategory = $4,
            id_under_subcategory = $5,
            image_small = $6,
            id_user = $7,
            price = COALESCE($8, 0)
          WHERE id = $9
          RETURNING *`,
        [
          item_name,
          item_description,
          id_category,
          id_subcategory,
          id_under_subcategory,
          image_small,
          id_user,
          price,
          id,
        ],
      );

      const updatedItemData = updatedItem.rows[0];
      res.status(200).send({
        message: 'Item updated successfully',
        item: updatedItemData,
      });
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  },
);

controller.delete(
  '/:id',
  async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const hasAssociatedActions = await db.query(
        'SELECT EXISTS (SELECT 1 FROM actions WHERE item_id = $1)',
        [id],
      );

      if (hasAssociatedActions.rows[0].exists) {
        return res.status(400).send({
          error: 'Item cannot be deleted as it has associated actions',
        });
      }

      const deletedItem = await db.query(
        'DELETE FROM items WHERE id = $1 RETURNING *',
        [id],
      );

      if (deletedItem.rows.length === 0) {
        return res.status(404).send({ error: 'Item not found' });
      }
      res.status(200).send({
        message: 'Item deleted successfully',
      });
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  },
);



export default controller;