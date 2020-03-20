import React from 'react';
import { useSelector } from 'react-redux';
import Cover from '../components/cover/Cover';

const CoverContainer = () => {
    const { list } = useSelector(({ cover }) => ({
        list: cover.list,
    }));

    return (
        <Cover list={list} />
    )
};

export default CoverContainer;