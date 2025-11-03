import React from "react";
import "./ReservedBooks.css";

function ReservedBooks() {
  const reservations = [
    { name: "Anika", book: "Introduction to ALGORITHMS", date: "12/7/2025" },
    { name: "Diya", book: "Operating System Concepts", date: "10/7/2025" },
    { name: "Aisharjaa", book: "Computer Networks", date: "15/9/2025" },
    { name: "Daliya", book: "Teach Yourself C++", date: "02/9/2025" },
    { name: "Nadia", book: "Artificial Intelligence", date: "21/7/2025" },
    { name: "Farhana", book: "Clean Code", date: "02/7/2025" },
  ];

  return (
    <section className="reservedbooks-container">
      <h2 className="reservedbooks-title">Books On Hold</h2>
      <div className="table-wrapper">
        <table className="reservedbooks-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Book</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((item, index) => (
              <tr key={index} className="table-row">
                <td>{item.name}</td>
                <td>{item.book}</td>
                <td>{item.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default ReservedBooks;