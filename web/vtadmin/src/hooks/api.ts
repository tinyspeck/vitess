import { useQuery } from 'react-query';
import { vtadmin as pb } from '../proto/vtadmin';

interface HttpOkResponse {
    ok: true;
    result: any;
}

interface HttpErrorResponse {
    ok: false;
}

type HttpResponse = HttpOkResponse | HttpErrorResponse;

export const useTablets = () =>
    useQuery(['tablets'], async () => {
        const response = await fetch(`http://${process.env.REACT_APP_VTADMIN_API_ADDRESS}/api/tablets`);
        const js: HttpResponse = await response.json();

        if (!js.ok) {
            throw Error('was not ok');
        }

        const tablets = js.result.tablets.map((t: any) => pb.Tablet.create(t));
        return tablets;
    });
