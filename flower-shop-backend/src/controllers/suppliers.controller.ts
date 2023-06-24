import express, { Request, Router, Response } from "express";
import db from "@src/db/db";
import SupplierSchema, { Supplier } from "@src/models/supplier.model";
import validate from "@src/middlewares/validateRequest";

const controller: Router = express.Router();

controller.get("/", async (req: Request, res: Response) => {
  try {
    const suppliers = await db.query(
      `select
      s.id,
      s.name_supplier,
      s.contact_person,
      s.email,
      s.phone,
      s.address,
      c.name_country,
      ci.name_city,
      s.create_date
      from suppliers s
      inner join countries c on c.id = s.id_country
      inner join cities ci on ci.id = s.id_city 
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
      s.contact_person,
      s.email,
      s.phone,
      s.address,
      c.name_country,
      ci.name_city,
      s.create_date
      from suppliers s
      inner join countries c on c.id = s.id_country
      inner join cities ci on ci.id = s.id_city
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
        contact_person,
        email,
        phone,
        address,
        id_country,
        id_city
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
            contact_person = $2,
            email = $3,
            phone = $4,
            address = $5,
            id_country = $6,
            id_city = $7
            WHERE id= $8
            RETURNING *`,
        [
          name_supplier,
          contact_person,
          email,
          phone,
          address,
          id_country,
          id_city,
          id
        ]
      );

      const selectedSupplier = await db.query(
        `select
        s.id,
        s.name_supplier,
        s.contact_person,
        s.email,
        s.phone,
        s.address,
        c.name_country,
        ci.name_city,
        s.create_date
        from suppliers s
        inner join countries c on c.id = s.id_country
        inner join cities ci on ci.id = s.id_city
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
        contact_person,
        email,
        phone,
        address,
        id_country,
        id_city
      } = req.body as Supplier;

      const create_date = new Date().toISOString();

      const newSupplier: any = await db.query(
        `INSERT INTO suppliers as s
            (name_supplier, contact_person, email, phone, address, id_country, id_city, create_date)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id`,
        [
          name_supplier,
          contact_person,
          email,
          phone,
          address,
          id_country,
          id_city,
          create_date
        ]
      );

      const supplier = await db.query(
        `select
        s.id,
        s.name_supplier,
        s.contact_person,
        s.email,
        s.phone,
        s.address,
        c.name_country,
        ci.name_city,
        s.create_date
        from suppliers s
        inner join countries c on c.id = s.id_country
        inner join cities ci on ci.id = s.id_city
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
