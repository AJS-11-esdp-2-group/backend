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

controller.post(
  "/",
  validate(ActionsSchema),
  async (req: Request, res: Response) => {
    try {
      const token = req.get("Authorization");
      const { operation_type_id, source_id, target_id, item_id, qty, price } =
        req.body as Actions;
      const user_id = await db.query("SELECT id FROM users WHERE token = $1", [
        token
      ]);
      if (!user_id.rows.length) {
        return res.status(400).send({ message: "User not found" });
      }
      const operation = await db.query(
        "SELECT * FROM operation_type WHERE id = $1",
        [operation_type_id]
      );
      if (!operation.rows.length) {
        return res.status(400).send({ error: "Operation not found" });
      }
      if (qty && price) {
        if (qty <= 0) {
          return res.status(400).send({ error: "Qty less than or equal to 0" });
        }
        if (price <= 0) {
          return res
            .status(400)
            .send({ error: "Price less than or equal to 0" });
        }
        if (qty > 0 && price > 0) {
          const total = qty * price;
          const create_date = new Date().toISOString();
          const newActions = await db.query(
            `INSERT INTO actions (operation_type_id, source_id, target_id, item_id, qty, price, date, total_price, user_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 
              (select id from users where token = $9)) RETURNING *`,
            [
              operation_type_id,
              source_id,
              target_id,
              item_id,
              qty,
              price,
              create_date,
              total,
              token
            ]
          );
          res.status(200).send(newActions.rows);
        }
      }
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  }
);

controller.put(
  "/:id",
  validate(ActionsSchema),
  async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const token = req.get("Authorization");
      const { operation_type_id, source_id, target_id, item_id, qty, price } =
        req.body as Actions;
      const user_id = await db.query("SELECT id FROM users WHERE token = $1", [
        token
      ]);
      if (!user_id.rows.length) {
        return res.status(400).send({ message: "User not found" });
      }
      console.log(user_id);
      const id_actions = await db.query("SELECT * FROM actions WHERE id = $1", [
        id
      ]);
      if (!id_actions.rows.length) {
        return res.status(400).send({ error: "Actions not found" });
      }
      const operation = await db.query(
        "SELECT * FROM operation_type WHERE id = $1",
        [operation_type_id]
      );
      if (!operation.rows.length) {
        return res.status(400).send({ error: "Operation not found" });
      }
      if (qty && price) {
        if (qty <= 0) {
          return res.status(400).send({ error: "Qty less than or equal to 0" });
        }
        if (price <= 0) {
          return res
            .status(400)
            .send({ error: "Price less than or equal to 0" });
        }
        if (qty > 0 && price > 0) {
          const total = qty * price;
          const update_date = new Date().toISOString();
          const newActions = await db.query(
            `UPDATE actions SET
            operation_type_id=$1, 
            source_id = $2, 
            target_id = $3, 
            item_id = $4, 
            qty = $5, 
            price = $6,
            total_price= $7,
            user_id = (SELECT id FROM users WHERE token = $8),
            update_date = $9
            WHERE id = $10
            RETURNING *`,
            [
              operation_type_id,
              source_id,
              target_id,
              item_id,
              qty,
              price,
              total,
              token,
              update_date,
              id
            ]
          );
          res.status(200).send(newActions.rows);
        }
      }
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  }
);

controller.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const item = await db.query("SELECT * FROM actions WHERE id = $1", [id]);
    if (!item.rows.length) {
      return res.status(400).send({ error: "Actions not found" });
    }
    await db.query("DELETE FROM actions WHERE id= $1", [id]);
    res.status(200).send({ message: "Actions deleted successfully" });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

export default controller;
