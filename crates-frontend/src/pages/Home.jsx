import "./Home.css";
import { useState } from "react";
import { toast } from 'sonner';

export default function Home() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });

  const [formType, setFormType] = useState("login");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const signup = (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      toast.error("Username and password are required");
      console.log("Username and password are required");
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      console.log("Passwords do not match");
      return;
    }
    console.log("Sign up pressed:", form.username, form.password);
  };

  const login = (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      toast.error("Username and password are required");
      console.log("Username and password are required");
      return;
    }
    console.log("Login pressed:", form.username, form.password);
  };

  const switchForm = (e, type) => {
    e.preventDefault();
    setFormType(type);
  };

  return (
    <div id="home">
      <div id="main">
        <div id="header">
          <h1>Crates</h1>
        </div>

        {formType === "login" && (
          <div className="form-container">
            <form id="login-form" onSubmit={login} className="form">
              <input
                className="input-field"
                type="text"
                name="username"
                placeholder="Username"
                value={form.username}
                onChange={handleChange}
              />
              <input
                className="input-field"
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
              />
              <button className="button" type="submit">
                Login
              </button>
              <p className="text-center">
                Don't have an account?{" "}
                <a href="#" onClick={(e) => switchForm(e, "signup")}>
                  Sign up
                </a>
              </p>
            </form>
          </div>
        )}

        {formType === "signup" && (
          <div className="form-container">
            <form id="signup-form" onSubmit={signup} className="form">
              <input
                className="input-field"
                type="text"
                name="username"
                placeholder="Username"
                value={form.username}
                onChange={handleChange}
              />
              <input
                className="input-field"
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
              />
              <input
                className="input-field"
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChange={handleChange}
              />
              <button className="button" type="submit">
                Sign up
              </button>
              <p className="text-center">
                Already have an account?{" "}
                <a href="#" onClick={(e) => switchForm(e, "login")}>
                  Login
                </a>
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}