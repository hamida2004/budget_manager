import { Link } from "react-router-dom";
import styled from "styled-components";
const Div = styled.div`
  font-size: 20px;
  width: 100%;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28px;
`;
const StyledLink = styled.button`
  text-decoration: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  color: red;
  font-size: 20px;
`;
const Item = (props) => {
  return (
    <Div>
      <p>{props.nmber}</p>
      <p>{props.name}</p>
      <p>{props.quantity}</p>
      <StyledLink
      style={{color:'orange'}}
      onClick={(e)=>{
        e.preventDefault()
        props.onView(props.id)
      }}
      >view</StyledLink>
      <StyledLink
      style={{color:'green'}}
      onClick={(e)=>{
        e.preventDefault()
        props.onUpdate(props.id)
      }}
      >update</StyledLink>
      <StyledLink
      onClick={(e)=>{
        e.preventDefault()
        props.onDelete(props.id)
      }}
      >delete</StyledLink>
    </Div>
  );
};

export default Item;
