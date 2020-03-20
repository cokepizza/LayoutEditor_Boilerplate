import React from 'react';
import { useSelector } from 'react-redux';
import NestedCanvasRenderer from './NestedCanvasRenderer';

const NestedCanvasRendererContainer = () => {
    const { component } = useSelector(({ layout }) => ({
        component: layout.component,
    }))

    return (
        <NestedCanvasRenderer component={component} />
    )
};

export default NestedCanvasRendererContainer;