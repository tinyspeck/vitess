import { useQuery } from 'react-query';
import { fetchKeyspaces, fetchTablets } from '../api/http';
import { vtadmin as pb } from '../proto/vtadmin';

export const useTablets = () => {
    return useQuery<pb.Tablet[], Error>(['tablets'], async () => {
        return await fetchTablets();
    });
};

export const useKeyspaces = () => {
    return useQuery<pb.Keyspace[], Error>(['keyspaces'], async () => {
        return await fetchKeyspaces();
    });
};
