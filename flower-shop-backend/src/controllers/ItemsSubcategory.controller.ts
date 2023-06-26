import express, { Request, Router, Response } from "express";
import db from "@src/db/db";
import SubcategorySchema, { Subcategory } from "@src/models/subcategory.models";
import validate from "@src/middlewares/validateRequest";

const controller: Router = express.Router();

controller.get("/", async (req: Request, res: Response) => {
    try {
        const subcategory = await db.query(
            `SELECT
        sc.subcategory_name,
        sc.subcategory_description,
        c.category_name
        FROM items_subcategories sc
        inner join items_categories c on c.id = sc.id_category`
        );
        res.status(200).send(subcategory.rows);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});
controller.get("/:id", async (req: Request, res: Response) => {
    try {
        const subcategoryId = req.params.id;

        const subcategory = await db.query(
            `SELECT
            sc.subcategory_name,
            sc.subcategory_description,
            c.category_name
            FROM items_subcategories sc
            inner join items_categories c on c.id = sc.id_category
            WHERE sc.id = $1`,
            [subcategoryId]);

        if (subcategory.rows.length === 0) {
            return res.status(404).send({ error: 'Subcategory not found' });
        }

        res.status(200).send(subcategory.rows[0]);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

controller.post('/', validate(SubcategorySchema), async (req: Request, res: Response) => {
    try {
        const { subcategory_name, subcategory_description, id_category } = req.body as Subcategory;
        const newSubcategory = await db.query(`
      INSERT INTO items_subcategories (subcategory_name, subcategory_description, id_category)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [subcategory_name, subcategory_description, id_category]);

        res.status(200).send(newSubcategory.rows[0]);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

controller.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deletedSubcategory = await db.query(`
        DELETE FROM items_subcategories
        WHERE id = $1
        RETURNING *
      `, [id]);

        if (deletedSubcategory.rows.length === 0) {
            return res.status(404).send('Subcategory is not found');
        }

        res.status(200).send('Subcategory is successfully deleted');
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

export default controller;
