import express from "express";
import bodyParser from "body-parser";
import * as UserController from "../controllers/UserController";
import * as MenuController from "../controllers/MenuController";
import authMiddleware from "../middlewares/AuthMiddleware";
import adminMiddleware from "../middlewares/isAuthorizedMiddleware";

const apiRouter = express.Router();
apiRouter.use(bodyParser.json());

apiRouter.post("/login", UserController.userLogin);
apiRouter.post("/register", authMiddleware,adminMiddleware, UserController.userRegister);
apiRouter.delete("/delete/:id",authMiddleware,adminMiddleware, UserController.userDelete);
apiRouter.get("/menu", authMiddleware,MenuController.getMenuForUser);
apiRouter.post("/menu/add",authMiddleware,adminMiddleware,MenuController.addMenuItem);

export default apiRouter;
