import * as React from 'react';
import { orderBy } from 'lodash-es';

import { useClusters, useKeyspaces } from '../../../hooks/api';
import { Button } from '../../Button';
import { Select } from '../../inputs/Select';
import style from './VTExplain.module.scss';
import { vtadmin as pb } from '../../../proto/vtadmin';
import { Label } from '../../inputs/Label';
import { useQuery } from 'react-query';
import { fetchVTExplain } from '../../../api/http';
import { Code } from '../../Code';

export const VTExplain = () => {
    const [cluster, setCluster] = React.useState<pb.Cluster | null | undefined>(null);
    const [keyspace, setKeyspace] = React.useState<pb.Keyspace | null | undefined>(null);
    const [sql, setSql] = React.useState<string | null>(null);

    const { data: clusters = [] } = useClusters();
    const { data: keyspaces = [] } = useKeyspaces();

    const vtexplainQuery = useQuery(
        ['vtexplain', cluster, keyspace, sql],
        () => {
            return fetchVTExplain({ cluster: cluster?.id, keyspace: keyspace?.keyspace?.name, sql });
        },
        { enabled: false }
    );

    const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();
        console.log();
        vtexplainQuery.refetch();
    };

    const keyspacesForCluster = cluster ? keyspaces.filter((k) => k.cluster?.id === cluster.id) : [];

    return (
        <div>
            <h1>VTExplain</h1>
            <div className={style.container}>
                <div className={style.formPanel}>
                    <form className={style.form} onSubmit={onSubmit}>
                        <div className={style.formRow}>
                            <Select
                                itemToString={(i) => i?.name || ''}
                                items={orderBy(clusters, 'name')}
                                label="Cluster"
                                onChange={(c) => setCluster(c)}
                                placeholder="Pick a cluster"
                                renderItem={(i) => i?.name || ''}
                                selectedItem={cluster}
                            />
                        </div>
                        <div className={style.formRow}>
                            <Select
                                disabled={!cluster}
                                itemToString={(k) => k?.keyspace?.name || ''}
                                items={orderBy(keyspacesForCluster, 'keyspace.name')}
                                label="Keyspace"
                                onChange={(k) => setKeyspace(k)}
                                placeholder="Pick a keyspace"
                                renderItem={(k) => k?.keyspace?.name || ''}
                                selectedItem={keyspace}
                            />
                        </div>
                        <div className={style.formRow}>
                            <Label label="VTExplain Query" />
                            <textarea
                                className={style.sqlInput}
                                onChange={(e) => setSql(e.target.value)}
                                value={sql || ''}
                            />
                        </div>
                        <div className={style.buttonRow}>
                            <Button disabled={!cluster || !keyspace || !sql || vtexplainQuery.isFetching} type="submit">
                                Run query
                            </Button>
                            <Button
                                disabled={!cluster || !keyspace || !sql || vtexplainQuery.isFetching}
                                secondary
                                type="reset"
                            >
                                Reset
                            </Button>
                        </div>
                    </form>
                </div>
                <div className={style.outputPanel}>
                    <Code code={vtexplainQuery.data?.response} />
                </div>
            </div>
        </div>
    );
};
