import React from 'react';
import components from '../../lib/component';
import ComponentRendererContainer from './ComponentRendererContainer';

const ComponentRenderer = ({ component, index }) => {
    const Component = components[component.type];

    return (
        <Component
            index={index}
            component={component}
        >
            {
                component.children.map(idx => (
                    <ComponentRendererContainer
                        key={index + '_in_' + idx}
                        index={idx}
                    />
                ))
            }   
        </Component>
    )
}

export default ComponentRenderer;