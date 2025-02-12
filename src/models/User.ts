import mongoose, { Schema, Document } from "mongoose";

export interface IAccessibleMenu {
  menuId: mongoose.Types.ObjectId;
  expiryDate?: Date;
}
export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: "admin" | "user";
  accessibleMenus: { menuId: string; expiryDate?: Date }[]; 
}


const UserSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "user"], required: true },
  accessibleMenus: [
    {
      menuId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MenuItem",
        required: true,
      },
      expiryDate: { type: Date, default: null },
    },
  ],
});

export default mongoose.model<IUser>("User", UserSchema);
