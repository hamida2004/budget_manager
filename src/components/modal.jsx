import styled from "styled-components";
import Button from "./button";
import { useState } from "react";
import axios from "axios";

const Element = styled.div`
  border-radius: 16px;
  font-size: 20px;
  width: 28%;
  height: 60%;
  border: none;
  outline: none;
  background-color: white;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  box-shadow: 1px 1px 5px rgba(91, 84, 142, 0.2);
  padding: 40px;
`;
const Btn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 20px;
  border: 2px solid #00092B;
  color: #00092B;
  font-size: 24px;
  background-color: transparent;
  margin-top: 28px;
  cursor: pointer;
  font-weight: 500;
  margin-left: 20px;
  border-radius: 16px;
  box-shadow: 1px 1px 5px rgba(91, 84, 142, 0.2);
`;
const Form = styled.form`
  width: 80%;
  margin-top: 20px;
  align-items: center;
  justify-content: space-evenly;
  display: flex;
  flex-direction: column;
`;
const Input = styled.input`
  border-radius: 16px;
  font-size: 20px;
  width: 100%;
  margin-bottom: 20px;
  border: none;
  outline: none;
  box-shadow: 1px 1px 5px rgba(91, 84, 142, 0.2);
  padding: 8px 12px;
`;
const H1 = styled.h1`
  font-weight: bold;
  color: #00092B;
`;

const Modal = (props) => {
  const show = props.disabled && props.object;
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [qt, setQt] = useState(0);
  const handleUpdateProduct = async () => {
    try {
      
        const res = await axios.delete(`http://localhost:8080/${props.id}`, {
        withCredentials: true,
      });
        const resp = await axios.put(`http://localhost:8080/${props.id}`,{name:name,description:desc,quantity:qt}, {
          withCredentials: true,
        });
        props.onClose()
    } catch (error) {
      alert("something went wrong !");
      console.log(error);
    }
  };
  const handleAddProduct = async () => {
    if(!name || !desc){
      alert("please fill necessary fields")
    }
    else{
      try {
        const res = await axios.post("http://localhost:8080", {
          name: name,
          description: desc,
          quantity: qt,
        });
        console.log(res);
        props.onClose();
      } catch (error) {
        console.log(error);
        props.onClose();
      }
    }
  };
  return (
    <Element>
      <H1>{show ? "View":"Create"} Article</H1>
      <Form>
        <Input
          
          type="text"
          placeholder={props.object?.name || "name"}
          disabled={props.disabled}
          value={show ? props.object.name : name}
          onChange={(e) => {
            e.preventDefault();
            setName(e.target.value);
          }}
        />

        <Input
          style={{ height: "100px" }}
          placeholder={props.object?.description || "Description"}
          type="text"
          disabled={props.disabled}
          value={show ? props.object.description : desc}
          onChange={(e) => {
            e.preventDefault();
            setDesc(e.target.value);
          }}
        />
        <Input
          placeholder={props.object?.quantity || "quantity"}
          type="number"
          disabled={props.disabled}
          value={show ? props.object.quantity : qt}
          onChange={(e) => {
            e.preventDefault();
            setQt(e.target.value);
          }}
        />
      </Form>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {!props.disabled && (
          <Button text="validate" handleClick={props.object ? handleUpdateProduct:handleAddProduct} />
        )}
        <Btn
          onClick={() => {
            props.onClose();
          }}
        >
          Cancel
        </Btn>
      </div>
    </Element>
  );
};
export default Modal;
