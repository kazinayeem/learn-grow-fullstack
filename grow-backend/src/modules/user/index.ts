export { default as userRoutes } from "./routes/user.routes.js";
export * as userController from "./controller/user.controller.js";
export * as userService from "./service/user.service.js";
export { User } from "./model/user.model.js";
import { createUserSchema } from "./schema/user.schema.js";
export { createUserSchema };
