const DEFAULT_FINE_PER_DAY = 10;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const startOfDay = (date) => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

const parseLibraryDate = (value) => {
  if (!value) return null;

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  const ddmmyyyy = trimmed.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (ddmmyyyy) {
    const [, day, month, year] = ddmmyyyy;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const calculateFineSnapshot = (transaction) => {
  if (!transaction || transaction.transactionType !== "Issued") {
    return {
      fineAmountDue: 0,
      fineTotalAccrued: 0,
      fineDaysLate: 0,
      fineRatePerDay: DEFAULT_FINE_PER_DAY,
      finePaid: false,
    };
  }

  const dueDate = parseLibraryDate(transaction.toDate);
  if (!dueDate) {
    return {
      fineAmountDue: 0,
      fineTotalAccrued: 0,
      fineDaysLate: 0,
      fineRatePerDay: transaction.fineRatePerDay || DEFAULT_FINE_PER_DAY,
      finePaid: false,
    };
  }

  const endDate =
    transaction.transactionStatus === "Completed" && transaction.returnDate
      ? parseLibraryDate(transaction.returnDate)
      : new Date();
  const daysLate = Math.max(
    0,
    Math.floor((startOfDay(endDate || new Date()) - startOfDay(dueDate)) / MS_PER_DAY)
  );
  const fineRatePerDay = transaction.fineRatePerDay || DEFAULT_FINE_PER_DAY;
  const fineTotalAccrued = daysLate * fineRatePerDay;
  const fineAmountPaid = transaction.fineAmountPaid || 0;
  const fineAmountDue = Math.max(0, fineTotalAccrued - fineAmountPaid);

  return {
    fineAmountDue,
    fineTotalAccrued,
    fineDaysLate: daysLate,
    fineRatePerDay,
    finePaid: fineTotalAccrued > 0 && fineAmountDue === 0,
  };
};

export const syncTransactionFine = async (transaction) => {
  if (!transaction) return transaction;

  const snapshot = calculateFineSnapshot(transaction);
  const needsSave =
    transaction.fineAmountDue !== snapshot.fineAmountDue ||
    transaction.fineTotalAccrued !== snapshot.fineTotalAccrued ||
    transaction.fineDaysLate !== snapshot.fineDaysLate ||
    transaction.fineRatePerDay !== snapshot.fineRatePerDay ||
    transaction.finePaid !== snapshot.finePaid;

  transaction.fineAmountDue = snapshot.fineAmountDue;
  transaction.fineTotalAccrued = snapshot.fineTotalAccrued;
  transaction.fineDaysLate = snapshot.fineDaysLate;
  transaction.fineRatePerDay = snapshot.fineRatePerDay;
  transaction.finePaid = snapshot.finePaid;
  transaction.fineLastCalculatedAt = new Date();

  if (needsSave) {
    await transaction.save();
  }

  return transaction;
};

export const syncTransactionFines = async (transactions = []) => {
  await Promise.all(
    transactions
      .filter(Boolean)
      .filter((transaction) => typeof transaction.save === "function")
      .map((transaction) => syncTransactionFine(transaction))
  );

  return transactions;
};
