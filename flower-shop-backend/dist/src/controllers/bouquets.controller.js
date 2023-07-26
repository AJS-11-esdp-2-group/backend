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
const bouquets_models_1 = __importDefault(require("@src/models/bouquets.models"));
const validateRequest_1 = __importDefault(require("@src/middlewares/validateRequest"));
const controller = express_1.default.Router();
controller.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bouquets = yield db_1.default.query(`
          select distinct on(b.id) 
          b.id, b.bouquet_name, b.bouquet_description, i.image, b.author, sum(qty*price) 
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
          LEFT OUTER JOIN bouquets_images i ON b.id = i.id_bouquet
          group by b.id, b.bouquet_name, b.bouquet_description, b.author, i.image
        `);
        res.status(200).send(bouquets.rows);
    }
    catch (error) {
        res.status(500).send({ error: error.message });
    }
}));
controller.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bouquets = yield db_1.default.query(`
        select distinct on(b.id) 
        b.id, b.bouquet_name, b.bouquet_description, i.image, b.author, sum(qty*price) 
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
        LEFT OUTER JOIN bouquets_images i ON b.id = i.id_bouquet
        WHERE b.id = $1
        group by b.id, b.bouquet_name, b.bouquet_description, b.author, i.image
      `, [req.params.id]);
        res.status(200).send(bouquets.rows);
    }
    catch (error) {
        res.status(500).send({ error: error.message });
    }
}));
controller.post('/', (0, validateRequest_1.default)(bouquets_models_1.default), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.get("Authorization");
    try {
        const user = yield db_1.default.query(`
      SELECT u.first_name, u.last_name  FROM users u
      WHERE token = $1
    `, [token]);
        const author = user.rows.length > 0 ? `${user.rows[0].first_name} ${user.rows[0].last_name}` : 'unknown';
        const { bouquet_name, bouquet_description, id_category } = req.body;
        const newBouquet = yield db_1.default.query(`
      INSERT INTO bouquets (bouquet_name, bouquet_description, author, id_category)
      VALUES ($1, $2, $3, $4)
      RETURNING id, bouquet_name, bouquet_description
    `, [bouquet_name, bouquet_description, author, id_category]);
        res.status(200).send(newBouquet.rows);
    }
    catch (error) {
        res.status(500).send({ error: error.message });
    }
}));
controller.put('/:id', (0, validateRequest_1.default)(bouquets_models_1.default), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.get("Authorization");
    try {
        const user = yield db_1.default.query(`
      SELECT u.first_name, u.last_name  FROM users u
      WHERE token = $1
    `, [token]);
        const author = user.rows.length > 0 ? `${user.rows[0].first_name} ${user.rows[0].last_name}` : 'unknown';
        const { id } = req.params;
        const { bouquet_name, bouquet_description, id_category } = req.body;
        const newBouquet = yield db_1.default.query(`
      UPDATE bouquets SET
      bouquet_name = $1,
      bouquet_description = $2,
      author = $3,
      id_category = $4
      WHERE id = $5
      RETURNING id, bouquet_name, bouquet_description, author, id_category
    `, [bouquet_name, bouquet_description, author, id_category, id]);
        res.status(200).send(newBouquet.rows);
    }
    catch (error) {
        res.status(500).send({ error: error.message });
    }
}));
controller.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const deletedBouquet = yield db_1.default.query(`
        DELETE FROM bouquets
        WHERE id = $1
        RETURNING *
      `, [id]);
        if (deletedBouquet.rows.length === 0) {
            return res.status(404).send({ error: 'Bouquet not found' });
        }
        res.status(200).send({ success: 'Success' });
    }
    catch (error) {
        res.status(500).send({ error: error.message });
    }
}));
exports.default = controller;
