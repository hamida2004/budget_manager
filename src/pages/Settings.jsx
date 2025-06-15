import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import Nav from "../components/nav";
import SideBar from "../components/SideBar";
import Button from "../components/button";
import { useUser } from "../context/userContext";

const Container = styled.div`
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
`;

const Section = styled.div`
  margin-top: 20px;
  width: 100%;
  max-width: 600px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const Input = styled.input`
  padding: 8px;
  border: 1px solid #001A82;
  border-radius: 8px;
  font-size: 16px;
`;



const Label = styled.label`
  font-weight: bold;
  color: #001A82;
  margin-bottom: 5px;
  margin-right:20px
`;

const ErrorMessage = styled.p`
  color: red;
  font-size: 14px;
  margin: 5px 0 0 0;
`;

const Settings = () => {
  const { user} = useUser();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
   const [laboratory, setLaboratory] = useState({ id: null, name: "", wilaya: "", univ: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return navigate("/login");
    fetchLaboratory();
  }, [user, navigate]);

  const fetchLaboratory = async () => {
    try {
      const lab = await window.api.getLaboratory();
      if (lab && lab.length > 0 && lab[0].id) {
        setLaboratory({
          id: lab[0].id,
          name: lab[0].name || "",
          wilaya: lab[0].wilaya || "",
          univ: lab[0].univ || "",
        });
      } else {
        setError("No laboratory data found. Please add a laboratory first.");
      }
    } catch (error) {
      console.error("Error fetching laboratory:", error);
      setError("Failed to load laboratory information.");
    }
  };



  const handleLabUpdate = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (!laboratory.id) {
        setError("No laboratory selected. Please ensure a laboratory exists.");
        return;
      }
      if (!laboratory.name || !laboratory.wilaya || !laboratory.univ) {
        setError("All fields (Name, Wilaya, University) are required.");
        return;
      }
      await window.api.updateLaboratory({
        id: laboratory.id,
        name: laboratory.name,
        wilaya: laboratory.wilaya,
        univ: laboratory.univ,
      });
      alert("Laboratory information updated successfully!");
    } catch (error) {
      console.error("Error updating laboratory:", error);
      setError(`Failed to update laboratory: ${error.message}`);
    }
  };

  

  return (
    <>
      <Nav />
      <Container>
        <FaBars
          size={24}
          style={{ cursor: "pointer", alignSelf: "flex-start", position: "absolute" }}
          onClick={() => setSidebarOpen(true)}
        />
        <h2 style={{ color: "#001A82" }}>Settings</h2>

       
        
        <Section>
          <h3>Update Laboratory Information</h3>
          <Form onSubmit={handleLabUpdate}>
            <div>
              <Label>Name</Label>
              <Input
                type="text"
                value={laboratory.name}
                onChange={(e) => setLaboratory({ ...laboratory, name: e.target.value })}
                placeholder="Laboratory Name"
              />
            </div>
            <div>
              <Label>Wilaya</Label>
              <Input
                type="text"
                value={laboratory.wilaya}
                onChange={(e) => setLaboratory({ ...laboratory, wilaya: e.target.value })}
                placeholder="Wilaya"
              />
            </div>
            <div>
              <Label>University</Label>
              <Input
                type="text"
                value={laboratory.univ}
                onChange={(e) => setLaboratory({ ...laboratory, univ: e.target.value })}
                placeholder="University"
              />
            </div>
            {error && <ErrorMessage>{error}</ErrorMessage>}
            <Button type="submit" text="Update Laboratory" />
          </Form>
        </Section>

       

        {sidebarOpen && <SideBar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
      </Container>
    </>
  );
};

export default Settings;