import React from "react";
import styled from "styled-components";

const Card: React.FC = (props) => {
    return <StyledCard>{props.children}</StyledCard>;
};

const StyledCard = styled.div`
    background-color: ${(props) => props.theme.color.grey[800]};
    border-radius: ${(props) => props.theme.borderRadius}px;
    overflow: hidden;
    border: 1px solid ${(props) => props.theme.color.grey[300]}ff;
    display: flex;
    flex: 1;
    flex-direction: column;
`;

export default Card;
