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
const uploadsImageSmall_1 = __importDefault(require("../middlewares/uploadsImageSmall"));
const util_1 = require("util");
const storage_1 = require("@google-cloud/storage");
const db_1 = __importDefault(require("../db/db"));
const item_model_1 = __importDefault(require("@src/models/item.model"));
const validateRequest_1 = __importDefault(require("../middlewares/validateRequest"));
const path_1 = __importDefault(require("path"));
const nanoid_1 = require("nanoid");
const controller = express_1.default.Router();
const storage = new storage_1.Storage({
    projectId: "rugged-night-391816",
    credentials: require('../../google-cloud-key.json')
});
const bucket = storage.bucket("flower_shop_1");
controller.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const item = yield db_1.default.query(`
    SELECT
    s.id,
    s.item_name,
    s.price,
    s.item_description,
    s.image_small,
    s.create_date,
    u.username,
	s.id_category,
  s.id_subcategory,
  (COALESCE((select sum(qty) from actions where operation_type_id = 1 and item_id = s.id),0,
			(select sum(qty) from actions where operation_type_id = 1 and item_id = s.id)) -
  COALESCE (((select sum(qty) from actions where operation_type_id not in(1,4) and item_id =s.id)),0,
   			(select sum(qty) from actions where operation_type_id not in(1,4) and item_id =s.id))) as "available_qty"
FROM
    items s
    INNER JOIN items_categories c ON s.id_category = c.id
    INNER JOIN users u ON u.id = s.id_user
`);
        res.status(200).send(item.rows);
    }
    catch (error) {
        res.status(500).send({ error: error.message });
    }
}));
controller.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const item = yield db_1.default.query(`
        SELECT
        s.id,
        s.item_name,
        s.price,
        s.item_description,
        s.id_category,
        s.id_subcategory,
        s.image_small,
        s.create_date,
        s.id_user,
        u.username
        FROM items s
        INNER JOIN items_categories ic ON ic.id = s.id_category
        INNER JOIN items_subcategories isc ON isc.id = s.id_subcategory
        INNER JOIN users u ON u.id = s.id_user
        WHERE s.id = $1`, [id]);
        if (item.rows.length === 0) {
            res.status(404).send({ error: 'Item not found' });
        }
        else {
            res.status(200).send(item.rows);
        }
    }
    catch (error) {
        res.status(500).send({ error: error.message });
    }
}));
controller.post('/', uploadsImageSmall_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.get('Authorization');
        if (!token)
            res.status(400).send({ message: "Token must be present" });
        const user = (yield db_1.default.query('SELECT * FROM users WHERE token = $1', [token])).rows[0];
        if (user.id_role !== 1 && user.id_role !== 2)
            return res.status(403).send({ message: 'Access forbidden' });
        const { item_name, item_description, id_category, id_subcategory, } = req.body;
        const create_date = new Date().toISOString();
        const id_user = user.id;
        let publicUrl = '';
        const insertIntoDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const newItem = (yield db_1.default.query(`INSERT INTO items (
            item_name,
            item_description,
            id_category,
            id_subcategory,
            image_small,
            create_date,
            id_user,
            price
          ) VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, 0), $8) RETURNING *`, [
                    item_name,
                    item_description,
                    id_category,
                    id_subcategory,
                    publicUrl,
                    create_date,
                    id_user,
                    0,
                ])).rows[0];
                res.status(200).send({
                    message: 'Item created successfully',
                    item: newItem,
                });
            }
            catch (error) {
                res.status(500).send({ error: error.message });
            }
        });
        if (req.file) {
            const blob = bucket.file((0, nanoid_1.nanoid)() + path_1.default.extname(req.file.originalname));
            const blobStream = blob.createWriteStream({
                resumable: false,
            });
            blobStream.on("error", (err) => {
                res.status(500).send({ message: err.message });
            });
            blobStream.on("finish", () => {
                publicUrl = (0, util_1.format)(`https://storage.googleapis.com/${bucket.name}/${blob.name}`);
                insertIntoDatabase();
            });
            blobStream.end(req.file.buffer);
        }
        else {
            insertIntoDatabase();
        }
    }
    catch (error) {
        res.status(500).send({ error: error.message });
    }
}));
controller.put('/:id', (0, validateRequest_1.default)(item_model_1.default), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.get('Authorization');
        const user = yield db_1.default.query('SELECT id FROM users WHERE token = $1', [
            token,
        ]);
        if (user.rows.length === 0) {
            return res.status(401).send({ error: 'Unauthorized' });
        }
        const { item_name, item_description, id_category, id_subcategory, price, } = req.body;
        const id = req.params.id;
        let image_small = 'img.jpeg';
        if (req.file) {
            image_small = req.file.path;
        }
        const id_user = user.rows[0].id;
        const updatedItem = yield db_1.default.query(`UPDATE items
          SET
            item_name = $1,
            item_description = $2,
            id_category = $3,
            id_subcategory = $4,
            image_small = $5,
            id_user = $6,
            price = COALESCE($7, 0)
          WHERE id = $8
          RETURNING *`, [
            item_name,
            item_description,
            id_category,
            id_subcategory,
            image_small,
            id_user,
            price,
            id,
        ]);
        const updatedItemData = updatedItem.rows[0];
        res.status(200).send({
            message: 'Item updated successfully',
            item: updatedItemData,
        });
    }
    catch (error) {
        res.status(500).send({ error: error.message });
    }
}));
controller.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const hasAssociatedActions = yield db_1.default.query('SELECT EXISTS (SELECT 1 FROM actions WHERE item_id = $1)', [id]);
        if (hasAssociatedActions.rows[0].exists) {
            return res.status(400).send({
                error: 'Item cannot be deleted as it has associated actions',
            });
        }
        const deletedItem = yield db_1.default.query('DELETE FROM items WHERE id = $1 RETURNING *', [id]);
        if (deletedItem.rows.length === 0) {
            return res.status(404).send({ error: 'Item not found' });
        }
        res.status(200).send({
            message: 'Item deleted successfully',
        });
    }
    catch (error) {
        res.status(500).send({ error: error.message });
    }
}));
exports.default = controller;
