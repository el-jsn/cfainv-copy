import express from "express";
import {
  bulkCreateOrUpdateSales,
  getAllSales,
  updateSalesByDay,
} from "../controllers/projectedSales.controller.js";

const router = express.Router();

// Bulk Create or Update Sales
router.post("/bulk", bulkCreateOrUpdateSales);

// Get All Sales
router.get("/", getAllSales);

// Update Sales by Day
router.put("/:day", updateSalesByDay);

export default router;
