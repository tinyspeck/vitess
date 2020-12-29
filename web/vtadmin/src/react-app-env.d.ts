/// <reference types="react-scripts" />

// We use create-react-app's environment variable system under the hood,
// which is well-documented at https://create-react-app.dev/docs/adding-custom-environment-variables.
//
// Most notably, in addition to
declare namespace NodeJS {
    // ProcessEnv variables can be accessed under `process.env`;
    interface ProcessEnv {
        NODE_ENV: 'development' | 'production' | 'test';
        PUBLIC_URL: string;

        // The full address of vtadmin-api, such as "https://vtadmin-api.example.com:12345"
        // or "127.0.0.1:15999".
        REACT_APP_VTADMIN_API_ADDRESS: string;
    }
}

interface Window {}
