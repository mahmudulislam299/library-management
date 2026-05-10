import mongoose from "mongoose"

const BookTransactionSchema = new mongoose.Schema({
    bookId: {
        type: String,
        required: true
    },
    borrowerId: { //EmployeeId or AdmissionId
        type: String,
        required: true
    },
    bookName: {
        type: String,
        required: true
    },
    borrowerName: {
        type: String,
        required: true
    },
    transactionType: { //Issue or Reservation
        type: String,
        required: true,
    },
    fromDate: {
        type: String,
        required: true,
    },
    toDate: {
        type: String,
        required: true,
    },
    returnDate: {
        type: String
    },
    transactionStatus: {
        type: String,
        default: "Active"
    }
},
    {
        timestamps: true
    }
);

export default mongoose.model("BookTransaction", BookTransactionSchema)
