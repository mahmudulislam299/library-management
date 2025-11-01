import React from 'react'
import './ReservedBooks.css'

function ReservedBooks() {
    return (
        <div className='reservedbooks-container'>
            <h className='reservedbooks-title'>Books On Hold</h>
            <table className='reservedbooks-table'>
                <tr>
                    <th>Name</th>
                    <th>Book</th>
                    <th>Date</th>
                </tr>
                <tr>
                    <td>Anika</td>
                    <td>Data Sturcture</td>
                    <td>12/7/2025</td>
                </tr>
                <tr>
                    <td>Diya</td>
                    <td>Operating Systems</td>
                    <td>10/7/2025</td>
                </tr>
                <tr>
                    <td>Aisharjaa</td>
                    <td>Computer Networks</td>
                    <td>15/9/2025</td>
                </tr>
                <tr>
                    <td>Daliya</td>
                    <td>Database Management</td>
                    <td>02/9/2025</td>
                </tr>
                <tr>
                    <td>Nadia</td>
                    <td>Artificial Intelligence</td>
                    <td>21/7/2025</td>
                </tr>
                <tr>
                    <td>Farhana</td>
                    <td>Machine learning</td>
                    <td>02/7/2025</td>
                </tr>
            </table>
        </div>
    )
}

export default ReservedBooks
