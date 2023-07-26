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
const actions_models_1 = __importDefault(require("@src/models/actions.models"));
const validateRequest_1 = __importDefault(require("@src/middlewares/validateRequest"));
const controller = express_1.default.Router();
controller.get("/pagination", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const start = req.query.start;
        const end = req.query.end;
        const actions = yield db_1.default.query(`select
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
        `, [start, end]);
        res.status(200).send(actions.rows);
    }
    catch (error) {
        res.status(500).send({ error: error.message });
    }
}));
controller.get("/period", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const start_date = req.query.start_date;
        const end_date = req.query.end_date;
        const actions = yield db_1.default.query(`select
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
      order by a.date`, [start_date, end_date]);
        res.status(200).send(actions.rows);
    }
    catch (error) {
        res.status(500).send({ error: error.message });
    }
}));
controller.get("/supplier", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const supplier_id = req.query.supplier_id;
        const actions = yield db_1.default.query(`select
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
        `, [supplier_id]);
        res.status(200).send(actions.rows);
    }
    catch (error) {
        res.status(500).send({ error: error.message });
    }
}));
controller.post('/', (0, validateRequest_1.default)(actions_models_1.default), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.get('Authorization');
        const { operation_type_id, source_id, target_id, invoice_number, items } = req.body;
        const user = yield db_1.default.query('SELECT id FROM users WHERE token = $1', [
            token
        ]);
        if (!user.rows.length) {
            return res.status(400).send({ message: 'User not found' });
        }
        const operation = yield db_1.default.query('SELECT * FROM operation_type WHERE id = $1', [operation_type_id]);
        if (!operation.rows.length) {
            return res.status(400).send({ error: 'Operation not found' });
        }
        const source = yield db_1.default.query('SELECT * FROM suppliers WHERE id = $1', [source_id]);
        if (!source.rows.length) {
            return res.status(400).send({ error: 'Source not found' });
        }
        const target = yield db_1.default.query('SELECT * FROM storages WHERE id = $1', [target_id]);
        if (!target.rows.length) {
            return res.status(400).send({ error: 'Target not found' });
        }
        const create_date = new Date().toISOString();
        const actions = [];
        for (const item of items) {
            const { item_id, qty, price } = item;
            if (qty <= 0) {
                return res.status(400).send({ error: 'Qty less than or equal to 0' });
            }
            if (price <= 0) {
                return res.status(400).send({ error: 'Price less than or equal to 0' });
            }
            const total = qty * price;
            const newAction = db_1.default.query(`INSERT INTO actions 
          (operation_type_id, source_id, target_id, item_id, qty, price, date, total_price, user_id, invoice_number)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8,  (select id from users where token = $9), $10) RETURNING *`, [
                operation_type_id,
                source_id,
                target_id,
                item_id,
                qty,
                price,
                create_date,
                total,
                token,
                invoice_number
            ]);
            actions.push(newAction);
        }
        const insertedActions = yield Promise.all(actions);
        res.status(200).send(insertedActions.map((result) => result.rows[0]));
    }
    catch (error) {
        res.status(500).send({ error: error.message });
    }
}));
controller.put("/:id", (0, validateRequest_1.default)(actions_models_1.default), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const token = req.get("Authorization");
        const { operation_type_id, source_id, target_id, item_id, qty, price } = req.body;
        const user_id = yield db_1.default.query("SELECT id FROM users WHERE token = $1", [
            token
        ]);
        if (!user_id.rows.length) {
            return res.status(400).send({ message: "User not found" });
        }
        const id_actions = yield db_1.default.query("SELECT * FROM actions WHERE id = $1", [
            id
        ]);
        if (!id_actions.rows.length) {
            return res.status(400).send({ error: "Actions not found" });
        }
        const operation = yield db_1.default.query("SELECT * FROM operation_type WHERE id = $1", [operation_type_id]);
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
                const newActions = yield db_1.default.query(`UPDATE actions SET
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
            RETURNING *`, [
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
                ]);
                res.status(200).send(newActions.rows);
            }
        }
    }
    catch (error) {
        res.status(500).send({ error: error.message });
    }
}));
controller.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const item = yield db_1.default.query("SELECT * FROM actions WHERE id = $1", [id]);
        if (!item.rows.length) {
            return res.status(400).send({ error: "Actions not found" });
        }
        yield db_1.default.query("DELETE FROM actions WHERE id= $1", [id]);
        res.status(200).send({ message: "Actions deleted successfully" });
    }
    catch (error) {
        res.status(500).send({ error: error.message });
    }
}));
controller.get('/invoices', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const invoiceNumbers = yield db_1.default.query(`select
      invoice_number as id,
      COUNT(*) AS total_items,
      suppliers.name_supplier AS supplier_name,
      s.storage AS storage_name,
      SUM(total_price) AS total_sum,
      MAX(date) AS date
    from actions
    left join storages ss ON actions.target_id = ss.id
     left join suppliers ON actions.source_id = suppliers.id
    left JOIN storages s ON actions.target_id= s.id
    group by invoice_number, suppliers.name_supplier, s.storage
    order by id`);
        res.status(200).send(invoiceNumbers.rows);
    }
    catch (error) {
        res.status(500).send({ error: error.message });
    }
}));
controller.get('/invoices/:invoice_number', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const invoiceNumber = req.params.invoice_number;
        const query = `
    select
  i.item_name,
  s1.name_supplier AS source_supplier_name,
  s2.storage AS target_storage_name,
  a.qty,
  a.price,
  a.total_price,
  a.date,
  u.first_name,
  u.last_name
from
  actions a
  join items i ON a.item_id = i.id
  left join suppliers s1 on a.source_id = s1.id
  left join storages s2 on a.target_id = s2.id
  left join users u on a.user_id = u.id
where
  a.invoice_number = $1;
    `;
        const result = yield db_1.default.query(query, [invoiceNumber]);
        res.status(200).json(result.rows);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
exports.default = controller;
