export type FirestoreTimestamp = {
  _seconds: number;
  _nanoseconds: number;
};

function firestoreTimestampToDate(timestamp: FirestoreTimestamp): Date {
  return new Date(timestamp._seconds * 1000 + timestamp._nanoseconds / 1000000);
}

function stringToSimpleDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export { firestoreTimestampToDate, stringToSimpleDate };
