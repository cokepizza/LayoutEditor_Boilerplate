import { createAction, handleActions } from 'redux-actions';

import _ from 'lodash';

import immutableUpdater from '../lib/immutableUpdater';
import refreshObject, { mappingReference, unmappingReference } from '../lib/refreshObject';

export const SET_COMPONENTS = 'layout/SET_COMPONENTS';
export const CHANGE_COMPONENT = 'layout/CHANGE_COMPONENT';
export const DETACH_COMPONENT = 'layout/DETACH_COMPONENT';
export const ATTACH_COMPONENT = 'layout/ATTACH_COMPONENT';
export const MOVE_COMPONENT = 'layout/MOVE_COMPONENT';
export const CLONE_COMPONENT = 'layout/CLONE_COMPONENT';
export const DROP_COMPONENT = 'layout/DROP_COMPONENT';

export const setComponents = createAction(SET_COMPONENTS, payload => payload);
export const changeComponent = createAction(CHANGE_COMPONENT, payload => payload);
export const detachComponent = createAction(DETACH_COMPONENT, payload => payload);
export const attachComponent = createAction(ATTACH_COMPONENT, payload => payload);
export const moveComponent = createAction(MOVE_COMPONENT, payload => payload);
export const cloneComponent = createAction(CLONE_COMPONENT, payload => payload);
export const dropComponent = createAction(DROP_COMPONENT, payload => payload);

export const moveComponentThunk = ({ targetKey, originKey }) => ( dispatch, getState ) => {
    const {
        layout : { componentMap }
    } = getState();

    const originComponent = componentMap.get(String(originKey));

    dispatch(moveComponent({
        undoParam: {
            targetKey: originComponent.parent,
            originKey,
        },
        redoParam: {
            targetKey,
            originKey
        },
        undoThunk: moveComponentThunk,
        redoThunk: moveComponentThunk, 
    }));

    dispatch(detachComponentThunk({
        clickedKey: originKey,
        acting: true,
    }));

    dispatch(attachComponentThunk({
        parentKey: targetKey,
        component: originComponent,
        acting: true,
    }));
};

export const attachDroppedComponentThunk = ({ targetKey, type }) => ( dispatch, getState ) => {
    const {
        layout: { componentMap, idCount },
    } = getState();

    const originComponent = componentMap.get(String(targetKey));

    let backgroundColor = '';
    if(type === 'LinearLayout') {
        backgroundColor = 'red';
    } else if(type === 'Icon') {
        backgroundColor = 'yellow';
    } else if(type === 'Text') {
        backgroundColor = 'green';
    } else if(type === 'Table') {
        backgroundColor = 'blue';
    }

    const droppedComponents = {
        key: String(idCount),
        type: type,
        style: {
            width: 100,
            height: 100,
            backgroundColor,
            justifyContent: 'space-around',
        },
        parent: targetKey,
        children: {},
    };

    const copiedComponentMap = new Map(componentMap);
    copiedComponentMap.set(String(droppedComponents.key), droppedComponents);

    const nextState = {
        ...originComponent,
        children: {
            ...originComponent.children,
            [idCount]: droppedComponents,
        }
    }

    dispatch(dropComponent({
        undoParam: {
            clickedKey: droppedComponents.key,
        },
        redoParam: {
            parentKey: targetKey,
            component: droppedComponents,
        },
        undoThunk: detachComponentThunk,
        redoThunk: attachComponentThunk,
    }));

    dispatch(setTargetComponentThunk({
        key: targetKey,
        value: nextState,
        map: copiedComponentMap,
        count: idCount + 1,
    }));
};

export const attachClonedComponentThunk = ({ targetKey, originKey }) => ( dispatch, getState ) => {
    const {
        layout: { componentMap, idCount },
    } = getState();

    const targetComponent = componentMap.get(String(targetKey));
    const originComponent = componentMap.get(String(originKey));

    const deepClonedOriginComponent = _.cloneDeep(originComponent);

    const counter = { count: [idCount - 1] };
    const copiedComponentMap = new Map(componentMap);
    refreshObject(deepClonedOriginComponent, copiedComponentMap, counter);
    deepClonedOriginComponent.parent = targetKey;

    const nextState = {
        ...targetComponent,
        children: {
            ...targetComponent.children,
            [deepClonedOriginComponent.key]: deepClonedOriginComponent,
        }
    };

    dispatch(cloneComponent({
        undoParam: {
            clickedKey: deepClonedOriginComponent.key,
        },
        redoParam: {
            parentKey: targetComponent.key,
            component: deepClonedOriginComponent,
        },
        undoThunk: detachComponentThunk,
        redoThunk: attachComponentThunk,
    }));

    // console.dir(copiedComponentMap);

    dispatch(setTargetComponentThunk({
        key: targetKey,
        value: nextState,
        map: copiedComponentMap,
        count: counter.count+1,
    }));
}

export const detachComponentThunk = ({ clickedKey, acting }) => ( dispatch, getState ) => {
    const {
        layout: { componentMap }
    } = getState();

    const copiedComponentMap = new Map(componentMap);
    unmappingReference(componentMap.get(String(clickedKey)), copiedComponentMap);
    const parentComponent = componentMap.get(String(componentMap.get(String(clickedKey)).parent));
    // console.dir(clickedKey);
    // console.dir(parentComponent);
    
    const nextState = {
        ...parentComponent,
        children: {
            ...parentComponent.children,
        },
    }
    delete nextState.children[clickedKey];

    if(!acting) {
        dispatch(detachComponent({
            undoParam: {
                parentKey: parentComponent.key,
                component: componentMap.get(clickedKey),
            },
            redoParam: {
                clickedKey,
            },
            undoThunk: attachComponentThunk,
            redoThunk: detachComponentThunk,
        }));
    }
    
    dispatch(setTargetComponentThunk({
        key: parentComponent.key,
        value: nextState,
        map: copiedComponentMap,
    }));
}

export const attachComponentThunk = ({ parentKey, component, acting }) => ( dispatch, getState ) => {
    const {
        layout: { componentMap },
    } = getState();

    // console.dir(component);
    const parentComponent = componentMap.get(parentKey);
    const copiedComponentMap = new Map(componentMap);
    
    // console.dir(component);
    // console.dir(copiedComponentMap);
    mappingReference(component, copiedComponentMap);
    component.parent = parentKey;

    const nextState = {
        ...parentComponent,
        children: {
            ...parentComponent.children,
            [component.key]: component,
        }
    };

    if(!acting) {
        dispatch(attachComponent({
            clickedKey: component.key,
            thunk: detachComponentThunk,
        }));
    }
    
    dispatch(setTargetComponentThunk({
        key: parentKey,
        value: nextState,
        map: copiedComponentMap,
    }));
};

export const changeComponentThunk = ({ clickedKey, traitName, traitValue }) => ( dispatch, getState ) => {
    
    const {
        layout: { componentMap }
    } = getState();

    
    const clickedComponent = componentMap.get(clickedKey);

    dispatch(changeComponent({
        undoParam: {
            clickedKey,
            traitName,
            traitValue: clickedComponent.style[traitName],
        },
        redoParam: {
            clickedKey,
            traitName,
            traitValue,
        },
        undoThunk: changeComponentThunk,
        redoThunk: changeComponentThunk,
    }));

    // console.dir(clickedComponent);

    const nextState = {
        ...clickedComponent,
        style: {
            ...clickedComponent.style,
            [traitName]: traitValue,
        }
    };

    dispatch(setTargetComponentThunk({ key: clickedKey, value: nextState }));
};

export const setTargetComponentThunk = ({ key, value, map, count }) => ( dispatch, getState ) => {
    const { layout: { componentMap, idCount } } = getState();

    if(!map) {
        map = componentMap;
    }
    if(!count) {
        count = idCount;
    }

    const originState = componentMap.get(String(key));
    const immutableMap = new Map(map);
    const immutableObject = immutableUpdater(originState, value, immutableMap);
    
    console.dir(immutableMap);
    console.dir(immutableObject);
    // console.dir(immutableObject);
    // immutableMap.set(immutableObject.key, immutableObject);

    // let length = 0;
    // if(mapper) {
    //     const entries = Object.entries(mapper);
    //     length = entries.length;
    //     entries.forEach(arr => {
    //         const [key, value] = arr;
    //         immutableMap.set(key, value);
    //     });
    // }

    dispatch(setComponents({
        component: immutableObject,
        componentMap: immutableMap,
        idCount: count,
    }));
};

const components = [
    {
        key: '0',
        type: 'LinearLayout',
        style: {
            width: 1000,
            height: 800,
            backgroundColor: 'red',
            justifyContent: 'space-around',
            overflow: 'auto',
            resize: 'both',
        },
        parent: null,
        children: {},
    },
    {
        key: '1',
        type: 'Icon',
        style: {
            width: 500,
            height: 500,
            backgroundColor: 'yellow',
            overflow: 'auto',
            resize: 'both',
        },
        parent: '0',
        children: {},
    },
    {
        key: '2',
        type: 'Icon',
        style: {
            width: 400,
            height: 400,
            backgroundColor: 'yellow',
            overflow: 'auto',
            resize: 'both',
        },
        parent: '0',
        children: {},
    },
    {
        key: '3',
        type: 'Text',
        style: {
            width: 200,
            height: 200,
            backgroundColor: 'green',
            overflow: 'auto',
            resize: 'both',
        },
        parent: '1',
        children: {},
    },
    {
        key: '4',
        type: 'Text',
        style: {
            width: 100,
            height: 100,
            backgroundColor: 'green',
            overflow: 'auto',
            resize: 'both',
        },
        parent: '1',
        children: {},
    },
    {
        key: '5',
        type: 'Table',
        style: {
            width: 50,
            height: 50,
            backgroundColor: 'blue',
            overflow: 'auto',
            resize: 'both',
        },
        parent: '3',
        children: {},
    },
    {
        key: '6',
        type: 'Table',
        style: {
            width: 50,
            height: 50,
            backgroundColor: 'blue',
            overflow: 'auto',
            resize: 'both',
        },
        parent: '3',
        children: {},
    },
];

components[0].children = {
    '1': components[1],
    '2': components[2],
}
components[1].children = {
    '3': components[3],
    '4': components[4],
}
components[3].children = {
    '5': components[5],
    '6': components[6],
}

const componentMap = new Map(
    [
        ['0', components[0]],
        ['1', components[1]],
        ['2', components[2]],
        ['3', components[3]],
        ['4', components[4]],
        ['5', components[5]],
        ['6', components[6]],
    ]
)

const initialState = {
    component: components[0],
    componentMap,
    idCount: componentMap.size,
};

export default handleActions({
    [SET_COMPONENTS]: (state, { payload: { component, componentMap, idCount } }) => ({
        ...state,
        component,
        componentMap,
        idCount,
    }),
}, initialState);