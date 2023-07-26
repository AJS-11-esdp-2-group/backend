import express, { Request, Router, Response } from "express";
import db from "../db/db";

const controller: Router = express.Router();

controller.get("/", async (req: Request, res: Response) => {
  try {
    const suppliers_storages = await db.query(
      `select
      st.id,
      (select name_supplier from suppliers where id = st.supplier_id) as name
      from suppliers_storages st
      where st.storage_id is null
      `
    );
    res.status(200).send(suppliers_storages.rows);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

export default controller;
