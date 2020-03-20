import React from 'react';
import styled from 'styled-components';
import component from '../../lib/component';

const LinearLayoutBlock = styled.div`
    display: flex;
    justify-content: ${props => props.justifyContent};
    align-items: center;
    width: ${props => props.width + 'px'};
    height: ${props => props.height + 'px'};
    background-color: ${props => props.backgroundColor};
    cursor: pointer;
`;

const LinearLayout = ({ components, index, ...rest}) => {
    if(components && index) {
        const children = components[index].children;
        return (
            <LinearLayoutBlock
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

export default React.memo(LinearLayout);