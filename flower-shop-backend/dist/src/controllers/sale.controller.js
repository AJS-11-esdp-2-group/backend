"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("@src/db/db"));
const controller = express_1.default.Router();
controller.get("/showcase", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const showcase = yield db_1.default.query(`
    select
    o.order_number as id,
    o.actual_price,
    (select  bouquet_name from bouquets where id = o.bouquet_id) as "name_bouquet",
    (select image from bouquets_images where id_bouquet = o.bouquet_id limit 1) as "image_bouquet",
    o.added_date
    from orders o
    where o.order_number in ( select invoice_number from actions where operation_type_id = 3)
      `);
        res.status(200).send(showcase.rows);
    }
    catch (error) {
        res.status(500).send({ error: error.message });
    }
}));
controller.get("/showcase/:order_number", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orderNumber = req.params.order_number;
        const query = `
      select
      o.order_number,
      (select  bouquet_name from bouquets where id = o.bouquet_id) as "name_bouquet",
      (select image from bouquets_images where id_bouquet = o.bouquet_id limit 1) as "image_bouquet",
      a.price,
      a.qty,
      i.item_name
      from 
      orders o
      inner join actions a on a.invoice_number = o.order_number
      inner join items i on i.id =  a.item_id
      where o.order_number = $1;
      `;
        const result = yield db_1.default.query(query, [orderNumber]);
        res.status(200).json(result.rows);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
controller.put("/:order_number", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.order_number;
        const token = req.get("Authorization");
        const { total_sum } = req.body;
        const user_id = yield db_1.default.query("SELECT id FROM users WHERE token = $1", [
            token
        ]);
        if (!user_id.rows.length) {
            return res.status(400).send({ message: "User not found" });
        }
        const order = yield db_1.default.query("SELECT * FROM orders WHERE order_number = $1", [id]);
        if (!order.rows.length) {
            return res.status(400).send({ error: "Order_number not found" });
        }
        const update_date = new Date().toISOString();
        yield db_1.default.query("UPDATE actions SET operation_type_id = 2, update_date = $1, user_id = (SELECT id FROM users WHERE token = $2) WHERE invoice_number = $3", [update_date, token, id]);
        yield db_1.default.query(`UPDATE orders
        SET total_sum = $1, update_date = $2, user_id = (SELECT id FROM users WHERE token = $3)
        WHERE order_number = $4`, [total_sum, update_date, token, id]);
        res.status(200).send({ message: "Update was successful" });
    }
    catch (error) {
        res.status(500).send({ error: error.message });
    }
}));
exports.default = controller;
