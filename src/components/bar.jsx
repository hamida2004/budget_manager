import styled from "styled-components";
const Div = styled.div`
  border-radius: 16px;
  font-size: 20px;
  width: 100%;
  height:fit-content;
  margin-bottom: 40px;
  border: none;
  outline: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 1px 1px 5px rgba(91, 84, 142, 0.2);
  padding: 12px 28px;
  color: #00092B;
  padding-right: 33%;
  font-weight: bold;
`;
const Bar = () => {
  return (
    <Div>
      <p>ID</p>
      <p>Name</p>
      <p>Quantity</p>
    </Div>
  );
};

export default Bar;
