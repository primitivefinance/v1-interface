import React from "react";
import styled from "styled-components";

export type SelectattedSelections = {
    selections: string;
};

export interface SelectProps {
    selections: string[];
}

const Select: React.FC<SelectProps> = (props) => {
    const { selections } = props;
    return (
        <StyledSelect>
            {selections.map((selection, i) => {
                return (
                    <StyledOption key={i} value={selection}>
                        {selection}
                    </StyledOption>
                );
            })}
        </StyledSelect>
    );
};
const StyledSelect = styled.select``;

const StyledOption = styled.option``;

export default Select;
