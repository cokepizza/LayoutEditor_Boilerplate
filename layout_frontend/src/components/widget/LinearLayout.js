import React from 'react';
import styled from 'styled-components';

const LinearLayoutBlock = styled.div`
    display: flex;
    justify-content: ${props => props.justifyContent};
    align-items: center;
    width: ${props => props.width + 'px'};
    height: ${props => props.height + 'px'};
    background-color: ${props => props.backgroundColor};
    overflow: ${props => props.overflow};
    resize: ${props => props.resize};
    cursor: pointer;
`;

const LinearLayout = ({ component, children, ...rest}) => {
    if(component) {
        console.dir('LinearLayout');
        return (
            <LinearLayoutBlock
                data-key={component.key}
                {...component.style}
                {...rest}
            >
                {children}
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
                {children}
            </LinearLayoutBlock>
        )
    }

};

export default React.memo(LinearLayout, (prevProps, nextProps) => {
    return prevProps.component === nextProps.component;
});