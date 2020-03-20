import React from 'react';
import styled from 'styled-components';

const LinearLayoutBlock = styled.div`
    display: flex;
    justify-content: ${props => props.justifyContent};
    align-items: center;
    width: ${props => props.width + 'px'};
    height: ${props => props.height + 'px'};
    background-color: ${props => props.backgroundColor};
    cursor: pointer;
`;

const LinearLayout = ({ component, index, ...rest}) => {
    if(component) {
        return (
            <LinearLayoutBlock
                data-key={index}
                {...component.style}
            >
                {rest.children}
            </LinearLayoutBlock>
        )
    } else {
        return (
            <LinearLayoutBlock
                width={100}
                height={100}
                backgroundColor={'red'}
                draggable='true'
                data-type='LinearLayout'
            >
                {rest.children}
            </LinearLayoutBlock>
        )
    }

};

export default React.memo(LinearLayout, (prevProps, nextProps) => {
    console.dir(prevProps);
    console.dir(nextProps);
    console.dir(prevProps === nextProps);
    return true;
    // return false;
});