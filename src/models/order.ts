import mongoose from "mongoose";

const orderSchema: any = new mongoose.Schema(
  {
    userId: { type: mongoose.Types.ObjectId, ref: "user", default: null },
    orderId: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const orderModel = mongoose.model<any>("order", orderSchema);
