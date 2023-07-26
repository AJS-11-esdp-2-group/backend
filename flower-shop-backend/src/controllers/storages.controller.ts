import express, { Request, Router, Response } from "express";
import db from "../db/db";

const controller: Router = express.Router();

controller.get("/", async (req: Request, res: Response) => {
  try {
    const storages = await db.query(`select*from storages`);
    res.status(200).send(storages.rows);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

export default controller;
