import express, { Request, Router, Response } from "express";
import db from "@src/db/db";

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

export default controller;