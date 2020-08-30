import React from "react";
import styled from "styled-components";

import LitContainer from "../../../../components/LitContainer";
import ToggleButton from "../../../../components/ToggleButton";

export interface FilterBarProps {
    active: boolean;
    setCallActive: Function;
}

const FilterBar: React.FC<FilterBarProps> = (props) => {
    const { active, setCallActive } = props;
    return (
        <StyledFilterBar>
            <LitContainer>
                <StyledFilterBarInner>
                    <ToggleButton
                        active={active}
                        button1Text="Calls"
                        button2Text="Puts"
                        onToggle={() => setCallActive(!active)}
                    />
                </StyledFilterBarInner>
            </LitContainer>
        </StyledFilterBar>
    );
};

const StyledFilterBar = styled.div`
    background: ${(props) => props.theme.color.grey[800]};
`;

const StyledFilterBarInner = styled.div`
    align-items: center;
    display: flex;
    height: ${(props) => props.theme.barHeight}px;
`;

export default FilterBar;
