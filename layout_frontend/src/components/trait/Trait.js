import React from 'react';
import styled from 'styled-components';

const TraitBlock = styled.div`
    background-color: lightgray;
    width: 20%;
    height: auto;
`;

const TraitFrameBlock = styled.div`
    display: flex;
`;

const TraitNameBlock = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: gray;
    margin: 10px;
    width: 40%;
    height: 30px;
`;

const TraitInputBlock = styled.input`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 60%;
    margin: 10px;
    height: 30px;
`;

const Trait = ({ list, onChange, onBlur, onKeyDown }) => {
    return (
        <>
            <TraitBlock>
                {list && Object.entries(list).map((arr, index) => (
                    <TraitFrameBlock>
                        <TraitNameBlock>{arr[0]}</TraitNameBlock>
                        <TraitInputBlock
                            onChange={e => onChange(e, arr[0])}
                            onBlur={e => onBlur(e, arr[0])}
                            onKeyDown={onKeyDown}
                            value={arr[1]}
                        />
                    </TraitFrameBlock>
                ))}            
            </TraitBlock>
        </>
    )
};

export default Trait;