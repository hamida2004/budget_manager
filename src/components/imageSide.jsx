import { Link } from "react-router-dom";
import styled from "styled-components";
import Image from '../assets/logo-white.png'
const Div = styled.div`
  width: 50%;
  height: 100%;
  background-color: #555;
  align-items: center;
  justify-content: center;
  display: flex;
  flex-direction: column;
`;
const ImageContainer = styled.div`
  width: 100%;
  height: 90%;
  align-items: center;
  justify-content: center;
  display: flex;
  flex-direction: column;
  padding: 40px;
  color: #00092B;
`;
const Forward = styled.div`
  color: #d9d9d9;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;
const Text = styled.p`
  font-size: 32px;
  color: #00092B;
`;

const ImageSide = ({to}) => {
  return (
    <Div>
      <ImageContainer>
        <img src={Image} alt="logo" />
        <Text>Best tool to manage your store </Text>
      </ImageContainer>
      <Forward>
        <p>
            You already have an account? 
        </p>
        {/* <StyledLink to={`/${to}`}>{to}</StyledLink>  */}
         <Link to={`/`}>{to}</Link>
        </Forward>
    </Div>
  );
};
export default ImageSide;
