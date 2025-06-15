import styled from "styled-components";
const H1 = styled.h1`
font-size: 40px;
font-weight: 600;
color:  #00092B;
letter-spacing: 1.2;
margin-bottom:10px ;

`
const HeaderText = (props)=>{
    return <H1>{props.text}</H1>
}

export default HeaderText;