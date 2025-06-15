import styled from "styled-components";
const Btn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px 8px;
  width:fit-content;
  background-color: #00092B;
  color: #fff;
  font-size: 20px;
  margin-top: 20px;
  cursor: pointer;
  border: none;
  outline: none;
  border-radius: 8px;
  box-shadow: 1px 1px 5px rgba(91, 84, 142, 0.2);
`;
const Button = (props) => {
  return <Btn type={props.type ? props.type :'button'} onClick={props.handleClick}>{props.text}</Btn>;
};

export default Button;
