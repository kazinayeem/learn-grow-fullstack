import express from "express";
import * as controller from "../controller/status.controller";

const router = express.Router();

router.get("/", controller.status);

export default router;
