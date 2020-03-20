import React from 'react';
import styled from 'styled-components';

const IconBlock = styled.div`
    width: ${props => props.width + 'px'};
    height: ${props => props.height + 'px'};
    background-color: ${props => props.backgroundColor};
    overflow: ${props => props.overflow};
    resize: ${props => props.resize};
    display: flex;
    justify-content: space-around;
    align-items: center;
    cursor: pointer;

    /* &::after {
        content: '';
        width: 20px;
        height: 20px;
        background-color: pink;
    }

    &:hover::after {
        width: 20px;
        height: 20px;
        background-color: black;
    } */
`;

const Icon = ({ component, children, ...rest }) => {
    if(component) {
        console.dir('Icon');
        return (
            <IconBlock
                data-key={component.key}
                {...component.style}
                {...rest}
            >
                {children}
            </IconBlock>
        )
    } else {
        return (
            <IconBlock
                width={100}
                height={100}
                backgroundColor={'yellow'}
                draggable='true'
                data-type='Icon'
            >
                {children}
            </IconBlock>
        )
    }
};

export default React.memo(Icon, (prevProps, nextProps) => {
    return prevProps.component === nextProps.component;
});
