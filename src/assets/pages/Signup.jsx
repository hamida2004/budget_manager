import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import ImageSide from "../components/imageSide";
import Button from "../components/button";
import HeaderText from "../components/h1";

const Container = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;
const Div = styled.div`
  width: 50%;
  height: 100%;
  align-items: center;
  justify-content: space-evenly;
  display: flex;
  flex-direction: column;
`;
const Form = styled.form`
  width: 80%;
  margin-top: 12px;
  align-items: center;
  justify-content: space-evenly;
  display: flex;
  flex-direction: column;
`;
const Input = styled.input`
  border-radius: 16px;
  font-size: 20px;
  width: 60%;
  margin-bottom: 12px;
  border: none;
  outline: none;
  box-shadow: 1px 1px 5px rgba(91, 84, 142, 0.2);
  padding: 6px 12px;
`;
const Select = styled.select`
  border-radius: 16px;
  font-size: 18px;
  width: 60%;
  margin-bottom: 20px;
  border: none;
  outline: none;
  box-shadow: 1px 1px 5px rgba(91, 84, 142, 0.2);
  padding: 8px 12px;
`;

const wilayas = Array.from({ length: 58 }, (_, i) => `${i + 1}`);

const Signup = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const [labInfo, setLabInfo] = useState({
    name: "",
    univ: "",
    wilaya: "",
  });

  const [message, setMessage] = useState("");
  const [hasUsers, setHasUsers] = useState(true);

  useEffect(() => {
    const checkUsers = async () => {
      try {
        const exist = await window.api.hasUsers();
        setHasUsers(exist);
      } catch (error) {
        console.error("Error checking users:", error);
      }
    };
    checkUsers();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLabChange = (e) => {
    setLabInfo({ ...labInfo, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (form.password !== form.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      // Add laboratory information
      const labId = await window.api.addLaboratory(labInfo);

      // Register user
      const result = await window.api.register({
        ...form,
        role_id: 1, // Assuming role_id = 1 for admin or default user
      });

      setMessage("Account created successfully!");
      console.log("Registered user:", result);
      navigate("/login");
    } catch (error) {
      setMessage("Failed to create account. Try again.");
      console.error(error);
    }
  };

  return (
    <Container>
      {hasUsers ? (
        <Div>
          <HeaderText text="Oops! You cannot register" />
          <h1>Users already exist. Registration disabled.</h1>
          <Link to={'/'}>go back</Link>
        </Div>
      ) : (
        <>
          <ImageSide to="login" />
          <Div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <HeaderText text="Welcome!" />
              <h2>Join Our System, Create Account</h2>
            </div>

            <Form onSubmit={handleSubmit}>
              <h3>Laboratory Information</h3>
              <Input
                name="name"
                placeholder="Laboratory Name"
                onChange={handleLabChange}
                required
              />
              <Input
                name="univ"
                placeholder="University"
                onChange={handleLabChange}
                required
              />
              <Select name="wilaya" onChange={handleLabChange} required>
                <option value="">Select Wilaya</option>
                {wilayas.map((w, i) => (
                  <option key={i} value={w}>
                    {w}
                  </option>
                ))}
              </Select>

              <h3>Personal Information</h3>
              <Input
                name="email"
                placeholder="Email"
                onChange={handleChange}
                required
              />
              <Input
                name="username"
                placeholder="Username"
                onChange={handleChange}
                required
              />
              <Input
                name="password"
                type="password"
                placeholder="Password"
                onChange={handleChange}
                required
              />
              <Input
                name="confirmPassword"
                type="password"
                placeholder="Confirm Password"
                onChange={handleChange}
                required
              />

              <Button type="submit" text={"Sign Up"} />
            </Form>
            <p style={{ color: "red" }}>{message}</p>
          </Div>
        </>
      )}
    </Container>
  );
};

export default Signup;