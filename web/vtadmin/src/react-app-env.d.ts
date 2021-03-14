/// <reference types="react-scripts" />
declare namespace NodeJS {
    interface ProcessEnv {
        NODE_ENV: 'development' | 'production' | 'test';
        PUBLIC_URL: string;

        // Required. The full address of vtadmin-api's HTTP interface.
        // Example: "http://127.0.0.1:12345"
        REACT_APP_VTADMIN_API_ADDRESS: string;

        // Optional. Configures the `credentials` property for fetch requests.
        // made against vtadmin-api. If unspecified, uses fetch defaults.
        // See https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#sending_a_request_with_credentials_included
        REACT_APP_FETCH_CREDENTIALS?: RequestCredentials;

        // Optional but strongly recommended.
        // Example: "https://{{hostname}}.foo.test.com:1234"
        REACT_APP_TABLET_LINK_TEMPLATE?: string;
    }
}

interface Window {}

declare module '@fnando/sparkline' {
    var x: any;
    export = x;
}
