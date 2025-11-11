import React, { useEffect, useState } from 'react';
import "../AdminDashboard.css";
import axios from "axios";
import { Dropdown } from 'semantic-ui-react';

function AddMember() {

    const API_URL = process.env.REACT_APP_API_URL;
    const [isLoading, setIsLoading] = useState(false);

    const [userFullName, setUserFullName] = useState("");
    const [memberId, setMemberId] = useState("");
    const [address, setAddress] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");
    const [recentAddedMembers, setRecentAddedMembers] = useState([]);
    const [userType, setUserType] = useState("Student"); // default
    const [gender, setGender] = useState("");
    const [department, setDepartment] = useState("");

    const genderTypes = [
        { value: "Male", text: "Male" },
        { value: "Female", text: "Female" }
    ];

    const userTypes = [
        { value: 'Student', text: 'Student' },
        { value: 'Employee', text: 'Employee' }
    ];

    // Add a Member
    const addMember = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const hasMemberId = !!memberId;

        if (
            userFullName &&
            userType &&
            hasMemberId &&
            gender &&
            department &&
            address &&
            mobileNumber &&
            email &&
            password
        ) {
            const userData = {
                userType,
                userFullName,
                memberId,
                gender,
                department,
                address,
                mobileNumber,
                email,
                password,
            };

            try {
                const response = await axios.post(
                    `${API_URL}/api/auth/register`,
                    userData
                );

                const newMember = response.data.user || response.data;

                // Keep only last 5
                setRecentAddedMembers(prev => {
                    const trimmed = prev.slice(0, 4);
                    return [newMember, ...trimmed];
                });

                // Reset form
                setUserFullName("");
                setUserType("Student");
                setMemberId("");
                setAddress("");
                setMobileNumber("");
                setEmail("");
                setPassword("");
                setGender("");
                setDepartment("");
                alert("Member Added");
            }
            catch (err) {
                console.log(err);
                alert(err.response?.data?.message || "Error adding member");
            }
        } else {
            alert("All the fields must be filled");
        }
        setIsLoading(false);
    };

    // Fetch Members
    useEffect(() => {
        const getMembers = async () => {
            try {
                const response = await axios.get(
                    `${API_URL}/api/users/allmembers`
                );
                const recentMembers = response.data.slice(0, 5);
                setRecentAddedMembers(recentMembers);
            }
            catch (err) {
                console.log(err);
            }
        };
        getMembers();
    }, [API_URL]);

    return (
        <div>
            <p className="dashboard-option-title">Add a Member</p>
            <div className="dashboard-title-line"></div>

            <form className="addmember-form" onSubmit={addMember}>
                <div className='semanticdropdown'>
                    <Dropdown
                        placeholder='User Type'
                        fluid
                        selection
                        options={userTypes}
                        value={userType}
                        onChange={(event, data) => setUserType(data.value)}
                    />
                </div>

                <label className="addmember-form-label" htmlFor="userFullName">
                    Full Name<span className="required-field">*</span>
                </label><br />
                <input
                    className="addmember-form-input"
                    type="text"
                    name="userFullName"
                    value={userFullName}
                    required
                    onChange={(e) => setUserFullName(e.target.value)}
                /><br />

                <label
                    className="addmember-form-label"
                    htmlFor="memberId"
                >
                    {userType === "Student" ? "Admission ID" : "Employee ID"}
                    <span className="required-field">*</span>
                </label><br />
                <input
                    className="addmember-form-input"
                    type="text"
                    name="memberId"
                    value={memberId}
                    required
                    onChange={(e) => setMemberId(e.target.value)}
                /><br />

                <label className="addmember-form-label" htmlFor="mobileNumber">
                    Mobile Number<span className="required-field">*</span>
                </label><br />
                <input
                    className="addmember-form-input"
                    type="text"
                    value={mobileNumber}
                    required
                    onChange={(e) => setMobileNumber(e.target.value)}
                /><br />

                <label className="addmember-form-label" htmlFor="gender">
                    Gender<span className="required-field">*</span>
                </label><br />
                <div className='semanticdropdown'>
                    <Dropdown
                        placeholder='Gender'
                        fluid
                        selection
                        value={gender}
                        options={genderTypes}
                        onChange={(event, data) => setGender(data.value)}
                    />
                </div>

                <label className="addmember-form-label" htmlFor="department">
                    Department<span className="required-field">*</span>
                </label><br />
                <input
                    className="addmember-form-input"
                    type="text"
                    value={department}
                    required
                    onChange={(e) => setDepartment(e.target.value)}
                /><br />

                <label className="addmember-form-label" htmlFor="address">
                    Address<span className="required-field">*</span>
                </label><br />
                <input
                    className="addmember-form-input address-field"
                    value={address}
                    type="text"
                    required
                    onChange={(e) => setAddress(e.target.value)}
                /><br />

                <label className="addmember-form-label" htmlFor="email">
                    Email<span className="required-field">*</span>
                </label><br />
                <input
                    className="addmember-form-input"
                    type="email"
                    value={email}
                    required
                    onChange={(e) => setEmail(e.target.value)}
                /><br />

                <label className="addmember-form-label" htmlFor="password">
                    Password<span className="required-field">*</span>
                </label><br />
                <input
                    className="addmember-form-input"
                    type="password"
                    value={password}
                    required
                    onChange={(e) => setPassword(e.target.value)}
                /><br />

                <input
                    className="addmember-submit"
                    type="submit"
                    value="SUBMIT"
                    disabled={isLoading}
                />
            </form>

            <p className="dashboard-option-title">Recently Added Members</p>
            <div className="dashboard-title-line"></div>
            <table className='admindashboard-table'>
                <thead>
                    <tr>
                        <th>S.No</th>
                        <th>Member Type</th>
                        <th>Member ID</th>
                        <th>Member Name</th>
                    </tr>
                </thead>
                <tbody>
                    {recentAddedMembers.map((member, index) => (
                        <tr key={member._id || index}>
                            <td>{index + 1}</td>
                            <td>{member.userType}</td>
                            <td>{member.memberId}</td>
                            <td>{member.userFullName}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default AddMember;
