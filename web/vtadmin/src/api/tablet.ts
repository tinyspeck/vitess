export interface TabletVars {
    VReplicationQPS: {
        All: number[];
        Query: number[];
    };
}

export const fetchTabletVars = async (uid: number): Promise<TabletVars> => {
    const port = 15000 + uid;
    const result = await fetch(`http://localhost:${port}/debug/vars`);
    const json = await result.json();
    return json;
};
