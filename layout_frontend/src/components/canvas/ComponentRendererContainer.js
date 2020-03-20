import React from 'react';
import { useSelector } from 'react-redux';
import ComponentRenderer from './ComponentRenderer';

const ComponentRendererContainer = ({ index }) => {
    const { component } = useSelector(({ layout }) => ({
        component: layout[index],
    }));
    
    // useEffect(() => {
    //     arr.push(component);
    // }, [component])
    
    return (
        <ComponentRenderer
            component={component}
            index={index}
        />
    )
};

export default ComponentRendererContainer;