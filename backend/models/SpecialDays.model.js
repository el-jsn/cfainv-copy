const HolidayPromoSchema = new mongoose.Schema({
    date: Date,
    type: String, // "holiday" or "promo"
    description: String,
  });
  const HolidayPromoDates = mongoose.model("HolidayPromoDates", HolidayPromoSchema);