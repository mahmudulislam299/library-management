import mongoose from "mongoose";

const BookCategorySchema = new mongoose.Schema(
  {
    categoryName: {
      type: String,
      required: true,
      unique: true,
    },
    books: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Book",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("BookCategory", BookCategorySchema);
