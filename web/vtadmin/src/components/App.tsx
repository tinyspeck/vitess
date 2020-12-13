import logo from '../img/logo.svg';
import style from './App.module.scss';

export const App = () => {
  return (
    <div className={style.container}>
      <img src={logo} className="App-logo" alt="logo" width={200} />
      <h1>VTAdmin</h1>
      <code>{process.env.REACT_APP_VTADMIN_API_ADDRESS}</code>
    </div>
  );
}
