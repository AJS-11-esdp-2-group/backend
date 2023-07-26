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
const recipe_models_1 = __importDefault(require("@src/models/recipe.models"));
const validateRequest_1 = __importDefault(require("@src/middlewares/validateRequest"));
const controller = express_1.default.Router();
controller.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const recipe = yield db_1.default.query(`
      SELECT 
        c.id,
        b.bouquet_name,
        i.item_name,
        i.image_large,
        c.qty
      FROM
        recipes c
        JOIN bouquets b ON b.id = c.id_bouquet
        JOIN items i ON i.id = c.id_item`);
        res.status(200).send(recipe.rows);
    }
    catch (error) {
        res.status(500).send({ error: error.message });
    }
}));
controller.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const recipe = yield db_1.default.query(`
        SELECT 
          c.id,
          c.id_bouquet,
          i.item_name,
          i.image_large,
          c.qty
        FROM
          recipes c
          JOIN items i ON i.id = c.id_item
        WHERE c.id_bouquet = $1;
      `, [id]);
        res.status(200).send(recipe.rows);
    }
    catch (error) {
        res.status(500).send({ error: error.message });
    }
}));
controller.post('/', (0, validateRequest_1.default)(recipe_models_1.default), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id_bouquet, id_item, qty } = req.body;
        const newRecipe = yield db_1.default.query(`
        INSERT INTO recipes (id_bouquet, id_item, qty)
        VALUES ($1, $2, $3)
        RETURNING *
      `, [id_bouquet, id_item, qty]);
        const recipe = yield db_1.default.query(`
          SELECT 
          c.id,
          c.id_bouquet,
          i.item_name,
          i.image_large,
          c.qty
        FROM
        recipes c
          JOIN items i ON i.id = c.id_item
        WHERE c.id = $1;
      `, [(newRecipe.rows[0]).id]);
        res.status(200).send(recipe.rows);
    }
    catch (error) {
        res.status(500).send({ error: error.message });
    }
}));
controller.put('/:id', (0, validateRequest_1.default)(recipe_models_1.default), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { id_bouquet, id_item, qty } = req.body;
        const recipe = yield db_1.default.query(`
        SELECT * FROM recipes WHERE id = $1
      `, [id]);
        if (recipe.rows.length === 0)
            res.status(401).send({ error: 'Recipe not found' });
        const updatedRecipe = yield db_1.default.query(`
        UPDATE recipes
        SET id_bouquet = $1, id_item = $2, qty = $3
        WHERE id = $4
        RETURNING *;
      `, [id_bouquet, id_item, qty, id]);
        const newRecipe = yield db_1.default.query(`
          SELECT 
          c.id,
          c.id_bouquet,
          i.item_name,
          i.image_large,
          c.qty
        FROM
        recipes c
          JOIN items i ON i.id = c.id_item
        WHERE c.id = $1;
      `, [(updatedRecipe.rows[0]).id]);
        res.status(200).send(newRecipe.rows);
    }
    catch (error) {
        res.status(500).send({ error: error.message });
    }
}));
controller.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const recipe = yield db_1.default.query(`
        SELECT * FROM recipes WHERE id = $1
      `, [id]);
        if (recipe.rows.length === 0)
            res.status(401).send({ error: 'Recipe not found' });
        const deletedRecipe = yield db_1.default.query(`
        DELETE FROM recipes
        WHERE id = $1
        RETURNING *;
      `, [id]);
        res.status(200).send(deletedRecipe.rows[0]);
    }
    catch (error) {
        res.status(500).send({ error: error.message });
    }
}));
exports.default = controller;
