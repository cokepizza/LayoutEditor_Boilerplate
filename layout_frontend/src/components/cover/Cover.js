import React from 'react';
import styled from 'styled-components';
import componentConverter from '../../lib/componentConverter'
import RedoUndoContainer from '../../containers/RedoUndoContainer';

const CoverBlock = styled.div`
    display: flex;
    flex-direction: column;
    width: 10%;
    height: auto;
    background-color: gray;
`;
const MarginBlock = styled.div`
    margin-top: 100px;
`

// {list && list.map(key => {
//     const Component = component[key];
//     return (
//         <>
//             <Component width={100} height={100} backgroundColor={'red'} justifyContent={'space-around'}>
//                 {key}
//             </Component>
//         <MarginBlock />
//         </>
//     )
// })}

const Cover = ({ list }) => {
    return (
        <>
            <CoverBlock>
                {list && list.map(key => {
                    const Component = componentConverter[key];
                    return (
                        <>
                            <Component>
                                {key}
                            </Component>
                        <MarginBlock />
                        </>
                    )
                })}
            </CoverBlock>
            <RedoUndoContainer />
        </>
    )
};

export default Cover;