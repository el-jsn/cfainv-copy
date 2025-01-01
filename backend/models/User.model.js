import mongoose from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  pin: { type: String, required: true }, // Store hashed PIN
  isAdmin: { type: Boolean, default: false }
});



export default mongoose.model("User", UserSchema);
