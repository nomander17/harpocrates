import "./Home.css";
import { useState } from "react";
import { toast } from "sonner";
import { API_URL } from "../config";
import argon2 from "argon2-browser/dist/argon2-bundled.min.js";

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
    attemptLogin(form.password);
  };

  async function attemptLogin(password) {
    // fetch user salt
    // gen hash
    // send hash + user and attempt to establish session
    try {
      const res = await fetch(`${API_URL}/api/auth/salts?email=user`);
      const { auth_salt, encryption_salt } = await res.json();

      const userAuthHash = generateAuthenticationHash(password, auth_salt);
      console.log(userAuthHash);
    } catch (err) {
      console.error(err);
    }

    // todo rest
  }

  async function generateAuthenticationHash(password, auth_salt) {
    const hash = await argon2.hash({
      pass: password,
      salt: auth_salt,
      type: argon2.ArgonType.Argon2id,
      time: 3,
      mem: 4096,
      hashLen: 32,
      parallelism: 1,
    });

    console.log("Hash hex:", hash.hashHex);
    console.log("Encoded:", hash.encoded);

    return hash.hashHex;
  }

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
