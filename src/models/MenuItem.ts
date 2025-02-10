import mongoose from "mongoose";

const MenuItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MenuItem",
    default: null,
  },
  priority: { type: Number, required: true },
});

const MenuItem = mongoose.model("MenuItem", MenuItemSchema);

export default MenuItem;
