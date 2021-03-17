export const fetchTabletVars = async (uid: number) => {
    const port = 15000 + uid;
    const result = await fetch(`http://localhost:${port}/debug/vars`);
    const json = await result.json();
    return json;
};
