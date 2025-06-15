import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import Logo from "../assets/logo-black.png";
import { useUser } from "../context/userContext";
import { MdNotifications } from "react-icons/md";

const NavBar = styled.nav`
  padding: 0px 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0px 4px 6px -3px rgba(91, 84, 142, 0.2);
`;

const StyledLink = styled(Link)`
  text-decoration: none;
  color: red;
  font-size: 20px;
  cursor: pointer;
`;

const Nav = () => {
  const { user ,logout } = useUser();
  const name = user?.username || "Guest";
  const navigate = useNavigate()

  return (
    <NavBar>
      <img
        src={Logo}
        alt="App Logo"
        style={{ height: "48px" }}
      />
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 20
        }}
      >
        <p style={{ fontSize: 20 }}>{name}</p>
        <MdNotifications size={20} color="grey" onClick={()=>{
          navigate('/notifications')
        }}
        style={{
          cursor:'pointer'
        }}
        />
        <StyledLink
          to="/login"
          onClick={() => {
            logout()

          }}
        >
          Log Out
        </StyledLink>
      </div>
    </NavBar>
  );
};

export default Nav;
