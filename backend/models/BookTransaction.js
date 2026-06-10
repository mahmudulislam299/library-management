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
    finePaid: {
        type: Boolean,
        default: false
    },
    fineAmountDue: {
        type: Number,
        default: 0
    },
    fineAmountPaid: {
        type: Number,
        default: 0
    },
    fineTotalAccrued: {
        type: Number,
        default: 0
    },
    fineDaysLate: {
        type: Number,
        default: 0
    },
    fineRatePerDay: {
        type: Number,
        default: 10
    },
    fineLastCalculatedAt: {
        type: Date
    },
    finePaymentMethod: {
        type: String,
        enum: ["bKash", "Mobile Banking", "Regular Banking", ""],
        default: ""
    },
    finePaymentReference: {
        type: String,
        default: ""
    },
    finePaidAt: {
        type: Date
    },
    finePayments: [
        {
            amount: {
                type: Number,
                required: true
            },
            method: {
                type: String,
                enum: ["bKash", "Mobile Banking", "Regular Banking"],
                required: true
            },
            reference: {
                type: String,
                default: ""
            },
            paidAt: {
                type: Date,
                default: Date.now
            },
            recordedBy: {
                type: String,
                default: ""
            },
            recordedByRole: {
                type: String,
                enum: ["Member", "Admin"],
                default: "Member"
            }
        }
    ],
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
