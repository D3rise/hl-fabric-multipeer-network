import { Outlet, Link } from "react-router-dom";

function App() {
  return (
    <div className="App">
      <h2>Shop Manager - HyperLedger</h2>
      <nav>
        <Link to="login">Log In</Link> | {" "}
        <Link to="signup">Sign Up</Link>
      </nav>

      <div className="content">
        <Outlet />
      </div>
    </div>
  );
}

export default App;
