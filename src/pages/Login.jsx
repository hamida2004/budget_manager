import styled from "styled-components";
import ImageSide from "../components/imageSide";
import Button from "../components/button";
import React, { useEffect, useState } from "react";
import Signup from "./Signup";
import { useNavigate } from "react-router-dom";
import HeaderText from "../components/h1";
import { useUser } from "../context/userContext"; // ✅ استدعاء الكونتكست

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
  margin-top: 60px;
  align-items: center;
  justify-content: space-evenly;
  display: flex;
  flex-direction: column;
`;
const Input = styled.input`
  border-radius: 16px;
  font-size: 20px;
  width: 60%;
  margin-bottom: 20px;
  border: none;
  outline: none;
  box-shadow: 1px 1px 5px rgba(91, 84, 142, 0.2);
  padding: 8px 12px;
`;

const Login = () => {
  const navigate = useNavigate();
  const { login } = useUser(); // ✅ استخدام دالة login من الكونتكست

  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [showSignup, setShowSignup] = useState(false);

  useEffect(() => {
    console.log(window.api)
    const checkUsers = async () => {
      try {
        const hasUsers = await window.api.hasUsers();
        if (!hasUsers) {
          setShowSignup(true); // Show signup page if no users exist
        }
      } catch (error) {
        console.error("Error checking users:", error);
      }
    };
    checkUsers();
  }, []);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const loggedUser = await window.api.login(credentials); // { id, email, username, ... }

      login({
        ...loggedUser // أو يمكنك تخزين `role_id` فقط
      });

      setMessage("Login successful!");
      navigate("/");
    } catch (error) {
      console.error(error);
      setMessage("Invalid email or password.");
    }
  };

  if (showSignup) {
    return <Signup />;
  }

  return (
    <Container>
      {/* <ImageSide to="signup" /> */}
      <Div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <HeaderText text="Welcome Back!" />
          <h2>Please Log In to Your Account </h2>
        </div>
        <Form onSubmit={handleLogin}>
          <Input
            placeholder="Email"
            name="email"
            value={credentials.email}
            onChange={handleChange}
          />
          <Input
            placeholder="Password"
            name="password"
            value={credentials.password}
            type="password"
            onChange={handleChange}
          />
          <Button type="submit" text={"login"} />
        </Form>
        <p style={{ color: "red" }}>{message}</p>
      </Div>
    </Container>
  );
};

export default Login;
