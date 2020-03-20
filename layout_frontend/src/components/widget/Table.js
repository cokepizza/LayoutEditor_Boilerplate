import React from 'react';
import styled from 'styled-components';

const TableBlock = styled.div`
    display: flex;
    justify-content: space-around;
    align-items: center;
    width: ${props => props.width + 'px'};
    height: ${props => props.height + 'px'};
    background-color: ${props => props.backgroundColor};
    overflow: ${props => props.overflow};
    resize: ${props => props.resize};
    cursor: pointer;
`;

const Table = ({ component, children, ...rest }) => {
    if(component) {
        console.log('Table');
        return (
            <TableBlock
                data-key={component.key}
                {...component.style}
                {...rest}
            >
                {children}
            </TableBlock>
        )
    } else {
        return (
            <TableBlock
                width={100}
                height={100}
                backgroundColor={'blue'}
                draggable='true'
                data-type='Table'
            >
                {children}
            </TableBlock>
        )
    }
};

export default React.memo(Table, (prevProps, nextProps) => {
    return prevProps.component === nextProps.component;
});