import express from "express";
import {
  getAllFutureProjections,
  addFutureProjection,
  deleteFutureProjection,
  applyFutureProjections
} from "../controllers/futureProjection.controller.js";
import { authenticateToken } from "../middlewares/userAuth.js";

const router = express.Router();

router.get("/projections/future", getAllFutureProjections);
router.post("/projections/future", addFutureProjection);
router.delete("/projections/future/:date", deleteFutureProjection);

export default router; 