import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import { MdHome, MdMoney, MdPerson, MdSettings, MdBarChart } from "react-icons/md";

const SidebarContainer = styled.div`
  width: 250px;
  height: 100vh;
  position: fixed;
  top: 0;
  left: ${({ isOpen }) => (isOpen ? "0" : "-250px")};
  background-color: #f5f5f5;
  transition: left 0.3s ease;
  z-index: 1000;
  box-shadow: 2px 0 5px rgba(0, 26, 130, 0.2);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: column;
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: ${({ isOpen }) => (isOpen ? "block" : "none")};
`;

const NavItem = styled.button`
  margin: 12px 0;
  padding: 8px 12px;
  cursor: pointer;
  font-weight: bold;
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  color: #001A82;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  &:hover {
    background-color: #b3e5fc;
    border-radius: 4px;
  }
  ${({ isActive }) =>
    isActive &&
    `
    &::before {
      content: "";
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 100%;
      background-color: #b3e5fc; /* Light blue background */
      border-radius: 2px;
    }
  `}
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  color: red;
  margin: 8px;
  font-size: 24px;
  float: right;
  cursor: pointer;
`;

const SideBar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activePath, setActivePath] = useState("");

  useEffect(() => {
    setActivePath(location.pathname);
  }, [location]);

  const getNavItemClass = (path) => activePath === path;

  return (
    <>
      <SidebarContainer isOpen={isOpen}>
        <div
          style={{
            display: "flex",
            width: "100%",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0px 20px",
            marginBottom: 40,
          }}
        >
          <h2
            style={{
              color: "gray",
              margin: "8px 12px",
              fontSize: "20px",
            }}
          >
            <span style={{ color: "#001A82" }}>B</span>udget{" "}
            <span style={{ color: "#001A82" }}>G</span>enius
          </h2>
          <CloseBtn onClick={onClose} aria-label="Close sidebar">
            ×
          </CloseBtn>
        </div>
        <div
          style={{
            flex: 1,
            margin: 0,
            padding: 0,
          }}
        >
          <NavItem isActive={getNavItemClass("/")} onClick={() => { navigate("/"); onClose(); }}>
            <MdHome size={24} style={{ marginRight: 20 }} /> Finance Dashboard
          </NavItem>
          <NavItem isActive={getNavItemClass("/budget")} onClick={() => { navigate("/budget"); onClose(); }}>
            <MdMoney size={24} style={{ marginRight: 20 }} /> Create Budget
          </NavItem>
          <NavItem isActive={getNavItemClass("/budget-div")} onClick={() => { navigate("/budget-div"); onClose(); }}>
            <MdMoney size={24} style={{ marginRight: 20 }} /> Budget Division
          </NavItem>
          <NavItem isActive={getNavItemClass("/report")} onClick={() => { navigate("/report"); onClose(); }}>
            <MdBarChart size={24} style={{ marginRight: 20 }} /> Report
          </NavItem>
          <NavItem isActive={getNavItemClass("/profile")} onClick={() => { navigate("/profile"); onClose(); }}>
            <MdPerson size={24} style={{ marginRight: 20 }} /> Profile
          </NavItem>

        </div>
        <NavItem isActive={getNavItemClass("/settings")} onClick={() => { navigate("/settings"); onClose(); }}>
          <MdSettings size={24} style={{ marginRight: 20 }} /> Settings
        </NavItem>
      </SidebarContainer>
    </>
  );
};

export default SideBar;