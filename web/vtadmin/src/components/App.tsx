import { useTablets } from "../hooks/apiQueries";
import logo from "../img/logo.svg";
import style from "./App.module.scss";

export const App = () => {
  const tq = useTablets();
  const tablets = tq.data || [];

  return (
    <div className={style.container}>
      <img src={logo} className="App-logo" alt="logo" width={200} />
      <h1>VTAdmin</h1>
      <table className={style.table}>
        <thead>
          <tr>
            <th>Cluster</th>
            <th>Hostname</th>
            <th>Keyspace</th>
          </tr>
        </thead>
        <tbody>
          {tablets.map((t, idx) => (
            <tr key={idx}>
              <td>{t.cluster?.name}</td>
              <td>{t.tablet?.hostname}</td>
              <td>{t.tablet?.keyspace}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
