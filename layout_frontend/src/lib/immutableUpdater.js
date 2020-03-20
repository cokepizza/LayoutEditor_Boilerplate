const immutableUpdater = (node, prevNode, immutableMap) => {
    if(node.parent) {
        immutableMap.set(String(prevNode.key), prevNode);
        const parent = immutableMap.get(String(node.parent));
        
        return immutableUpdater(parent, {
            ...parent,
            children: {
                ...parent.children,
                [prevNode.key]: prevNode,
            }
        }, immutableMap);

    }

    immutableMap.set(String(prevNode.key), prevNode);
    return prevNode;
};

export default immutableUpdater;