import { vtadmin as pb } from '../proto/vtadmin';
export interface TabletVars {
    VReplicationQPS: {
        All: number[];
        Query: number[];
    };
}

export const fetchTabletVars = async (tablet: pb.Tablet): Promise<TabletVars> => {
    const template = process.env.REACT_APP_TABLET_LINK_TEMPLATE;
    if (!template)
        return Promise.resolve({
            VReplicationQPS: { All: [], Query: [] },
        });

    let href = template.replace('{{hostname}}', tablet.tablet?.hostname || '');

    // This is truly so disgusting.
    if (tablet.tablet?.alias?.uid) {
        href = href.replace('{{uid}}', `${parseInt(`${tablet.tablet?.alias?.uid}`, 10)}`);
    }

    const result = await fetch(`${href}/debug/vars`, { credentials: 'include' });
    const json = await result.json();
    return json;
};
