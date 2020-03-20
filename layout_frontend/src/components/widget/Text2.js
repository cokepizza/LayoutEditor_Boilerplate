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

const Text = ({ component, index, ...rest }) => {
    
    
    if(component) {
        console.log('Text~~');
        return (
            <TextBlock
                data-key={index}
                {...component.style}
            >
                {rest.children}
            </TextBlock>
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
    if(prevProps.component) {

        //children이 달라서 memo 안됨
        console.dir(prevProps);
        console.dir(nextProps);
        console.dir(prevProps.children === nextProps.children);

        // let bool = true;
        // Object.keys(prevProps).forEach(key => {
        //     if(prevProps[key] !== nextProps[key]) {
        //         console.dir(key);
        //         bool = false;
        //     }
        // });
        // console.dir(bool);
        
        // console.dir(a);
        // console.dir(b);
        // console.dir(a === b);
        // console.dir(c);
        // console.dir(d);
        // console.dir(c === d);
        console.dir(prevProps.rest === nextProps.rest);
        
        return true;
    }
    return true;
});