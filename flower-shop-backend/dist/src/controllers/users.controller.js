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
const users_model_1 = __importDefault(require("@src/models/users.model"));
const validateRequest_1 = __importDefault(require("@src/middlewares/validateRequest"));
const nanoid_1 = require("nanoid");
const controller = express_1.default.Router();
controller.post("/", (0, validateRequest_1.default)(users_model_1.default), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password, email, phone, first_name, last_name, address, country, city } = req.body;
        const user = yield db_1.default.query("SELECT * FROM users WHERE username = $1", [
            username
        ]);
        const mail = yield db_1.default.query("SELECT * FROM users WHERE email = $1", [
            email
        ]);
        if (user.rows.length > 0 && mail.rows.length > 0) {
            return res.status(400).send({
                errors: {
                    username: "User allready exist!",
                    email: "E-mail allready taken"
                }
            });
        }
        if (user.rows.length > 0) {
            return res.status(400).send({ errors: "User allready exist!" });
        }
        if (mail.rows.length > 0) {
            return res.status(400).send({ errors: "E-mail allready taken" });
        }
        const date = new Date().toISOString();
        const newUser = yield db_1.default.query(`INSERT INTO users
            (username, password, email, email_verificated, phone, first_name, last_name, address, id_country, id_city, create_date)
            VALUES ($1, crypt($2, gen_salt('bf')), $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING username, email, phone, first_name, last_name, address, create_date`, [
            username,
            password,
            email,
            false,
            phone,
            first_name,
            last_name,
            address,
            country,
            city,
            date
        ]);
        res.status(200).send(newUser.rows[0]);
    }
    catch (error) {
        res.status(500).send({ error: error.message });
    }
}));
controller.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        const user = yield db_1.default.query("SELECT * FROM users WHERE username = $1", [
            username
        ]);
        if (user.rows.length === 0) {
            return res.status(401).send({ error: "Username not found!" });
        }
        const passwordMatches = yield db_1.default.query("SELECT crypt($1, $2) = $2 AS password_matches", [password, user.rows[0].password]);
        if (!passwordMatches.rows[0].password_matches) {
            return res.status(400).send({ errors: "Wrong password" });
        }
        const token = (0, nanoid_1.nanoid)();
        const userSetToken = yield db_1.default.query(`UPDATE users SET 
                    token = $1
                    WHERE username = $2
                    RETURNING *`, [token, username]);
        const authorizedUser = yield db_1.default.query(`select
            u.id,
            u.username,
            u.token,
            r.role,
            u.email,
            u.email_verificated,
            u.phone,
            u.avatar,
            u.first_name,
            u.last_name,
            u.address,
            coun.name_country as country,
            cty.name_city as city,
            u.create_date,
            u.last_update_date
            from users u
            left join user_roles r on r.id = u.id_role
            left join countries coun on coun.id = u.id_country
            left join cities cty on cty.id = u.id_city
            where u.username = $1`, [username]);
        res.status(200).send(authorizedUser.rows[0]);
    }
    catch (error) {
        res.status(500).send({ error: error.message });
    }
}));
controller.delete("/logout", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.headers.authorization;
        if (!token) {
            return res.status(401).send({ error: "Unauthorized" });
        }
        const user = yield db_1.default.query(`SELECT * from users WHERE token = $1`, [
            token
        ]);
        if (user.rowCount === 0) {
            return res.status(200).send({ message: "Logout successfull!" });
        }
        const dropToken = null;
        const resetToken = yield db_1.default.query(`UPDATE users SET 
                    token = $1
                    WHERE token = $2
                    RETURNING *`, [dropToken, token]);
        res.status(200).send({ message: "Logout successful" });
    }
    catch (error) {
        res.status(500).send({ error: error.message });
    }
}));
exports.default = controller;
