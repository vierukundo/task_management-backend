import swaggerJSDoc, { Options } from "swagger-jsdoc";
import { OpenAPIV3 } from "openapi-types";

const swaggerDefinition: OpenAPIV3.Document = {
  openapi: "3.0.0",
  info: {
    title: "Task management APIs",
    version: "1.0.0",
  },
  servers: [
    {
      url: "http://localhost:4000",
      description: "Development server",
    },
    {
      url: "https://task-management-backend-wnck.onrender.com",
      description: "Development server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  paths: {},
};

const options: Options = {
  swaggerDefinition,
  apis: ["./src/documentation/*.ts"],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
