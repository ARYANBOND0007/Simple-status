import { Router } from "express";
import { login }  from "../controllers/login.controller.js";
import { getMe }  from "../controllers/getMe.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
const router = Router();

router.post("/login", login);
router.get("/me", authenticate, getMe);

export default router;