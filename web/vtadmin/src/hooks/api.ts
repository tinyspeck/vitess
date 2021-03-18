import { useQuery, useQueryClient } from 'react-query';
import {
    fetchClusters,
    fetchGates,
    fetchKeyspaces,
    fetchSchema,
    FetchSchemaParams,
    fetchSchemas,
    fetchTablets,
    fetchWorkflow,
    FetchWorkflowParams,
    fetchWorkflows,
} from '../api/http';
import { vtadmin as pb } from '../proto/vtadmin';

export const useClusters = () => useQuery<pb.Cluster[], Error>(['clusters'], fetchClusters);
export const useGates = () => useQuery<pb.VTGate[], Error>(['gates'], fetchGates);
export const useKeyspaces = () => useQuery<pb.Keyspace[], Error>(['keyspaces'], fetchKeyspaces);
export const useSchemas = () => useQuery<pb.Schema[], Error>(['schemas'], fetchSchemas);
export const useTablets = () => useQuery<pb.Tablet[], Error>(['tablets'], fetchTablets);
export const useWorkflows = () =>
    useQuery<pb.GetWorkflowsResponse, Error>(['workflows'], fetchWorkflows, {
        refetchInterval: 1000,
    });
export const useWorkflowsList = () => {
    const query = useWorkflows();
    const { data, ...response } = query;

    if (!data) return { data: undefined, ...response };

    const workflows = Object.values(data.workflows_by_cluster || {}).reduce((acc, cw) => {
        (cw.workflows || []).forEach((w) => {
            acc.push(pb.Workflow.create(w));
        });
        return acc;
    }, [] as pb.Workflow[]);

    return { data: workflows, ...response };
};

export interface TableDefinition {
    cluster?: pb.Schema['cluster'];
    keyspace?: pb.Schema['keyspace'];
    // The [0] index is a typescript quirk to infer the type of
    // an entry in an array, and therefore the type of ALL entries
    // in the array (not just the first one).
    tableDefinition?: pb.Schema['table_definitions'][0];
}

// useTableDefinitions is a helper hook for when a flattened list
// of table definitions (across all keyspaces and clusters) is required,
// instead of the default vtadmin-api/Vitess grouping of schemas by keyspace.
//
// Under the hood, this calls the useSchemas hook and therefore uses
// the same query cache.
export const useTableDefinitions = () => {
    const { data, ...query } = useSchemas();

    if (!Array.isArray(data)) {
        return { data, ...query };
    }

    const tds = data.reduce((acc: TableDefinition[], schema: pb.Schema) => {
        (schema.table_definitions || []).forEach((td) => {
            acc.push({
                cluster: schema.cluster,
                keyspace: schema.keyspace,
                tableDefinition: td,
            });
        });
        return acc;
    }, []);

    return { ...query, data: tds };
};

export const useSchema = (params: FetchSchemaParams) => {
    const queryClient = useQueryClient();
    return useQuery<pb.Schema, Error>(['schema', params], () => fetchSchema(params), {
        initialData: () => {
            const schemas = queryClient.getQueryData<pb.Schema[]>('schemas');
            return (schemas || []).find(
                (s: pb.Schema) =>
                    s.cluster?.id === params.clusterID &&
                    s.keyspace === params.keyspace &&
                    s.table_definitions.find((td) => td.name === params.table)
            );
        },
    });
};

export const useWorkflow = (params: FetchWorkflowParams) => {
    const queryClient = useQueryClient();
    return useQuery<pb.IWorkflow, Error>(['workflow', params], () => fetchWorkflow(params), {
        initialData: () => {
            const workflows = queryClient.getQueryData<pb.GetWorkflowsResponse>('workflows');
            const wc = workflows?.workflows_by_cluster[params.clusterID];
            return (wc?.workflows || []).find(
                (w) => w.keyspace === params.keyspace && w.workflow?.name === params.name
            );
        },
        refetchInterval: 1000,
    });
};
