import React, { useEffect, useCallback, useRef } from 'react';
import Layout from '../components/Layout';
import { useDispatch } from 'react-redux';
import { traitSetting } from '../modules/trait';
import { attachDroppedComponentThunk, detachComponentThunk, attachClonedComponentThunk, moveComponentThunk } from '../modules/layout';

const LayoutContainer = () => {
    const dispatch = useDispatch();
    // const { componentMap, idCount } = useSelector(({ layout }) => ({
    //     componentMap: layout.componentMap,
    //     idCount: layout.idCount,
    // }))

    const clickedDom = useRef(null);
    const copiedDom = useRef(null);

    const onClick = useCallback(e => {
        const key = e.target.dataset.key;
        if(!key) return;
        if(clickedDom.current) {
            clickedDom.current.style.outline = 'none';
            clickedDom.current.style.zIndex = '0';
        }
        clickedDom.current = e.target;
        e.target.style.outline = 'dashed';
        e.target.style.zIndex = '10';
        dispatch(traitSetting({
            clickedKey: key,
        }));
    }, [dispatch]);
    
    const onDragOver = useCallback(e => {
        if(clickedDom.current) {
            clickedDom.current.style.outline = 'none';
            clickedDom.current.style.zIndex = '0';
        }
        if(!e.target.dataset.key) return;
        e.preventDefault();
        e.stopPropagation();
        e.target.style.outline = 'inset';
    }, []);

    const onDragLeave = useCallback(e => {
        if(clickedDom.current) {
            clickedDom.current.style.outline = 'none';
            clickedDom.current.style.zIndex = '0';
        }
        if(!e.target.dataset.key) return;
        e.target.style.outline = 'none';
    }, []);

    const onDrop = useCallback(e => {
        if(clickedDom.current) {
            clickedDom.current.style.outline = 'none';
            clickedDom.current.style.zIndex = '0';
        }
        if(!e.target.dataset.key) return;
        e.target.style.outline = 'none';
        const key = e.target.dataset.key;
        const droppedType = e.dataTransfer.getData('type');
        const droppedKey = e.dataTransfer.getData('key');
    
        if(droppedType) {
            dispatch(attachDroppedComponentThunk({
                targetKey: key,
                type: droppedType,
            }));
        } else if(droppedKey) {
            console.dir(key);
            console.dir(droppedKey);
            dispatch(moveComponentThunk({
                targetKey: key,
                originKey: droppedKey,
            }));
        }

    }, [dispatch]);

    const onDragStart = useCallback(e => {
        if(!e.target.dataset.type && !e.target.dataset.key) return;
        if(clickedDom.current) {
            clickedDom.current.style.outline = 'none';
            clickedDom.current.style.zIndex = '0';
        }

        if(e.target.dataset.type) {
            e.dataTransfer.setData('type', e.target.dataset.type);
        }
        if(e.target.dataset.key) {
            e.dataTransfer.setData('key', e.target.dataset.key);
        }
        
    }, []);

    const onKeyPress = useCallback(e => {
        var key = e.which || e.keyCode;
        var ctrl = e.ctrlKey ? e.ctrlKey : ((key === 17) ? true : false);

        //  del
        if (key === 46) {
            const clickedKey = clickedDom.current.dataset.key;
            dispatch(detachComponentThunk({
                clickedKey,
            }));
            return;
        }

        //  copy & paste
        if ( key === 67 && ctrl ) {
            console.log("Ctrl + C Pressed !");
            copiedDom.current = clickedDom.current;

        } else if ( key === 86 && ctrl ) {
            console.log("Ctrl + V Pressed !");
            
            const targetKey = clickedDom.current.dataset.key;
            const originKey = copiedDom.current.dataset.key;
            dispatch(attachClonedComponentThunk({
                targetKey,
                originKey,
            }));
        }
    }, [ dispatch ]);

    useEffect(() => {
        window.addEventListener('click', onClick);
        window.addEventListener('dragover', onDragOver);
        window.addEventListener('dragleave', onDragLeave);
        window.addEventListener('drop', onDrop);
        window.addEventListener('dragstart', onDragStart);
        window.addEventListener('keydown', onKeyPress);
        
        return () => {
            window.removeEventListener('click', onClick);
            window.removeEventListener('dragover', onDragOver);
            window.removeEventListener('dragleave', onDragLeave);
            window.removeEventListener('drop', onDrop);
            window.removeEventListener('dragstart', onDragStart);
            window.removeEventListener('keydown', onKeyPress);
        }
    });

    return (
        <Layout />
    )
};

export default LayoutContainer;