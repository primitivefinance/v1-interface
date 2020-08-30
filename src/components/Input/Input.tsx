import React from "react";
import styled from "styled-components";

export type InputattedSelections = {
    selections: string;
};

export interface InputProps {
    selections: string[];
}

const Input: React.FC = (props) => {
    return <StyledInput type="number"></StyledInput>;
};
const StyledInput = styled.input``;

export default Input;
