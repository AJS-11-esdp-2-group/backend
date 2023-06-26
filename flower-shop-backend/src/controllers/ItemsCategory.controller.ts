import express, { Request, Router, Response } from "express";
import db from "@src/db/db";
import CategorySchema, { Category } from "@src/models/category.models";
import validate from "@src/middlewares/validateRequest";

const controller: Router = express.Router();

controller.get("/", async (req: Request, res: Response) => {
    try {
        const category = await db.query(`select * from items_categories`);
        res.status(200).send(category.rows);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});


controller.get("/:id", async (req: Request, res: Response) => {
    try {
        const categoryId = req.params.id;

        const category = await db.query(`SELECT * FROM items_categories WHERE id = $1`, [categoryId]);

        if (category.rows.length === 0) {
            return res.status(404).send({ error: 'Category not found' });
        }

        res.status(200).send(category.rows[0]);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

controller.post('/', validate(CategorySchema), async (req: Request, res: Response) => {
    try {
        const { category_name, category_description } = req.body as Category;
        const newCategory = await db.query(`
      INSERT INTO items_categories (category_name, category_description)
      VALUES ($1, $2)
      RETURNING *
    `, [category_name, category_description]);

        res.status(200).send(newCategory.rows[0]);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

controller.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deletedCategory = await db.query(`
        DELETE FROM items_categories
        WHERE id = $1
        RETURNING *
      `, [id]);

        if (deletedCategory.rows.length === 0) {
            return res.status(404).send('Category is not found');
        }

        res.status(200).send('Category is successfully deleted');
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

export default controller;