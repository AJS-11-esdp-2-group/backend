import cors from "cors";
import express from "express";
import logger from "jet-logger";
import itemController from "./controllers/items.controller";
import suppliersController from "./controllers/suppliers.controller";
import usersController from "./controllers/users.controller";
import actionsController from "./controllers/actions.controller";
import suppliersStoragesController from './controllers/suppliersStorages.controller'
import storagesController from './controllers/storages.controller'
import itemsCategoryController from "./controllers/ItemsCategory.controller";
import itemsSubcategoryController from "./controllers/ItemsSubcategory.controller";
import locationController from "./controllers/location.controller";
import bouquetController from "./controllers/bouquets.controller";
import itemsUnderCategoryController from "./controllers/itemsUnderSubcategories.controllers"
import recipesController from "./controllers/recipes.controller";
import bouquetsImageController from "./controllers/bouquetsImage.controller";
import itemsPricesControllers from './controllers/itemsPrices.controller';
import saleControllers from './controllers/sale.controller'

const run = async () => {
  app.listen(PORT, () => {
    logger.info(`Server is running on http://localhost:${PORT}`);
  });
};

const app = express();
const PORT = 8000;

app.use(express.json());
app.use(express.static("public"));
app.use(cors());

app.use("/items", itemController);
app.use("/suppliers", suppliersController);
app.use("/users", usersController);
app.use("/supply", actionsController);
app.use("/suppliers_controllers", suppliersStoragesController);
app.use("/storages", storagesController);
app.use("/items_category", itemsCategoryController);
app.use("/items_subcategory", itemsSubcategoryController);
app.use("/items_under_subcategory", itemsUnderCategoryController);
app.use("/location", locationController);
app.use("/bouquets", bouquetController);
app.use("/recipes", recipesController);
app.use("/bouquets_images", bouquetsImageController);
app.use("/items_prices", itemsPricesControllers);
app.use("/sales", saleControllers);

run().catch(logger.err);