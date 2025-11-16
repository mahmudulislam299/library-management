import React, { useContext } from "react";
import Home from "./Pages/Home";
import Signin from "./Pages/Signin";
import {
  BrowserRouter as Router,
  Switch,
  Redirect,
  Route,
} from "react-router-dom";
import MemberDashboard from "./Pages/Dashboard/MemberDashboard/MemberDashboard.js";
import Allbooks from "./Pages/Allbooks";
import Header from "./Components/Header";
import AdminDashboard from "./Pages/Dashboard/AdminDashboard/AdminDashboard.js";
import { AuthContext } from "./Context/AuthContext.js";

function App() {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.isAdmin === true;

  return (
    <Router>
      <Header />
      <div className="App">
        <Switch>
          {/* Home */}
          <Route exact path="/">
            {user
              ? isAdmin
                ? <Redirect to="/dashboard@admin" />
                : <Redirect to="/dashboard@member" />
              : <Home />}
          </Route>

          {/* Signin */}
          <Route exact path="/signin">
            {user
              ? isAdmin
                ? <Redirect to="/dashboard@admin" />
                : <Redirect to="/dashboard@member" />
              : <Signin />}
          </Route>

          {/* Member Dashboard (Student / Employee) */}
          <Route exact path="/dashboard@member">
            {user
              ? isAdmin
                ? <Redirect to="/dashboard@admin" />
                : <MemberDashboard />
              : <Redirect to="/signin" />}
          </Route>

          {/* Admin Dashboard */}
          <Route exact path="/dashboard@admin">
            {user
              ? isAdmin
                ? <AdminDashboard />
                : <Redirect to="/dashboard@member" />
              : <Redirect to="/signin" />}
          </Route>

          {/* All Books (public or keep like this for now) */}
          <Route exact path="/books">
            <Allbooks />
          </Route>

          {/* Fallback */}
          <Route path="*">
            <Redirect to="/" />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
