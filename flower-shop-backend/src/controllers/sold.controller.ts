import express, { Request, Router, Response } from "express";
import db from "@src/db/db";
import { nanoid } from "nanoid";

const controller: Router = express.Router();

controller.get("/", async (req: Request, res: Response) => {
    try {
        const showcase = await db.query(
            `
        select
        o.order_number as id,
        (select bouquet_name from bouquets where id = o.bouquet_id) as "name_bouquet",
        o.total_sum,
        o.update_date,
        (select username from users where id = o.user_id) as user,
        (select name from payment_type where id = o.payment_type) as "payment_type"
        from orders o
        where o.order_number in ( select invoice_number from actions where operation_type_id = 2)
        `
        );

        res.status(200).send(showcase.rows);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

controller.get("/:order_id", async (req: Request, res: Response) => {
    try {
      const orderNumber = req.params.order_id;
      const query = `
      SELECT
      o.order_number,
      b.bouquet_name AS "name_bouquet",
      i.item_name,
      i.price,
      r.qty
  FROM orders o
  LEFT JOIN recipes r ON o.bouquet_id = r.id_bouquet
  LEFT JOIN items i ON r.id_item = i.id
  LEFT JOIN bouquets b ON r.id_bouquet = b.id
  WHERE o.order_number = $1
        `;
  
      const result = await db.query(query, [orderNumber]);
  
      res.status(200).json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

export default controller;