import { useEffect, useState } from "react";
import api from "../services/api";

export default function Bugs() {
  const [bugs, setBugs] = useState<any[]>([]);

  useEffect(() => {
    api.get("/bugs").then(res => setBugs(res.data));
  }, []);

  return (
    <div>
      <h2>Bugs</h2>
      {bugs.map(b => (
        <div key={b.id}>
          {b.title} - {b.status}
        </div>
      ))}
    </div>
  );
}
