import express, { Request, Router, Response } from "express";
import db from "../db/db";
import SupplierSchema, { Supplier } from "../models/supplier.model";
import validate from "../middlewares/validateRequest";

const controller: Router = express.Router();

controller.get("/", async (req: Request, res: Response) => {
  try {
    const suppliers = await db.query(
      `select
      s.id,
      s.name_supplier,
      s.email,
      s.phone,
      s.address,
      s.comment
      from suppliers s
order by s.name_supplier`
    );

    res.status(200).send(suppliers.rows);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

controller.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const supplier = await db.query(
      `select
      s.id,
      s.name_supplier,
      s.email,
      s.phone,
      s.address,
      s.comment
      from suppliers s
      WHERE s.id = $1`,
      [id]
    );

    if (!supplier.rows.length) {
      return res.status(404).send({ error: "Supplier not found" });
    }
    res.status(200).send(supplier.rows);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

controller.put(
  "/:id",
  validate(SupplierSchema),
  async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const {
        name_supplier,
        email,
        phone,
        address,
        comment
      } = req.body as Supplier;

      const supplier = await db.query("SELECT * FROM suppliers WHERE id = $1", [
        id
      ]);

      if (!supplier.rows.length) {
        return res.status(400).send({ error: "Supplier not found" });
      }

      const updatedSupplier = await db.query(
        `UPDATE suppliers SET
            name_supplier = $1,
            email = $2,
            phone = $3,
            address = $4,
            comment = $5
            WHERE id= $6
            RETURNING *`,
        [
          name_supplier,
          email,
          phone,
          address,
          comment,
          id
        ]
      );

      const selectedSupplier = await db.query(
        `select
        s.id,
        s.name_supplier,
        s.email,
        s.phone,
        s.address,
        s.comment
        from suppliers s
        WHERE s.id = $1`,
        [id]
      );

      res.status(200).send(selectedSupplier.rows);
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  }
);

controller.post(
  "/",
  validate(SupplierSchema),
  async (req: Request, res: Response) => {
    try {
      const {
        name_supplier,
        email,
        phone,
        address,
        comment
      } = req.body as Supplier;

      const create_date = new Date().toISOString();

      const newSupplier: any = await db.query(
        `INSERT INTO suppliers as s
            (name_supplier, email, phone, address, comment)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id`,
        [
          name_supplier,
          email,
          phone,
          address,
          comment
        ]
      );

      const supplier = await db.query(
        `select
        s.id,
        s.name_supplier,
        s.email,
        s.phone,
        s.address,
        s.comment
        from suppliers s
        WHERE s.id = $1`,
        [newSupplier.rows[0].id]
      );

      res.status(200).send(supplier.rows);
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  }
);

controller.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const supplierInActions = await db.query(
      "SELECT * FROM actions WHERE source_id IN (SELECT id FROM suppliers_storages WHERE supplier_id = $1) OR target_id IN (SELECT id FROM storages WHERE id IN (SELECT storage_id FROM suppliers_storages WHERE supplier_id = $1))",
      [id]
    );

    if (supplierInActions.rows.length > 0) {
      return res.status(400).send({ error: "Supplier is associated with actions and cannot be deleted" });
    }

    const supplier = await db.query("SELECT * FROM suppliers WHERE id = $1", [
      id
    ]);

    if (!supplier.rows.length) {
      return res.status(400).send({ error: "Supplier not found" });
    }

    await db.query("DELETE FROM suppliers WHERE id = $1", [id]);

    res.status(200).send({ message: "Supplier deleted successfully" });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

export default controller;
