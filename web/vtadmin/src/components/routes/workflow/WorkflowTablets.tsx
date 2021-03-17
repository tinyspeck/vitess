import * as React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

import { flatten } from 'lodash';
import { useQueries, UseQueryResult } from 'react-query';
import { fetchTabletVars, TabletVars } from '../../../api/tablet';
import { useTablets, useWorkflow } from '../../../hooks/api';
import style from './WorkflowTablets.module.scss';
import { uniqBy } from 'lodash-es';
import { vtadmin as pb } from '../../../proto/vtadmin';

interface Props {
    clusterID: string;
    keyspace: string;
    workflow: string;
}

interface Series {
    name: string;
    data: [number, number][];
}

interface TabletVarsResponse {
    tablet: pb.Tablet;
    vars: TabletVars;
}

export const WorkflowTablets = ({ clusterID, keyspace, workflow }: Props) => {
    const { data } = useWorkflow({ clusterID, keyspace, name: workflow });
    const { data: allTablets = [] } = useTablets();

    const shardStreams = Object.values(data?.workflow?.shard_streams || {});
    const tablets = uniqBy(flatten(shardStreams.map((s) => s.streams?.map((st) => st.tablet))), 'cell')
        .map((ta) => allTablets.find((tt) => tt.tablet?.alias?.cell === ta?.cell && tt.tablet?.alias?.uid === ta?.uid))
        .filter((tt) => !!tt) as pb.Tablet[];

    const tabletQueries = useQueries(
        tablets.map((t) => ({
            queryKey: ['/debug/vars', t],
            queryFn: async () => {
                const tv = await fetchTabletVars(t);
                return { tablet: t, vars: tv };
            },
            refetchInterval: 1000,
        }))
    ) as UseQueryResult<TabletVarsResponse, any>[];

    const qpsSeries = tabletQueries.reduce((acc, tq) => {
        if (!tq.data) {
            return acc;
        }

        const { dataUpdatedAt } = tq;
        const { tablet, vars } = tq.data;
        const dq = (vars.VReplicationQPS.Query || []).map((d, dx) => {
            const ts = dataUpdatedAt - dx * 1000;
            return [ts, d] as [number, number];
        });

        acc.push({
            name: `${tablet?.tablet?.alias?.cell}-${tablet?.tablet?.alias?.uid} Query`,
            data: dq,
        });

        return acc;
    }, [] as Series[]);

    const options = {
        chart: {
            animation: false,
        },
        series: qpsSeries,
        title: {
            text: 'VReplication QPS by Tablet',
        },
        xAxis: {
            type: 'datetime',
        },
    };

    return (
        <div className={style.container}>
            <HighchartsReact highcharts={Highcharts} options={options} />
        </div>
    );
};
