import express, { Request, Router, Response } from "express";
import db from "@src/db/db";
import ActionsSchema, { Actions } from "@src/models/actions.models";
import validate from "@src/middlewares/validateRequest";

const controller: Router = express.Router();

controller.get("/pagination", async (req: Request, res: Response) => {
  try {
    const start = req.query.start;
    const end = req.query.end;
    const actions = await db.query(
      `select
      (select count(id) from actions) as total_count,
      a.id,
      ot.name,
      CASE
      WHEN ssi.supplier_id is not null THEN (select name_supplier from suppliers where id = ssi.supplier_id)
      WHEN ssi.storage_id is not null THEN (select storage from storages where id = ssi.storage_id)
      END source,
      CASE
      WHEN sst.supplier_id is not null THEN (select name_supplier from suppliers where id = sst.supplier_id)
      WHEN sst.storage_id is not null THEN (select storage from storages where id = sst.storage_id)
      END target,
      i.item_name,
      a.qty,
      a.price,
      a.total_price,
      a.date,
      a.update_date
      from actions a
      inner join operation_type ot on ot.id = a.operation_type_id
      inner join suppliers_storages ssi on ssi.id = a.source_id
      inner join suppliers_storages sst on sst.id = a.target_id
      inner join items i on i.id = a.item_id
      where a.id between $1 and $2
      order by a.id
        `,
      [start, end]
    );
    res.status(200).send(actions.rows);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

controller.get("/period", async (req: Request, res: Response) => {
  try {
    const start_date = req.query.start_date;
    const end_date = req.query.end_date;
    const actions = await db.query(
      `select
      a.id,
      ot.name,
      CASE
      WHEN ssi.supplier_id is not null THEN (select name_supplier from suppliers where id = ssi.supplier_id)
      WHEN ssi.storage_id is not null THEN (select storage from storages where id = ssi.storage_id)
      END source,
      CASE
      WHEN sst.supplier_id is not null THEN (select name_supplier from suppliers where id = sst.supplier_id)
      WHEN sst.storage_id is not null THEN (select storage from storages where id = sst.storage_id)
      END target,
      i.item_name,
      a.qty,
      a.price,
      a.total_price,
      a.date,
      a.update_date
      from actions a
      inner join operation_type ot on ot.id = a.operation_type_id
      inner join suppliers_storages ssi on ssi.id = a.source_id
      inner join suppliers_storages sst on sst.id = a.target_id
      inner join items i on i.id = a.item_id
      where to_char(a.date, 'DD.MM.YYYY') between $1 and $2
      order by a.date`,
      [start_date, end_date]
    );
    res.status(200).send(actions.rows);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

controller.get("/supplier", async (req: Request, res: Response) => {
  try {
    const supplier_id = req.query.supplier_id;
    const actions = await db.query(
      `select
      a.id,
      ot.name,
      CASE
      WHEN ssi.supplier_id is not null THEN (select name_supplier from suppliers where id = ssi.supplier_id)
      WHEN ssi.storage_id is not null THEN (select storage from storages where id = ssi.storage_id)
      END source,
      CASE
      WHEN sst.supplier_id is not null THEN (select name_supplier from suppliers where id = sst.supplier_id)
      WHEN sst.storage_id is not null THEN (select storage from storages where id = sst.storage_id)
      END target,
      i.item_name,
      a.qty,
      a.price,
      a.total_price,
      a.date,
      a.update_date
      from actions a
      inner join operation_type ot on ot.id = a.operation_type_id
      inner join suppliers_storages ssi on ssi.id = a.source_id
      inner join suppliers_storages sst on sst.id = a.target_id
      inner join items i on i.id = a.item_id
      where a.source_id = (
	  select id from suppliers_storages where supplier_id = $1)
      order by a.id
        `,
      [supplier_id]
    );
    res.status(200).send(actions.rows);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

export default controller;