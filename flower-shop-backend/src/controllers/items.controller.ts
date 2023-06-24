import express, { Request, Router, Response } from "express";
import db from "@src/db/db";
import ItemsSchema, { Items } from "@src/models/item.model";
import validate from "@src/middlewares/validateRequest";
import multer from 'multer';
import path from 'path';
import {nanoid} from 'nanoid';
import {uploadPath} from '../../config';

const controller: Router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cd) => {
        cd(null, uploadPath);
    },
    filename(req, file, cd) {
        cd(null, nanoid(5) + path.extname(file.originalname));
    },
});

const upload = multer({storage});

controller.get("/", async (req: Request, res: Response) => {
  try {
    const item = await db.query(`
        select
        s.id,
        s.item_name,
        s.item_description,
        ic.category_name,
        isc.subcategory_name,
        s.image_small,
        s.image_large,
        s.create_date,
        u.username
        from items s
        inner join items_categories ic on ic.id = s.id_category
        inner join items_subcategories isc ON isc.id = s.id_subcategory
        inner join users u on u.id = s.id_user`);

    res.status(200).send(item.rows);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

controller.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const item = await db.query(
      `
    select
    s.id,
    s.item_name,
    s.item_description,
    s.id_category,
    s.id_subcategory,
    s.image_small,
    s.image_large,
    s.create_date,
    u.username
    from items s

    inner join users u on u.id = s.id_user
    where s.id = $1`,
      [id]
    );

    if (!item.rows.length) {
      return res.status(404).send({ error: "Item not found" });
    }

    res.status(200).send(item.rows);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

controller.post(
  "/",
    upload.single('image'),
  validate(ItemsSchema),
  async (req: Request, res: Response) => {
    try {
      const {
        item_name,
        item_description,
        id_category,
        id_subcategory,
        image_small,
        image_large,
        id_user
      } = req.body as Items;
      const create_date = new Date().toISOString();
      const newItem = await db.query(
        `INSERT INTO items (
                item_name,
                item_description,
                id_category,
                id_subcategory,
                image_small, 
                image_large, 
                create_date,
                id_user ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [
          item_name,
          item_description,
          id_category,
          id_subcategory,
          image_small,
          image_large,
          create_date,
          id_user
        ]
      );
      res.status(200).send(newItem.rows);
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  }
);

controller.put(
  "/:id",
  validate(ItemsSchema),
  async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const {
        item_name,
        item_description,
        id_category,
        id_subcategory,
        image_small,
        image_large,
        id_user
      } = req.body as Items;

      const item = await db.query("SELECT * FROM items WHERE id = $1", [id]);

      if (!item.rows.length) {
        return res.status(400).send({ error: "Item not found" });
      }

      const updatedItem = await db.query(
        `UPDATE items SET 
                item_name = $1, 
                item_description = $2, 
                id_category = $3, 
                id_subcategory = $4,
                image_small = $5, 
                image_large = $6, 
                id_user = $7
                WHERE id = $8
                RETURNING *`,
        [
          item_name,
          item_description,
          id_category,
          id_subcategory,
          image_small,
          image_large,
          id_user,
          id
        ]
      );

      res.status(200).send(updatedItem.rows);
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  }
);

controller.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const item = await db.query("SELECT * FROM items WHERE id = $1", [id]);

    if (!item.rows.length) {
      return res.status(400).send({ error: "Item not found" });
    }

    await db.query("DELETE FROM items WHERE id= $1", [id]);

    res.status(200).send({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

export default controller;
