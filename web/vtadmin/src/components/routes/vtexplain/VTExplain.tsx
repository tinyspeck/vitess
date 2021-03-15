import * as React from 'react';
import { orderBy } from 'lodash-es';

import { useClusters, useKeyspaces } from '../../../hooks/api';
import { Button } from '../../Button';
import { Select } from '../../inputs/Select';
import style from './VTExplain.module.scss';
import { vtadmin as pb } from '../../../proto/vtadmin';
import { Label } from '../../inputs/Label';

export const VTExplain = () => {
    const [cluster, setCluster] = React.useState<pb.Cluster | null | undefined>(null);
    const [keyspace, setKeyspace] = React.useState<pb.Keyspace | null | undefined>(null);
    const [sql, setSql] = React.useState<string | null>(null);

    const { data: clusters = [] } = useClusters();
    const { data: keyspaces = [] } = useKeyspaces();

    const onSubmit = () => {
        console.log();
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
                            <Button type="submit">Run query</Button>
                            <Button secondary type="reset">
                                Reset
                            </Button>
                        </div>
                    </form>
                </div>
                <div className={style.outputPanel}>output</div>
            </div>
        </div>
    );
};
