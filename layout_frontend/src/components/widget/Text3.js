import React from 'react';
import styled from 'styled-components';

const TextBlock = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    width: ${props => props.width + 'px'};
    height: ${props => props.height + 'px'};
    background-color: ${props => props.backgroundColor};
    cursor: pointer;
`;

const Text = ({ components, index, ...rest }) => {
    console.log('Text~~');
    
    if(components && index) {
        console.dir(components[index].style);
        return (
            <TextBlock
                data-key={index}
                {...components[index].style}
            />
        )
    } else {
        return (
            <TextBlock
                width={100}
                height={100}
                backgroundColor={'green'}
                draggable='true'
                data-type='Text'
            >
                {rest.children}
            </TextBlock>
        )
    }
};

// export default React.memo(Text);
export default React.memo(Text, (prevProps, nextProps) => {
    if(prevProps.components) {
        const a = prevProps.components[prevProps.index];
        const b = nextProps.components[nextProps.index];
        
        console.dir(a);
        console.dir(b);
        console.dir(a === b);
        return false;
    }
    return false;
});