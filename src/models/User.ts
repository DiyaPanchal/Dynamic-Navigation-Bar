import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: "admin" | "user";
  accessibleMenus: string[];
}

const UserSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, 
  role: { type: String, enum: ["admin", "user"], required: true },
  accessibleMenus: [{ type: mongoose.Schema.Types.ObjectId, ref: "MenuItem" }],
});

export default mongoose.model<IUser>("User", UserSchema);
