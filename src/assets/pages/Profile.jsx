import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import Nav from "../components/nav";
import SideBar from "../components/SideBar";
import { useUser } from "../context/userContext";
// Updated Styled Components
const Container = styled.div`
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  
`;

const Section = styled.div`
  margin-top: 20px;
  width: 50%;
  max-width: 600px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const Input = styled.input`
  padding: 8px;
  border: 1px solid #00092B;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s ease;

  &:focus {
    border-color: #00092B;
    outline: none;
  }
`;

const Select = styled.select`
  padding: 8px;
  border: 1px solid #00092B;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s ease;

  &:focus {
    border-color: #00092B;
    outline: none;
  }
`;

const Label = styled.label`
  font-weight: bold;
  color: #00092B;
  margin-bottom: 5px;
  margin-right:20px
`;

const ErrorMessage = styled.p`
  color: red;
  font-size: 14px;
  margin: 5px 0 0 0;
`;

const Button = styled.button`

  background-color: #00092B;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease;
  width:fit-content;
  margin-top:40px;
  &:hover {
    background-color: #001a66;
  }
`;
const Profile = () => {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userForm, setUserForm] = useState({ email: "", username: "" });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return navigate("/login");
    setUserForm({ email: user.email, username: user.username });
  }, [user, navigate]);

  const handleUserUpdate = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (!userForm.email || !userForm.username) {
        setError("Email and username are required.");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userForm.email)) {
        setError("Invalid email format.");
        return;
      }
      const updatedUser = { ...user, ...userForm };
      await window.api.updateUser(updatedUser);
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating user:", error);
      setError("Failed to update profile.");
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (
        !passwordForm.currentPassword ||
        !passwordForm.newPassword ||
        !passwordForm.confirmPassword
      ) {
        setError("All password fields are required.");
        return;
      }
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        setError("New password and confirm password do not match.");
        return;
      }
      if (passwordForm.newPassword.length < 6) {
        setError("New password must be at least 6 characters long.");
        return;
      }
      await window.api.updateUser({ ...user, password: passwordForm.newPassword });
      alert("Password reset successfully!");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      console.error("Error resetting password:", error);
      setError("Failed to reset password.");
    }
  };

  return (
    <>
      <Nav />
      <Container>
        <FaBars
          size={24}
          style={{
            cursor: "pointer",
            alignSelf: "flex-start",
            position: "absolute",
          }}
          onClick={() => setSidebarOpen(true)}
        />
        <h2 style={{ color: "#00092B" }}>Profile</h2>
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Section>
            <h3>Update Profile</h3>
            <Form onSubmit={handleUserUpdate}>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={userForm.email}
                  onChange={(e) =>
                    setUserForm({ ...userForm, email: e.target.value })
                  }
                  placeholder="Email"
                />
              </div>
              <div>
                <Label>Username</Label>
                <Input
                  type="text"
                  value={userForm.username}
                  onChange={(e) =>
                    setUserForm({ ...userForm, username: e.target.value })
                  }
                  placeholder="Username"
                />
              </div>
              {error && <ErrorMessage>{error}</ErrorMessage>}
              <Button type="submit">Update Profile</Button>
            </Form>
          </Section>
          <Section>
            <h3>Reset Password</h3>
            <Form onSubmit={handlePasswordReset}>
              <div>
                <Label>Current Password</Label>
                <Input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      currentPassword: e.target.value,
                    })
                  }
                  placeholder="Current Password"
                />
              </div>
              <div>
                <Label>New Password</Label>
                <Input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                  }
                  placeholder="New Password"
                />
              </div>
              <div>
                <Label>Confirm New Password</Label>
                <Input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  placeholder="Confirm New Password"
                />
              </div>
              {error && <ErrorMessage>{error}</ErrorMessage>}
              <Button type="submit">Reset Password</Button>
            </Form>
          </Section>

        </div>
        {sidebarOpen && (
          <SideBar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}
      </Container>
    </>
  );
};

export default Profile;