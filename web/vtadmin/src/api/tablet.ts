import { vtadmin as pb } from '../proto/vtadmin';
import { tabletFQDN } from '../util/tablet';
export interface TabletVars {
    VReplicationQPS: {
        All: number[];
        Query: number[];
    };
}

export const fetchTabletVars = async (tablet: pb.Tablet): Promise<TabletVars> => {
    const href = tabletFQDN({
        cell: tablet.tablet?.alias?.cell,
        hostname: tablet.tablet?.hostname,
        uid: tablet.tablet?.alias?.uid,
    });

    if (!href) {
        return Promise.resolve({
            VReplicationQPS: { All: [], Query: [] },
        });
    }

    const result = await fetch(`${href}/debug/vars`, { credentials: 'include' });
    const json = await result.json();
    return json;
};
