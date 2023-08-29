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
const db_1 = __importDefault(require("../db/db"));
const category_models_1 = __importDefault(require("../models/category.models"));
const validateRequest_1 = __importDefault(require("../middlewares/validateRequest"));
const controller = express_1.default.Router();
controller.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const category = yield db_1.default.query(`select * from items_categories order by id`);
        res.status(200).send(category.rows);
    }
    catch (error) {
        res.status(500).send({ error: error.message });
    }
}));
controller.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categoryId = req.params.id;
        const category = yield db_1.default.query(`SELECT * FROM items_categories WHERE id = $1`, [categoryId]);
        if (category.rows.length === 0) {
            return res.status(404).send({ error: "Category not found" });
        }
        res.status(200).send(category.rows[0]);
    }
    catch (error) {
        res.status(500).send({ error: error.message });
    }
}));
controller.post("/", (0, validateRequest_1.default)(category_models_1.default), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.get("Authorization");
        const user_id = yield db_1.default.query("SELECT id FROM users WHERE token = $1", [
            token
        ]);
        if (!user_id.rows.length) {
            return res.status(400).send({ message: "User not found" });
        }
        const { category_name, category_description } = req.body;
        const category = yield db_1.default.query("select*from items_categories where category_name = $1", [category_name]);
        if (category.rows.length) {
            return res
                .status(400)
                .send({ message: "Category is already in the database" });
        }
        const newCategory = yield db_1.default.query(`
      INSERT INTO items_categories (category_name, category_description)
      VALUES ($1, $2)
      RETURNING *
    `, [category_name, category_description]);
        res.status(200).send(newCategory.rows[0]);
    }
    catch (error) {
        res.status(500).send({ error: error.message });
    }
}));
controller.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const id_category = yield db_1.default.query(`
        select*from items_subcategories where id_category = $1`, [id]);
        if (id_category.rows.length) {
            return res
                .status(400)
                .send({ message: "Category has associated categories" });
        }
        const deletedCategory = yield db_1.default.query(`
        DELETE FROM items_categories
        WHERE id = $1
        RETURNING *
      `, [id]);
        if (deletedCategory.rows.length === 0) {
            return res.status(404).send("Category is not found");
        }
        res.status(200).send("Category is successfully deleted");
    }
    catch (error) {
        res.status(500).send({ error: error.message });
    }
}));
controller.put("/:id", (0, validateRequest_1.default)(category_models_1.default), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const token = req.get("Authorization");
        const { category_name, category_description } = req.body;
        const user_id = yield db_1.default.query("SELECT id FROM users WHERE token = $1", [
            token
        ]);
        if (!user_id.rows.length) {
            return res.status(400).send({ message: "User not found" });
        }
        const id_category = yield db_1.default.query("select*from items_categories where id = $1", [id]);
        if (!id_category.rows.length) {
            return res.status(400).send({ error: "Category not found" });
        }
        const updateCategory = yield db_1.default.query(`UPDATE items_categories SET
              category_name=$1, 
              category_description = $2
              WHERE id = $3
              RETURNING *`, [category_name, category_description, id]);
        res.status(200).send(updateCategory.rows);
    }
    catch (error) {
        res.status(500).send({ error: error.message });
    }
}));
exports.default = controller;
