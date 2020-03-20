import React from 'react';
import componentConverter from '../../lib/componentConverter';

const NestedComponentRenderer = ({ component }) => {
    const Component = componentConverter[component.type];
    
    return (
        <Component
            component={component}
            draggable='true'
        >
            {
                Object.values(component.children).map(comp => (
                    <NestedComponentRenderer component={comp} />
                ))
            }
        </Component>
    )
};


export default NestedComponentRenderer;