import express from "express";
import { AppDataSource } from "./data-source";
import bodyParser from "body-parser";
import cors from "cors";
import { errorHandler } from "./middleware/error.middleware";
import routes from "./route";
import swaggerSpec from "./config/swagger";
import swaggerUi from "swagger-ui-express";

const app = express();

app.use(bodyParser.json());
app.use(cors());

// console.log("hello");

AppDataSource.initialize()
  .then(async () => {
    console.log("Database connection established");

    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    app.use("/api", routes);
    app.use(errorHandler);
    app.listen(4000, () => {
      console.log("Server is running on port 4000 🚀");
    });
  })
  .catch((error) => console.log(error.message));
