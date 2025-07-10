const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true },
    name: { type: String, required: true },
    email: {
      type: String,
      required: [true, "L'email est requis"],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "L'email n'est pas valide"],
    },
    age: { type: Number },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
