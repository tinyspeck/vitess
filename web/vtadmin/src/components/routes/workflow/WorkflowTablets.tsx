import * as React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

import { flatten } from 'lodash';
import { useQueries, UseQueryResult } from 'react-query';
import { fetchTabletVars, TabletVars } from '../../../api/tablet';
import { useWorkflow } from '../../../hooks/api';
import { vtctldata } from '../../../proto/vtadmin';
import style from './WorkflowTablets.module.scss';

interface Props {
    clusterID: string;
    keyspace: string;
    workflow: string;
}

interface Series {
    name: string;
    data: number[];
}

interface TabletVarsResponse {
    tablet: { cell: string; uid: number };
    vars: TabletVars;
}

export const WorkflowTablets = ({ clusterID, keyspace, workflow }: Props) => {
    const { data } = useWorkflow({ clusterID, keyspace, name: workflow });
    const shardStreams = Object.values(data?.workflow?.shard_streams || {});
    const tablets = flatten(shardStreams.map((s) => s.streams?.map((st) => st.tablet)));

    const tabletQueries = useQueries(
        tablets.map((t) => ({
            queryKey: ['/debug/vars', t?.uid],
            queryFn: async () => {
                const tv = await fetchTabletVars(t?.uid || 101);
                return { tablet: t, vars: tv };
            },
        }))
    ) as UseQueryResult<TabletVarsResponse, any>[];

    const qpsSeries = tabletQueries.reduce((acc, tq) => {
        if (!tq.data) {
            return acc;
        }

        const { tablet, vars } = tq.data;
        const d = tq.data.vars.VReplicationQPS;

        acc.push({
            name: `${tablet.cell}-${tablet.uid} Query`,
            data: d.Query,
        });

        // console.log(tq);

        return acc;
    }, [] as Series[]);

    const options = {
        title: {
            text: 'VReplication QPS by Tablet',
        },
        series: qpsSeries,
    };
    console.log(qpsSeries);

    // const tr = useQuery<any, any>(
    //     ['/debug/vars', tablet?.tablet?.alias?.uid],

    //     { refetchInterval: 1000 }
    // );

    // console.log(tr);
    return (
        <div className={style.container}>
            <HighchartsReact highcharts={Highcharts} options={options} />
        </div>
    );
};
