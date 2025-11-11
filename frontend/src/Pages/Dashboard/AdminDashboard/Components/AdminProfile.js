import React, { useContext, useEffect, useState } from "react";
import "../AdminDashboard.css";
import "../../MemberDashboard/MemberDashboard.css";
import axios from "axios";
import moment from "moment";
import { AuthContext } from "../../../../Context/AuthContext";

function AdminProfile() {
  const API_URL = process.env.REACT_APP_API_URL;
  const { user } = useContext(AuthContext);
  const [adminDetails, setAdminDetails] = useState(null);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return moment(dateStr, ["DD-MM-YYYY", "MM/DD/YYYY", moment.ISO_8601]).format(
      "DD-MM-YYYY"
    );
  };

  useEffect(() => {
    const getAdminDetails = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/users/getuser/${user._id}`
        );
        setAdminDetails(res.data);
      } catch (err) {
        console.log("Error fetching admin details", err);
      }
    };
    if (user?._id) getAdminDetails();
  }, [API_URL, user]);

  return (
    <div className="member-profile-content">
      <div className="user-details-topbar">
        <img
          className="user-profileimage"
          src="./assets/images/Profile.png"
          alt="Profile"
        />
        <div className="user-info">
          <div className="user-name-row">
            <p className="user-name">
              {adminDetails?.userFullName || "Admin"}
            </p>
            {adminDetails?.isAdmin && (
              <span className="user-type-pill">Admin</span>
            )}
          </div>
          <p className="user-id">
            {adminDetails ? `Employee ID: ${adminDetails.memberId}` : ""}
          </p>
          <p className="user-email">{adminDetails?.email}</p>
          <p className="user-phone">{adminDetails?.mobileNumber}</p>
        </div>
      </div>

      <div className="profile-info-grid">
        <div className="profile-info-card">
          <p className="profile-info-label">Department</p>
          <p className="profile-info-value">
            {adminDetails?.department || "Library"}
          </p>
        </div>
        <div className="profile-info-card">
          <p className="profile-info-label">Gender</p>
          <p className="profile-info-value">
            {adminDetails?.gender || "-"}
          </p>
        </div>
        <div className="profile-info-card">
          <p className="profile-info-label">Address</p>
          <p className="profile-info-value">
            {adminDetails?.address || "-"}
          </p>
        </div>
        <div className="profile-info-card">
          <p className="profile-info-label">Member Since</p>
          <p className="profile-info-value">
            {adminDetails?.createdAt
              ? formatDate(adminDetails.createdAt)
              : "-"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminProfile;
