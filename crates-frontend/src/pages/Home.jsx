import "./Home.css";
import { useState } from "react";

export default function Home() {
  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [formType, setFormType] = useState("login");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div id="home">
      <div id="main">
        <div id="header">
          <h1>Crates</h1>
        </div>
        {formType === "login" && (
          <div className="form-container">
            <form className="form">
              <input
                className="input-field"
                type="text"
                placeholder="Username"
                onChange={handleChange}
              />
              <input
                className="input-field"
                type="password"
                placeholder="Password"
                onChange={handleChange}
              />
              <button className="button" type="submit">
                Login
              </button>
              <p className="text-center">
                Don't have an account?{" "}
                <a onClick={() => setFormType("signup")}>Sign up</a>
              </p>
            </form>
          </div>
        )}

        {formType === "signup" && (
          <div className="form-container">
            <form className="form">
              <input
                className="input-field"
                type="text"
                placeholder="Username"
                onChange={handleChange}
              />
              <input
                className="input-field"
                type="password"
                placeholder="Password"
                onChange={handleChange}
              />
              <input
                className="input-field"
                type="password"
                placeholder="Confirm Password"
                onChange={handleChange}
              />
              <button className="button" type="submit">
                Sign up
              </button>
              <p className="text-center">
                Already have an account?{" "}
                <a onClick={() => setFormType("login")}>Login</a>
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
