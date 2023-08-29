"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const items_controller_1 = __importDefault(require("./controllers/items.controller"));
const suppliers_controller_1 = __importDefault(require("./controllers/suppliers.controller"));
const users_controller_1 = __importDefault(require("./controllers/users.controller"));
const actions_controller_1 = __importDefault(require("./controllers/actions.controller"));
const suppliersStorages_controller_1 = __importDefault(require("./controllers/suppliersStorages.controller"));
const storages_controller_1 = __importDefault(require("./controllers/storages.controller"));
const ItemsCategory_controller_1 = __importDefault(require("./controllers/ItemsCategory.controller"));
const ItemsSubcategory_controller_1 = __importDefault(require("./controllers/ItemsSubcategory.controller"));
const location_controller_1 = __importDefault(require("./controllers/location.controller"));
const bouquets_controller_1 = __importDefault(require("./controllers/bouquets.controller"));
const itemsUnderSubcategories_controllers_1 = __importDefault(require("./controllers/itemsUnderSubcategories.controllers"));
const recipes_controller_1 = __importDefault(require("./controllers/recipes.controller"));
const bouquetsImage_controller_1 = __importDefault(require("./controllers/bouquetsImage.controller"));
const itemsPrices_controller_1 = __importDefault(require("./controllers/itemsPrices.controller"));
const sale_controller_1 = __importDefault(require("./controllers/sale.controller"));
const app = (0, express_1.default)();
const port = process.env.PORT || 8080;
app.use(express_1.default.json());
app.use(express_1.default.static("public"));
app.get('/', (_req, res) => {
    return res.send('Express Typescript on Vercel 8');
});
app.get('/ping', (_req, res) => {
    return res.send('pong 🏓');
});
app.use("/items", items_controller_1.default);
app.use("/suppliers", suppliers_controller_1.default);
app.use("/users", users_controller_1.default);
app.use("/supply", actions_controller_1.default);
app.use("/suppliers_controllers", suppliersStorages_controller_1.default);
app.use("/storages", storages_controller_1.default);
app.use("/items_category", ItemsCategory_controller_1.default);
app.use("/items_subcategory", ItemsSubcategory_controller_1.default);
app.use("/items_under_subcategory", itemsUnderSubcategories_controllers_1.default);
app.use("/location", location_controller_1.default);
app.use("/bouquets", bouquets_controller_1.default);
app.use("/recipes", recipes_controller_1.default);
app.use("/bouquets_images", bouquetsImage_controller_1.default);
app.use("/items_prices", itemsPrices_controller_1.default);
app.use("/sales", sale_controller_1.default);
app.listen(port, () => {
    return console.log(`Server is listening on ${port}`);
});
