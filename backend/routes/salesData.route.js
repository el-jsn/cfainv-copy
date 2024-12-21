import express from "express";
import {
  bulkCreateOrUpdateSalesData,
  getAllSalesData,
} from "../controllers/salesData.controller.js";

const router = express.Router();

// Bulk Create or Update Sales Data
router.post("/bulk", bulkCreateOrUpdateSalesData);

// Get All Sales Data
router.get("/", getAllSalesData);

export default router;
