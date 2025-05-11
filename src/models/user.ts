import mongoose from "mongoose";
import { hash } from "bcryptjs";

const userSchema: any = new mongoose.Schema(
  {
    username: { type: String, default: null },
    email: { type: String, default: null },
    mobileNumber: { type: Number, default: null },
    password: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next: any) {
  if (!this.isModified("password")) return next();

  this.password = await hash(this.password, 10);
});

export const userModel = mongoose.model<any>("user", userSchema);
