import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Trait from '../components/trait/Trait';
import { changeComponentThunk } from '../modules/layout';

const TraitContainer = () => {
    const dispatch = useDispatch();
    const { clickedKey, componentMap } = useSelector(({ trait, layout }) => ({
        clickedKey: trait.clickedKey,
        componentMap: layout.componentMap,
        component: layout.component,
        idCount: layout.idCount,
    }));

    const [ list, setList ] = useState();

    useEffect(() => {
        if(clickedKey) {
            if(componentMap.has(clickedKey)) {
                setList(componentMap.get(clickedKey).style);
            } else {
                setList();
            }
        }
    }, [clickedKey, componentMap]);

    const updateTrait = useCallback((e, traitName) => {
        const traitValue = e.target.value;
        dispatch(changeComponentThunk({
            clickedKey,
            traitName,
            traitValue,
        }));
    }, [dispatch, clickedKey]);

    const onBlur = useCallback((e, key) => {
        updateTrait(e, key);
    }, [updateTrait]);

    const onChange = useCallback((e, key) => {
        const value = e.target.value;
        setList(prevState => ({
            ...prevState,
            [key]: value,
        }));
     
    }, []);

    const onKeyDown = e => {
        e.stopPropagation();
    }

    return (
        <Trait
            onChange={onChange}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
            list={list}
        />
    )
};

export default TraitContainer;