import React, { useCallback, useContext, useEffect, useState } from "react";
import "../AdminDashboard.css";
import "../../MemberDashboard/MemberDashboard.css";
import axios from "axios";
import moment from "moment";
import { AuthContext } from "../../../../Context/AuthContext";

function AdminProfile() {
  const API_URL = process.env.REACT_APP_API_URL;
  const { user, dispatch } = useContext(AuthContext);
  const [adminDetails, setAdminDetails] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    userFullName: "",
    email: "",
    mobileNumber: "",
    gender: "",
    department: "",
    address: "",
    dob: "",
    age: "",
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return moment(dateStr, ["DD-MM-YYYY", "MM/DD/YYYY", moment.ISO_8601]).format(
      "DD-MM-YYYY"
    );
  };

  const getAdminDetails = useCallback(async () => {
    if (!user?._id) return;

    try {
      const res = await axios.get(`${API_URL}/api/users/getuser/${user._id}`);
      setAdminDetails(res.data);
    } catch (err) {
      console.log("Error fetching admin details", err);
    }
  }, [API_URL, user]);

  useEffect(() => {
    getAdminDetails();
  }, [getAdminDetails]);

  useEffect(() => {
    if (!adminDetails) return;

    setProfileForm({
      userFullName: adminDetails.userFullName || "",
      email: adminDetails.email || "",
      mobileNumber: adminDetails.mobileNumber || "",
      gender: adminDetails.gender || "",
      department: adminDetails.department || "",
      address: adminDetails.address || "",
      dob: adminDetails.dob || "",
      age: adminDetails.age || "",
    });
  }, [adminDetails]);

  const handleProfileInput = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const cancelProfileEdit = () => {
    if (adminDetails) {
      setProfileForm({
        userFullName: adminDetails.userFullName || "",
        email: adminDetails.email || "",
        mobileNumber: adminDetails.mobileNumber || "",
        gender: adminDetails.gender || "",
        department: adminDetails.department || "",
        address: adminDetails.address || "",
        dob: adminDetails.dob || "",
        age: adminDetails.age || "",
      });
    }
    setIsEditingProfile(false);
  };

  const saveProfile = async (e) => {
    e.preventDefault();

    if (!profileForm.userFullName || !profileForm.email || !profileForm.mobileNumber) {
      alert("Name, email, and mobile number are required.");
      return;
    }

    setIsSavingProfile(true);

    try {
      const response = await axios.put(`${API_URL}/api/users/profile/${user._id}`, {
        ...profileForm,
        age: profileForm.age === "" ? "" : Number(profileForm.age),
        userId: user._id,
      });
      setAdminDetails(response.data);
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: {
          ...user,
          userFullName: response.data.userFullName,
          email: response.data.email,
          mobileNumber: response.data.mobileNumber,
          gender: response.data.gender,
          department: response.data.department,
          address: response.data.address,
          dob: response.data.dob,
          age: response.data.age,
        },
      });
      setIsEditingProfile(false);
      alert("Profile information updated.");
    } catch (err) {
      console.log("Error updating admin profile", err);
      alert(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div className="admin-workflow-page">
      <div className="admin-page-header">
        <div>
      <p className="dashboard-option-title">Admin Account</p>
      <p className="admin-page-subtitle">Review your library staff profile and account details.</p>
        </div>
        <span className="admin-page-badge">Staff</span>
      </div>
      <div className="dashboard-title-line"></div>

      <section className="admin-panel member-profile-content">
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
          <div className="profile-edit-actions">
            <button
              className="profile-edit-button"
              type="button"
              onClick={() => setIsEditingProfile((prev) => !prev)}
            >
              {isEditingProfile ? "Hide Edit" : "Edit Basic Info"}
            </button>
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

        {isEditingProfile && (
          <form className="profile-edit-form" onSubmit={saveProfile}>
            <div className="profile-edit-field">
              <label>Full Name</label>
              <input
                type="text"
                name="userFullName"
                value={profileForm.userFullName}
                onChange={handleProfileInput}
                required
              />
            </div>
            <div className="profile-edit-field">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={profileForm.email}
                onChange={handleProfileInput}
                required
              />
            </div>
            <div className="profile-edit-field">
              <label>Mobile Number</label>
              <input
                type="text"
                name="mobileNumber"
                value={profileForm.mobileNumber}
                onChange={handleProfileInput}
                required
              />
            </div>
            <div className="profile-edit-field">
              <label>Gender</label>
              <select
                name="gender"
                value={profileForm.gender}
                onChange={handleProfileInput}
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="profile-edit-field">
              <label>Department</label>
              <input
                type="text"
                name="department"
                value={profileForm.department}
                onChange={handleProfileInput}
              />
            </div>
            <div className="profile-edit-field">
              <label>Date of Birth</label>
              <input
                type="text"
                name="dob"
                value={profileForm.dob}
                onChange={handleProfileInput}
                placeholder="DD-MM-YYYY"
              />
            </div>
            <div className="profile-edit-field">
              <label>Age</label>
              <input
                type="number"
                name="age"
                min="1"
                value={profileForm.age}
                onChange={handleProfileInput}
              />
            </div>
            <div className="profile-edit-field wide">
              <label>Address</label>
              <textarea
                name="address"
                value={profileForm.address}
                onChange={handleProfileInput}
                rows="3"
              />
            </div>
            <div className="profile-edit-submit-row">
              <button
                className="profile-edit-button secondary"
                type="button"
                onClick={cancelProfileEdit}
              >
                Cancel
              </button>
              <button className="profile-edit-button" disabled={isSavingProfile}>
                {isSavingProfile ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}

export default AdminProfile;
