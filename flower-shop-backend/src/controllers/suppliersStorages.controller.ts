import express, { Request, Router, Response } from "express";
import db from "@src/db/db";

const controller: Router = express.Router();

controller.get("/", async (req: Request, res: Response) => {
  try {
    const suppliers_storages = await db.query(
      `select
      st.id,
      CASE
      WHEN st.supplier_id is not null THEN (select name_supplier from suppliers where id = st.supplier_id)
      WHEN st.storage_id is not null THEN (select storage from storages where id = st.storage_id)
      END name
      from suppliers_storages st
        `
    );
    res.status(200).send(suppliers_storages.rows);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

export default controller;
