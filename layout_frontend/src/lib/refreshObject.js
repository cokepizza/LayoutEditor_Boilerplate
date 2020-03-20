export const refreshKey = (object, counter) => {
    object.key = String(++counter.count);

    if(object.children) {
        Object.keys(object.children).forEach(key => {
            object.children[key].parent = object.key;
            refreshKey(object.children[key], counter);
        });
    }
}

export const refreshReference = object => {
    if(object.children) {
        Object.keys(object.children).forEach(key => {
            const child = object.children[key];
            const genChildren = {
                ...object.children,
                [child.key]: child,
            }
            delete genChildren[key];
            object.children = genChildren;

            refreshReference(object.children[child.key]);
        });
    }
}

export const mappingReference = (object, componentMap) => {
    componentMap.set(String(object.key), object);
    if(object.children) {
        Object.keys(object.children).forEach(key => {
            mappingReference(object.children[key], componentMap);
        })
    }
}

export const unmappingReference = (object, componentMap) => {
    if(object.children) {
        Object.keys(object.children).forEach(key => {
            unmappingReference(object.children[key], componentMap);
        });
    }
    componentMap.delete(String(object.key));
};

const refreshObject = (object, componentMap, counter) => {
    refreshKey(object, counter);
    refreshReference(object);
    mappingReference(object, componentMap);
}

export default refreshObject;