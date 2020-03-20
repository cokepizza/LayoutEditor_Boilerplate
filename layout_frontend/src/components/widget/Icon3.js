import React from 'react';
import styled from 'styled-components';
import component from '../../lib/component';

const IconBlock = styled.div`
    width: ${props => props.width + 'px'};
    height: ${props => props.height + 'px'};
    background-color: ${props => props.backgroundColor};
    display: flex;
    justify-content: space-around;
    align-items: center;
    cursor: pointer;
    
`;

const Icon = ({ components, index, ...rest }) => {
    if(components && index) {
        const children = components[index].children;
        return (
            <IconBlock
                data-key={index}
                {...components[index].style}
            >
                {children && children.map(idx => {
                    const Component = component[components[idx].type];
                    return (
                        <Component
                            components={components}
                            index={idx}
                        />
                    )
                })}
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
                {rest.children}
            </IconBlock>
        )
    }
};

export default React.memo(Icon);
