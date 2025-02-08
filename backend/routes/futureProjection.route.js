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
router.post("/projections/future/test-weekly-update", async (req, res) => {
  try {
    await applyFutureProjections();
    res.json({ message: "Weekly update test completed" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router; 