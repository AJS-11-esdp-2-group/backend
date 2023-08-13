import express, { Request, Router, Response } from "express";
import nextOrderNumbers from "@src/helpers/nextOrderNumber";
import processFile from "../middlewares/upload";
import { format } from "util";
import { Storage } from "@google-cloud/storage";
import db from "@src/db/db";
import { nanoid } from "nanoid";
import { uploadPath } from "../../config";
import fs from "fs";

const controller: Router = express.Router();
const storage = new Storage({ keyFilename: "google-cloud-key.json" });
const bucket = storage.bucket("flower_shop_1");

controller.get("/showcase", async (req: Request, res: Response) => {
  try {
    const showcase = await db.query(
      `
      select
      o.bouquet_id as id,
	  o.order_number,					
      o.actual_price,
      (select  bouquet_name from bouquets where id = o.bouquet_id) as "name_bouquet",
      (select image from bouquets_images where id_bouquet = o.bouquet_id limit 1) as "image_bouquet",
	  (select username from users where id = o.user_id),
	  o.added_date
      from orders o
      where o.order_number in ( select invoice_number from actions where operation_type_id = 3)
      `
    );

    res.status(200).send(showcase.rows);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

controller.get("/showcase/:bouquet_id", async (req: Request, res: Response) => {
  try {
    const orderNumber = req.params.bouquet_id;
    const query = `
	  select
	  a.invoice_number,
	  u.username,
	  a.date,
	  (select bouquet_name from bouquets where id in (select bouquet_id from orders where order_number = $1 )),
	  (select image from bouquets_images where id_bouquet in (select bouquet_id from orders where order_number = $1 ))as image_bouquet,
	  i.item_name,
    a.qty,
	  a.price
	  from actions a
	  inner join items i on i.id = a.item_id 
	  inner join users u on u.id = a.user_id
	  where invoice_number = $1
      `;

    const result = await db.query(query, [orderNumber]);

    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

controller.put("/:bouquet_id", async (req: Request, res: Response) => {
  try {
    const id = req.params.bouquet_id;
    const token = req.get("Authorization");

    const { total_sum, count } = req.body;

    const user_id = await db.query("SELECT id FROM users WHERE token = $1", [
      token
    ]);
    if (!user_id.rows.length) {
      return res.status(400).send({ message: "User not found" });
    }
    const order = await db.query(
      `select count (o.bouquet_id) from orders o 
      where o.bouquet_id = $1 
      and o.order_number in (select a.invoice_number from actions a where a.operation_type_id =3)`,
      [id]
    );

    if (!order.rows.length || order.rows[0].count < count) {
      return res
        .status(400)
        .send({ error: "Bouquet_not found or quantity more than in the base" });
    }
    const update_date = new Date().toISOString();
    await db.query(
      `UPDATE actions SET operation_type_id = 2, update_date = $1,
      user_id = (SELECT id FROM users WHERE token = $2)
      WHERE
      invoice_number in ( select order_number from orders where bouquet_id = $3 and order_number in
        (select a.invoice_number from actions a where a.operation_type_id = 3) order by order_number limit $4)
      `,
      [update_date, token, id, count]
    );

    await db.query(
      `UPDATE orders
      SET total_sum = $1, update_date = $2, user_id = (SELECT id FROM users WHERE token = $3)
      WHERE bouquet_id in (select bouquet_id from orders where bouquet_id = $4 order by order_number limit $5)`,
      [total_sum, update_date, token, id, count]
    );

    res.status(200).send({ message: "Update was successful" });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

controller.post("/showcase", async (req: Request, res: Response) => {
  const token = req.get("Authorization");

  if (!token) return res.status(400).send("Token must present!");

  try {
    const user = await db.query("SELECT * FROM users WHERE token = $1", [
      token
    ]);

    if (!user.rows.length)
      return res.status(400).send({ message: "User not found" });

    if (user.rows[0].id_role !== 1 && 2)
      return res.status(403).send({ message: "Access forbidden" });

    const { bouquets } = req.body as { bouquets: Array<string> };

    if (!bouquets || !bouquets.length)
      return res.status(400).send({ message: "Bad request" });

    const newOrderNumbers = await nextOrderNumbers(bouquets.length);

    const actions = bouquets.map(async (bouquet, i) => {
      const create_date = new Date().toISOString();

      const bouquetRecipes = (
        await db.query(`
      select r.id, r.id_bouquet, r.id_item, r.qty, ipm.price
      from recipes r
      join (
        select il.item_id, il.last_date, ip.price
        from(
          select item_id, max(added_date) as last_date
          from items_prices 
          group by item_id
        )il
        join items_prices ip on ip.added_date = il.last_date
      ) ipm on r.id_item = ipm.item_id
      where id_bouquet in (${bouquet})
      `)
      ).rows;

      const price = await db.query(
        `
        select distinct on(b.id) 
        b.id, sum(qty*price) 
        from bouquets b 
        left join (
          SELECT  r.id, r.id_bouquet, r.id_item, r.qty, ipf.price
          FROM recipes r
          LEFT JOIN (
            select item, date,ip.price FROM(
            SELECT item_id as item, max(added_date) as date
            from items_prices
            group by item_id
            ) as fg
            join items_prices ip on fg.date = ip.added_date
          ) as ipf on r.id_item = ipf.item
        ) r on r.id_bouquet = b.id
        WHERE b.id = $1
        group by b.id
    `,
        [parseInt(bouquet)]
      );

      if (bouquetRecipes.length) {
        bouquetRecipes.forEach(async (recipe) => {
          await db.query(
            `
          INSERT INTO actions (operation_type_id, source_id, target_id, item_id, qty, price, total_price, invoice_number, date, update_date, user_id)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `,
            [
              3,
              2,
              4,
              recipe.id_item,
              parseInt(recipe.qty),
              parseInt(recipe.price),
              parseInt(recipe.qty) * parseInt(recipe.price),
              newOrderNumbers[i],
              create_date,
              null,
              user.rows[0].id
            ]
          );
        });
      }

      return db.query(
        `
        INSERT INTO orders (order_number, bouquet_id, actual_price, total_sum, added_date, update_date, user_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [
          newOrderNumbers[i],
          bouquet,
          price.rows[0].sum === null ? 0 : parseInt(price.rows[0].sum),
          0,
          create_date,
          null,
          user.rows[0].id
        ]
      );
    });

    const results = await Promise.all(actions);
    res.status(200).send(results.map((result) => result.rows[0]));
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

controller.post("/showcase_custom", async (req: Request, res: Response) => {
  await processFile(req, res);
  const fileOriginalName = req.file?.originalname;
  const { name, description, items } = req.body;
  const token = req.get("Authorization");
  if (!token) return res.status(400).send("Token must present!");
  const user = await db.query("SELECT * FROM users WHERE token = $1", [token]);
  if (!user.rows.length)
    return res.status(400).send({ message: "User not found" });
  try {
    // Запись нового букета
    await db.query(
      `INSERT INTO bouquets (bouquet_name, bouquet_description, 
                author, id_category)
              VALUES ($1, $2, (SELECT username FROM users WHERE token = $3), 5);
              `,
      [name, description, token]
    );
    const arrItems = JSON.parse(items);
    const totalPrice = Array.from(arrItems).reduce(
      (accumulator: any, item: any) =>
        accumulator + parseInt(item.price) * parseInt(item.qty),
      0
    );
    const date = new Date().toISOString();
    const orderNumber = nanoid();
    // Запись в orders
    await db.query(
      `INSERT INTO orders (bouquet_id, order_number, actual_price,total_sum,added_date,user_id)
              VALUES ((select id from bouquets order by id desc limit 1), $1, $2, 0, $3,(SELECT id FROM users WHERE token = $4));
              `,
      [`AV${orderNumber}`, totalPrice, date, token]
    );

    // Запись в actions
    for (const item of arrItems) {
      await db.query(
        `INSERT INTO actions (operation_type_id, source_id,target_id,item_id,qty,price, total_price,invoice_number, date,user_id)
                VALUES (3,2,4, $1, $2, $3, $4,$5,$6,(SELECT id FROM users WHERE token = $7));
                `,
        [
          item.id,
          item.qty,
          item.price,
          totalPrice,
          `AV${orderNumber}`,
          date,
          token
        ]
      );
    }

    if (!req.file) {
      return res.status(200).send({ message: "Insert was successful" });
    }
    const blob = bucket.file(req.file.originalname);
    const blobStream = blob.createWriteStream({
      resumable: false
    });
    blobStream.on("error", (err) => {
      res.status(500).send({ message: err.message });
    });
    blobStream.on("finish", async () => {
      const publicUrl = format(
        `https://storage.googleapis.com/${bucket.name}/${blob.name}`
      );
      try {
        // Запись картинки букета
        await db.query(
          `
              INSERT INTO bouquets_images (id_bouquet, image) 
              VALUES ((select id from bouquets order by id desc limit 1), $1)
              RETURNING *
          `,
          [publicUrl]
        );
      } catch (error) {
        res.status(500).send({ error: error.message });
      }
      res.status(200).send({ message: "Insert was successful" });
    });
    blobStream.end(req.file.buffer);
  } catch (err) {
    res.status(500).send({
      message: `Could not upload the file: ${fileOriginalName}. ${err}`
    });
  }
});

controller.put("/write_off/:order_number", async (req: Request, res: Response) => {
  try {
    const id = req.params.order_number;
    const token = req.get("Authorization");
    const user_id = await db.query("SELECT id FROM users WHERE token = $1", [
      token
    ]);
    if (!user_id.rows.length) {
      return res.status(400).send({ message: "User not found" });
    }

    const update_date = new Date().toISOString();
    await db.query(
      `UPDATE actions SET operation_type_id = 4, update_date = $1,
      user_id = (SELECT id FROM users WHERE token = $2)
      WHERE
      invoice_number = $3
      `,
      [update_date, token, id]
    );
    res.status(200).send({ message: "Update was successful" });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});
controller.put("/sendBasket/:order_number", async (req: Request, res: Response) => {
  try {
    const id = req.params.order_number;
    const token = req.get("Authorization");
    const user_id = await db.query("SELECT id FROM users WHERE token = $1", [
      token
    ]);
    if (!user_id.rows.length) {
      return res.status(400).send({ message: "User not found" });
    }

    const update_date = new Date().toISOString();
    await db.query(
      `UPDATE actions SET operation_type_id = 5, update_date = $1,
      user_id = (SELECT id FROM users WHERE token = $2)
      WHERE
      invoice_number = $3
      `,
      [update_date, token, id]
    );
    res.status(200).send({ message: "Update was successful" });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});


controller.post("/", async (req: Request, res: Response) => {
  const token = req.get("Authorization");
  if (!token) return res.status(400).send("Token must be present!");

  try {
    const user = await db.query("SELECT * FROM users WHERE token = $1", [token]);
    if (!user.rows.length) return res.status(400).send({ message: "User not found" });

    const { bouquets } = req.body as { bouquets: Array<{ bouquet: number, actual_price: number, total_price: number, payment_type: number }> };
    if (!bouquets || !bouquets.length) return res.status(400).send({ message: "Bad request" });
    const orderNum = nanoid();
    const orderPrefix = "av-"
    const create_date = new Date().toISOString();
    const totalSales = bouquets.reduce((total, bouquet) => total + bouquet.total_price, 0);
    const lastGeneralOrder = await db.query("SELECT order_number FROM general_orders ORDER BY id DESC LIMIT 1");
    const lastOrderNumber = lastGeneralOrder.rows[0]?.order_number || "av-0000";
    const lastNumber = parseInt(lastOrderNumber.split("-")[1]);
    const nextNumber = lastNumber + 1;
    const orderNumber = `${orderPrefix}${nextNumber.toString().padStart(4, "0")}`;

    const generalOrderIdResult = await db.query(
      `
      INSERT INTO general_orders (order_number, order_date, total_sales)
      VALUES ($1, $2, $3) RETURNING id`,
      [
        orderNumber,
        new Date().toISOString(),
        totalSales
      ]
    );
    const generalOrderId = generalOrderIdResult.rows[0].id as number;

    await Promise.all(
      bouquets.map(async (bouquetData) => {
        const { bouquet, actual_price, total_price, payment_type } = bouquetData;

        const orderIdResult = await db.query(
          `
          INSERT INTO orders (general_order_id, order_number, bouquet_id, actual_price, total_sum, payment_type, added_date, update_date, user_id)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
          [
            generalOrderId,
            `av-${orderNum}`,
            bouquet,
            actual_price,
            total_price,
            payment_type,
            create_date,
            null,
            user.rows[0].id
          ]
        );
        const orderId = orderIdResult.rows[0].id;

        const bouquetRecipes = (
          await db.query(`
          SELECT r.id, r.id_bouquet, r.id_item, r.qty, i.price
          FROM recipes r
          JOIN items i ON r.id_item = i.id
          WHERE id_bouquet = $1
          `, [bouquet])
        ).rows;

        const actions = bouquetRecipes.map(async (recipe) => {
          await db.query(
            `
            INSERT INTO actions (operation_type_id, source_id, target_id, item_id, qty, price, total_price, invoice_number, date, update_date, user_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            `,
            [
              2,
              3,
              9,
              recipe.id_item,
              parseInt(recipe.qty),
              parseInt(recipe.price),
              parseInt(recipe.qty) * parseInt(recipe.price),
              `av-${orderNum}`,
              create_date,
              null,
              user.rows[0].id
            ]
          );
        });

        return Promise.all([orderId, ...actions]);
      })
    );

    res.status(200).send({ message: "Orders and general order created successfully" });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

controller.get("/", async (req: Request, res: Response) => {
  try {
    const generalOrders = await db.query("SELECT * FROM general_orders");
    res.status(200).send(generalOrders.rows);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});
controller.get("/:general_order_id", async (req: Request, res: Response) => {
  const { general_order_id } = req.params;
  try {
    const orders = await db.query(
      `SELECT o.*, u.last_name, u.first_name, pt.name as payment_type, b.bouquet_name
      FROM orders o
      INNER JOIN users u ON o.user_id = u.id
      INNER JOIN payment_type pt ON o.payment_type = pt.id
      INNER JOIN bouquets b ON o.bouquet_id = b.id
      WHERE o.general_order_id = $1`, 
      [general_order_id]);
    res.status(200).send(orders.rows);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

export default controller;
