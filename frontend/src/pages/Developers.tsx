import { useEffect, useState } from "react";
import api from "../services/api";

export default function Developers() {
  const [devs, setDevs] = useState([]);

  useEffect(() => {
    api.get("/developers").then(res => setDevs(res.data));
  }, []);

  return (
    <div>
      <h2>Developers</h2>
      {devs.map((d: any) => (
        <div key={d.id}>
          {d.name} - Stress: {d.stress_score}
        </div>
      ))}
    </div>
  );
}
