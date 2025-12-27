export { default as userRoutes } from "./routes/user.routes";
export * as userController from "./controller/user.controller";
export * as userService from "./service/user.service";
export { User } from "./model/user.model";
import { createUserSchema } from "./schema/user.schema";
export { createUserSchema };
