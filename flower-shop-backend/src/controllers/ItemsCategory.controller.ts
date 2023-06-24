import express, { Request, Router, Response } from "express";
import db from "@src/db/db";

const controller: Router = express.Router();

controller.get("/", async (req: Request, res: Response) => {
    try {
        const subcategory = await db.query(`select * from items_subcategories`);
        res.status(200).send(subcategory.rows);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});
controller.get("/:id", async (req: Request, res: Response) => {
    try {
        const subcategoryId = req.params.id;

        const subcategory = await db.query(`SELECT * FROM items_subcategories WHERE id = $1`, [subcategoryId]);

        if (subcategory.rows.length === 0) {
            return res.status(404).send({ error: 'Subcategory not found' });
        }

        res.status(200).send(subcategory.rows[0]);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

export default controller;
