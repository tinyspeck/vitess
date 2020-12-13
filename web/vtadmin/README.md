# VTAdmin
## Getting Started


- Install node v.12.13.0
- From the web/vtadmin/ directory, install dependencies with `npm install`
- Start a local vtadmin-web server on [http://localhost:3000](http://localhost:3000) with `npm start`

For more detail, see the [Developer's Guide](#developers-guide).

## Available Scripts

In the project directory, you can run:

|   |   |
|---|---|
| `npm start` | Runs the app in the development mode. Open [http://localhost:3000](http://localhost:3000) to view it in the browser. The page will reload if you make edits. You will also see any lint errors in the console.
| `npm test` | Launches the test runner in the interactive watch mode. See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.
| `npm run build` | Builds the app for production to the `build` folder. It correctly bundles React in production mode and optimizes the build for the best performance. The build is minified and the filenames include the hashes. Your app is ready to be deployed! See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.
| `npm run eject` | **Note: this is a one-way operation. Once you `eject`, you can’t go back!** If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project. Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own. You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app) v.4.0.1.

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

## Developer's Guide

This section is for those wanting to make changes to VTAdmin. 🎉

### Environment Variables

VTAdmin is configured with `process.env` environment variables. Available environment variables are defined and documented in [react-app-env.d.ts](./src/react-app-env.d.ts). (As a bonus, this gives us TypeScript autocompletion for `process.env`.)

Adding and using environment variables is described in depth in the create-react-app documentation on ["Adding Custom Environment Variables"](https://create-react-app.dev/docs/adding-custom-environment-variables).
