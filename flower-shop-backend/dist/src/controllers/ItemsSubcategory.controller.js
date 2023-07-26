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
const subcategory_models_1 = __importDefault(require("@src/models/subcategory.models"));
const validateRequest_1 = __importDefault(require("@src/middlewares/validateRequest"));
const controller = express_1.default.Router();
controller.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const category = req.query.id_category;
        if (category) {
            const subcategory = yield db_1.default.query(`SELECT
        sc.id,
        sc.subcategory_name,
        sc.subcategory_description,
        c.category_name
        FROM items_subcategories sc
        inner join items_categories c on c.id = sc.id_category
        WHERE sc.id_category = $1`, [category]);
            res.status(200).send(subcategory.rows);
        }
        else {
            const subcategory = yield db_1.default.query(`SELECT
          sc.id,
          sc.subcategory_name,
          sc.subcategory_description,
          c.category_name
          FROM items_subcategories sc
          inner join items_categories c on c.id = sc.id_category
          order by sc.id`);
            res.status(200).send(subcategory.rows);
        }
    }
    catch (error) {
        res.status(500).send({ error: error.message });
    }
}));
controller.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const subcategoryId = req.params.id;
        const subcategory = yield db_1.default.query(`     SELECT
            sc.id,
            sc.subcategory_name,
            sc.subcategory_description,
            c.category_name
            FROM items_subcategories sc
            inner join items_categories c on c.id = sc.id_category
            WHERE sc.id = $1`, [subcategoryId]);
        if (subcategory.rows.length === 0) {
            return res.status(404).send({ error: "Subcategory not found" });
        }
        res.status(200).send(subcategory.rows);
    }
    catch (error) {
        res.status(500).send({ error: error.message });
    }
}));
controller.post("/", (0, validateRequest_1.default)(subcategory_models_1.default), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.get("Authorization");
        const user_id = yield db_1.default.query("SELECT id FROM users WHERE token = $1", [
            token
        ]);
        if (!user_id.rows.length) {
            return res.status(400).send({ message: "User not found" });
        }
        const { subcategory_name, subcategory_description, id_category } = req.body;
        const category = yield db_1.default.query("select*from items_categories WHERE id = $1", [id_category]);
        if (!category.rows.length) {
            return res
                .status(400)
                .send({ message: "Categories are not in the database" });
        }
        const newSubcategory = yield db_1.default.query(`
      INSERT INTO items_subcategories (subcategory_name, subcategory_description, id_category)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [subcategory_name, subcategory_description, id_category]);
        res.status(200).send(newSubcategory.rows[0]);
    }
    catch (error) {
        res.status(500).send({ error: error.message });
    }
}));
controller.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const token = req.get("Authorization");
        const user_id = yield db_1.default.query("SELECT id FROM users WHERE token = $1", [
            token
        ]);
        if (!user_id.rows.length) {
            return res.status(400).send({ message: "User not found" });
        }
        const sub_category = yield db_1.default.query("select*from items_subcategories WHERE id = $1", [id]);
        if (!sub_category.rows.length) {
            return res
                .status(400)
                .send({ message: "Subcategories are not in the database" });
        }
        const dependent_subcategory = yield db_1.default.query("select*from items_under_subcategories WHERE id_subcategories = $1", [id]);
        if (dependent_subcategory.rows.length) {
            return res.status(400).send({
                message: "Subcategories have associated records in the table items_under_subcategories"
            });
        }
        const deletedSubcategory = yield db_1.default.query(`
        DELETE FROM items_subcategories
        WHERE id = $1
        RETURNING *
      `, [id]);
        if (deletedSubcategory.rows.length === 0) {
            return res.status(404).send("Subcategory is not found");
        }
        res.status(200).send("Subcategory is successfully deleted");
    }
    catch (error) {
        res.status(500).send({ error: error.message });
    }
}));
controller.put("/:id", (0, validateRequest_1.default)(subcategory_models_1.default), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const token = req.get("Authorization");
        const { subcategory_name, subcategory_description, id_category } = req.body;
        const user_id = yield db_1.default.query("SELECT id FROM users WHERE token = $1", [
            token
        ]);
        if (!user_id.rows.length) {
            return res.status(400).send({ message: "User not found" });
        }
        const sub_category = yield db_1.default.query("select*from items_categories where id = $1", [id_category]);
        if (!sub_category.rows.length) {
            return res.status(400).send({ error: "Category not found" });
        }
        const updateCategory = yield db_1.default.query(`UPDATE items_subcategories SET
        subcategory_name=$1, 
        subcategory_description = $2,
              id_category=$3
              WHERE id = $4
              RETURNING *`, [subcategory_name, subcategory_description, id_category, id]);
        if (updateCategory.rows.length === 0) {
            return res.status(404).send("Subcategory is not found");
        }
        res.status(200).send(updateCategory.rows);
    }
    catch (error) {
        res.status(500).send({ error: error.message });
    }
}));
exports.default = controller;
