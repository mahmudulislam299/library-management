import React, { useEffect, useState } from "react";
import "../AdminDashboard.css";
import axios from "axios";
import { Dropdown } from "semantic-ui-react";
import "../../MemberDashboard/MemberDashboard.css";
import moment from "moment";

function GetMember() {
  const API_URL = process.env.REACT_APP_API_URL;

  const [allMembersOptions, setAllMembersOptions] = useState([]);
  const [memberId, setMemberId] = useState("");    // this is actually user._id from DB
  const [memberDetails, setMemberDetails] = useState(null);

  // Helper to safely format dates
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return moment(dateStr, ["DD-MM-YYYY", "MM/DD/YYYY", moment.ISO_8601]).format(
      "DD-MM-YYYY"
    );
  };

  // Fetch all members for the dropdown
  useEffect(() => {
    const getMembers = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/users/allmembers`);
        const options = response.data.map((member) => ({
          value: member?._id, // used later to fetch details
          text:
            member?.userType === "Student"
              ? `${member?.userFullName} [Admission ID: ${member?.memberId}]`
              : `${member?.userFullName} [Employee ID: ${member?.memberId}]`,
        }));
        setAllMembersOptions(options);
      } catch (err) {
        console.log("Error fetching members", err);
      }
    };
    getMembers();
  }, [API_URL]);

  // Fetch specific member details when selection changes
  useEffect(() => {
    const getMemberDetails = async () => {
      if (!memberId) return;

      try {
        const response = await axios.get(
          `${API_URL}/api/users/getuser/${memberId}`
        );
        setMemberDetails(response.data);
      } catch (err) {
        console.log("Error in fetching the member details", err);
      }
    };
    getMemberDetails();
  }, [API_URL, memberId]);

  return (
    <div>
      <div className="semanticdropdown getmember-dropdown">
        <Dropdown
          placeholder="Select Member"
          fluid
          search
          selection
          value={memberId}
          options={allMembersOptions}
          onChange={(event, data) => setMemberId(data.value)}
        />
      </div>

      {/* Only show details when a member is selected */}
      <div style={!memberId ? { display: "none" } : {}}>
        {/* Profile Block */}
        <div
          className="member-profile-content"
          id="profile@member"
          style={!memberId ? { display: "none" } : {}}
        >
          <div className="user-details-topbar">
            <img
              className="user-profileimage"
              src="./assets/images/Profile.png"
              alt=""
            />
            <div className="user-info">
              <p className="user-name">{memberDetails?.userFullName}</p>
              <p className="user-id">
                {memberDetails
                  ? `${
                      memberDetails.userType === "Student"
                        ? "Admission ID: "
                        : "Employee ID: "
                    }${memberDetails.memberId}`
                  : ""}
              </p>
              <p className="user-email">{memberDetails?.email}</p>
              <p className="user-phone">{memberDetails?.mobileNumber}</p>
            </div>
          </div>

          <div className="user-details-specific">
            <div className="specific-left">
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <p
                  style={{
                    display: "flex",
                    flex: "0.5",
                    flexDirection: "column",
                  }}
                >
                  <span style={{ fontSize: "18px" }}>
                    <b>Gender</b>
                  </span>
                  <span style={{ fontSize: "16px" }}>
                    {memberDetails?.gender}
                  </span>
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "30px",
                }}
              >
                <p
                  style={{
                    display: "flex",
                    flex: "0.5",
                    flexDirection: "column",
                  }}
                >
                  <span style={{ fontSize: "18px" }}>
                    <b>Address</b>
                  </span>
                  <span style={{ fontSize: "16px" }}>
                    {memberDetails?.address}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Issued Books */}
        <div
          className="member-activebooks-content"
          id="activebooks@member"
        >
          <p
            style={{
              fontWeight: "bold",
              fontSize: "22px",
              marginTop: "22px",
              marginBottom: "22px",
            }}
          >
            Issued
          </p>
          <table className="activebooks-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Book-Name</th>
                <th>From Date</th>
                <th>To Date</th>
                <th>Fine</th>
              </tr>
            </thead>
            <tbody>
              {memberDetails?.activeTransactions
                ?.filter((data) => data.transactionType === "Issued")
                .map((data, index) => {
                  const toMoment = moment(
                    data.toDate,
                    ["DD-MM-YYYY", "MM/DD/YYYY", moment.ISO_8601]
                  ).startOf("day");
                  const today = moment().startOf("day");
                  const daysLate = today.diff(toMoment, "days");
                  const fine = daysLate > 0 ? daysLate * 10 : 0;

                  return (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{data.bookName}</td>
                      <td>{formatDate(data.fromDate)}</td>
                      <td>{formatDate(data.toDate)}</td>
                      <td>{fine}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* Reserved Books */}
        <div
          className="member-reservedbooks-content"
          id="reservedbooks@member"
        >
          <p
            style={{
              fontWeight: "bold",
              fontSize: "22px",
              marginTop: "22px",
              marginBottom: "22px",
            }}
          >
            Reserved
          </p>
          <table className="activebooks-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Book-Name</th>
                <th>From</th>
                <th>To</th>
              </tr>
            </thead>
            <tbody>
              {memberDetails?.activeTransactions
                ?.filter((data) => data.transactionType === "Reserved")
                .map((data, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{data.bookName}</td>
                    <td>{formatDate(data.fromDate)}</td>
                    <td>{formatDate(data.toDate)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* History */}
        <div className="member-history-content" id="history@member">
          <p
            style={{
              fontWeight: "bold",
              fontSize: "22px",
              marginTop: "22px",
              marginBottom: "22px",
            }}
          >
            History
          </p>
          <table className="activebooks-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Book-Name</th>
                <th>From</th>
                <th>To</th>
                <th>Return Date</th>
              </tr>
            </thead>
            <tbody>
              {memberDetails?.prevTransactions?.map((data, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{data.bookName}</td>
                  <td>{formatDate(data.fromDate)}</td>
                  <td>{formatDate(data.toDate)}</td>
                  <td>{formatDate(data.returnDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default GetMember;
