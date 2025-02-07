import mongoose from "mongoose";

interface IMenuItem extends mongoose.Document {
  title: string;
  parent?: mongoose.Types.ObjectId | null;
  priority: number;
}

const MenuItemSchema = new mongoose.Schema<IMenuItem>({
  title: { type: String, required: true },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MenuItem",
    default: null,
  },
  priority: { type: Number, required: true },
});

const MenuItem = mongoose.model<IMenuItem>("MenuItem", MenuItemSchema);

export default MenuItem;
