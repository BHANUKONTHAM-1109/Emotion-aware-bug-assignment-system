import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div>
      <h2>Emotion Aware Bug Assignment Dashboard</h2>
      <nav>
        <Link to="/bugs">Bugs</Link> | 
        <Link to="/developers">Developers</Link> | 
        <Link to="/analytics">Analytics</Link>
      </nav>
    </div>
  );
}
