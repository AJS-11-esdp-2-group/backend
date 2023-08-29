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
const itemsUnderSubcategories_models_1 = __importDefault(require("../models/itemsUnderSubcategories.models"));
const validateRequest_1 = __importDefault(require("../middlewares/validateRequest"));
const controller = express_1.default.Router();
controller.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id_subcategory = req.query.id_subcategory;
        if (id_subcategory) {
            const subcategory = yield db_1.default.query(`select
        ius.id,
        ius.under_subcategory_name,
        ius.under_subcategory_description,
        its.subcategory_name,
        ic.category_name
        from items_under_subcategories ius
        inner join items_subcategories its on its.id = ius.id_subcategories
        inner join items_categories ic on ic.id = its.id_category
        WHERE ius.id_subcategories = $1`, [id_subcategory]);
            res.status(200).send(subcategory.rows);
        }
        else {
            const subcategory = yield db_1.default.query(`
        select
        ius.id,
        ius.under_subcategory_name,
        ius.under_subcategory_description,
        its.subcategory_name,
        ic.category_name
        from items_under_subcategories ius
        inner join items_subcategories its on its.id = ius.id_subcategories
        inner join items_categories ic on ic.id = its.id_category
        order by ius.id`);
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
        const subcategory = yield db_1.default.query(`select
      ius.id,
      ius.under_subcategory_name,
      ius.under_subcategory_description,
      its.subcategory_name,
      ic.category_name
      from items_under_subcategories ius
      inner join items_subcategories its on its.id = ius.id_subcategories
      inner join items_categories ic on ic.id = its.id_category
      WHERE ius.id_subcategories = $1`, [subcategoryId]);
        if (subcategory.rows.length === 0) {
            return res.status(404).send({ error: "Subcategory not found" });
        }
        res.status(200).send(subcategory.rows);
    }
    catch (error) {
        res.status(500).send({ error: error.message });
    }
}));
controller.post("/", (0, validateRequest_1.default)(itemsUnderSubcategories_models_1.default), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.get("Authorization");
        const user_id = yield db_1.default.query("SELECT id FROM users WHERE token = $1", [
            token
        ]);
        if (!user_id.rows.length) {
            return res.status(400).send({ message: "User not found" });
        }
        const { under_subcategory_name, under_subcategory_description, id_subcategories } = req.body;
        const subcategory = yield db_1.default.query("select*from items_subcategories WHERE id = $1", [id_subcategories]);
        if (!subcategory.rows.length) {
            return res
                .status(400)
                .send({ message: "Subcategories are not in the database" });
        }
        const newSubcategory = yield db_1.default.query(`
      INSERT INTO items_under_subcategories (under_subcategory_name, under_subcategory_description, id_subcategories)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [
            under_subcategory_name,
            under_subcategory_description,
            id_subcategories
        ]);
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
        const deletedSubcategory = yield db_1.default.query(`
        DELETE FROM items_under_subcategories
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
controller.put("/:id", (0, validateRequest_1.default)(itemsUnderSubcategories_models_1.default), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const token = req.get("Authorization");
        const { under_subcategory_name, under_subcategory_description, id_subcategories } = req.body;
        const user_id = yield db_1.default.query("SELECT id FROM users WHERE token = $1", [
            token
        ]);
        if (!user_id.rows.length) {
            return res.status(400).send({ message: "User not found" });
        }
        const sub_category = yield db_1.default.query("select*from items_subcategories where id = $1", [id_subcategories]);
        if (!sub_category.rows.length) {
            return res.status(400).send({ error: "SubCategory not found" });
        }
        const updateUnderCategory = yield db_1.default.query(`UPDATE items_under_subcategories SET
        under_subcategory_name=$1,
        under_subcategory_description = $2,
        id_subcategories=$3
              WHERE id = $4
              RETURNING *`, [
            under_subcategory_name,
            under_subcategory_description,
            id_subcategories,
            id
        ]);
        if (updateUnderCategory.rows.length === 0) {
            return res.status(404).send("UnderSubcategory is not found");
        }
        res.status(200).send(updateUnderCategory.rows);
    }
    catch (error) {
        res.status(500).send({ error: error.message });
    }
}));
exports.default = controller;
