import React from 'react';
import styled from 'styled-components';
// import Canvas from './canvas/Canvas';
// import CanvasRenderer from '../components/canvas/CanvasRenderer';
import CoverContainer from '../containers/CoverContainer';
import TraitContainer from '../containers/TraitContainer';
import NestedCanvasRendererContainer from '../components/canvas/NestedCanvasRendererContainer';

const LayoutBlock = styled.div`
    display: flex;
    width: 100%;
    height: 100%;
`;

const Layout = () => {

    return (
        <LayoutBlock>
            <CoverContainer />
            <NestedCanvasRendererContainer />
            <TraitContainer />
        </LayoutBlock>
    )
};

export default Layout;