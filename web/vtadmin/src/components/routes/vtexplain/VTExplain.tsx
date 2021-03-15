import * as React from 'react';
import { orderBy } from 'lodash-es';
import AceEditor from 'react-ace';

import 'ace-builds/src-noconflict/mode-mysql';
import 'ace-builds/src-noconflict/theme-github';

import { useClusters, useKeyspaces } from '../../../hooks/api';
import { Button } from '../../Button';
import { Select } from '../../inputs/Select';
import style from './VTExplain.module.scss';
import { vtadmin as pb } from '../../../proto/vtadmin';
import { Label } from '../../inputs/Label';
import { useQuery } from 'react-query';
import { fetchVTExplain, HttpResponseNotOkError } from '../../../api/http';
import { Code } from '../../Code';
import { useURLQuery } from '../../../hooks/useURLQuery';

export const VTExplain = () => {
    const urlQuery = useURLQuery();

    const [clusterName, setClusterName] = React.useState<string | null | undefined>(urlQuery.query.cluster as string);
    const [keyspaceName, setKeyspaceName] = React.useState<string | null | undefined>(
        urlQuery.query.keyspace as string
    );

    // const [cluster, setCluster] = React.useState<pb.Cluster | null | undefined>(null);
    // const [keyspace, setKeyspace] = React.useState<pb.Keyspace | null | undefined>(null);
    const [sql, setSql] = React.useState<string | null>(null);

    const { data: clusters = [] } = useClusters();
    const { data: keyspaces = [] } = useKeyspaces();

    const cluster = clusters.find((c) => c.name === clusterName) || null;
    const keyspacesForCluster = clusterName ? keyspaces.filter((k) => k.cluster?.name === clusterName) : [];
    const keyspace = keyspacesForCluster.find((k) => k.keyspace?.name === keyspaceName);

    const vtexplainQuery = useQuery<any, Error>(
        ['vtexplain', clusterName, keyspaceName, sql],
        () => {
            return fetchVTExplain({ cluster: cluster?.id, keyspace: keyspace?.keyspace?.name, sql });
        },
        {
            enabled: false,
            keepPreviousData: true,
            retry: false,
        }
    );

    const onChangeCluster = (c: pb.Cluster | null | undefined) => {
        setClusterName(c?.name);
        urlQuery.replaceQuery({ cluster: c?.name });
    };

    const onChangeKeyspace = (k: pb.Keyspace | null | undefined) => {
        setKeyspaceName(k?.keyspace?.name);
        urlQuery.replaceQuery({ keyspace: k?.keyspace?.name });
    };

    const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();
        console.log();
        vtexplainQuery.refetch();
    };

    const onReset = () => {
        setClusterName(null);
        setKeyspaceName(null);
        setSql(null);
    };

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
                                onChange={onChangeCluster}
                                placeholder="Pick a cluster"
                                renderItem={(i) => i?.name || ''}
                                selectedItem={clusters.find((c) => c.name === clusterName) || null}
                            />
                        </div>
                        <div className={style.formRow}>
                            <Select
                                disabled={!clusterName}
                                itemToString={(k) => k?.keyspace?.name || ''}
                                items={orderBy(keyspacesForCluster, 'keyspace.name')}
                                label="Keyspace"
                                onChange={onChangeKeyspace}
                                placeholder="Pick a keyspace"
                                renderItem={(k) => k?.keyspace?.name || ''}
                                selectedItem={
                                    keyspacesForCluster.find((k) => k.keyspace?.name === keyspaceName) || null
                                }
                            />
                        </div>
                        <div className={style.formRow}>
                            <Label label="VTExplain Query" />
                            <AceEditor
                                className={style.editor}
                                defaultValue={''}
                                highlightActiveLine={false}
                                minLines={12}
                                maxLines={16}
                                mode="mysql"
                                onChange={(s) => setSql(s)}
                                theme="github"
                            />
                        </div>
                        <div className={style.buttonRow}>
                            <Button
                                disabled={!clusterName || !keyspaceName || !sql || vtexplainQuery.isFetching}
                                type="submit"
                            >
                                Run query
                            </Button>
                            <Button
                                disabled={!clusterName || !keyspaceName || !sql || vtexplainQuery.isFetching}
                                onClick={onReset}
                                secondary
                            >
                                Reset
                            </Button>
                        </div>
                    </form>
                </div>
                <div className={style.outputPanel}>
                    <Code
                        code={
                            vtexplainQuery.data?.ok
                                ? vtexplainQuery.data?.result.response
                                : JSON.stringify(vtexplainQuery.data, null, 2)
                        }
                    />
                </div>
            </div>
        </div>
    );
};
