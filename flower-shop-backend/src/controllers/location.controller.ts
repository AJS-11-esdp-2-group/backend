import express, { Request, Router, Response } from "express";
import db from "../db/db";

const controller: Router = express.Router();

controller.get("/country", async (req: Request, res: Response) => {
    try {
        const country = await db.query(`SELECT * FROM countries;`);
        res.status(200).send(country.rows);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});
controller.get("/cities", async (req: Request, res: Response) => {
    try {
        const cities = await db.query(
            `SELECT name_city, countries.name_country FROM cities JOIN countries ON cities.id_country = countries.id;`);

        if (cities.rows.length === 0) {
            return res.status(404).send({ error: 'Cities not found' });
        }

        res.status(200).send(cities.rows);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

export default controller;
