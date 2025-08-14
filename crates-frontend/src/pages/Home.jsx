import "./Home.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { API_URL } from "../config";
import argon2 from "argon2-browser/dist/argon2-bundled.min.js";
import {
  uint8ArrayToHex,
  hexToUint8Array,
  generateSalt,
  generateHash,
} from "../utils/crypto.js";

const validatePasswordStrength = (password) => {
  if (!password || password.length < 8) {
    return {
      isValid: false,
      message: "Password must be at least 8 characters",
    };
  }

  // Check for each character type
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  // Count how many requirements are met
  const requirementsMet = [
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialChar,
  ].filter(Boolean).length;

  if (requirementsMet < 3) {
    return {
      isValid: false,
      message:
        "Password must contain any 3: uppercase, lowercase, numbers, special characters.",
    };
  }

  return { isValid: true, message: "" };
};

export default function Home() {
  const navigate = useNavigate();
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
    const passwordWarning = document.getElementById("password-warning");
    if (!form.username || !form.password) {
      toast.error("Username and password are required");
      return;
    }

    const passwordValidation = validatePasswordStrength(form.password);
    if (!passwordValidation.isValid) {
      toast.error("Weak password");
      passwordWarning.innerText = passwordValidation.message;
      return;
    }

    // Clear the warning if password is valid
    passwordWarning.innerText = "";

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    attemptSigup(form.username, form.password);
  };

  async function attemptSigup(username, password) {
    // generate salts
    // generate encryption and auth hashes
    // send salts + auth hash + username

    let argon2_params = {
      type: argon2.ArgonType.Argon2id,
      time: 3,
      mem: 65536,
      hashLen: 32,
      parallelism: 4,
    };

    try {
      // try to get salt for user. if not found, we will know username is available
      const res = await fetch(`${API_URL}/api/auth/salts?username=${username}`);
      if (res.ok) {
        toast.error("Username already used");
        console.log("Username already used");
        return;
      } else if (res.status !== 404) {
        const error = await res.json();
        toast.error(error.message || "An error occurred. Please try again.");
        console.error("Error checking username:", error);
        return;
      }
    } catch (err) {
      console.log(err);
      toast.error("Failed to connect to the server. Please try again later.");
      return;
    }

    const auth_salt = generateSalt(16);
    const encryption_salt = generateSalt(16);
    const auth_hash = await generateHash(password, auth_salt, argon2_params);

    try {
      const res = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          auth_hash: auth_hash,
          auth_salt: uint8ArrayToHex(auth_salt),
          encryption_salt: uint8ArrayToHex(encryption_salt),
        }),
      });
      if (res.ok) {
        toast.success("Account created successfully! Please log in.");
        setFormType("login");
      } else {
        const error = await res.json();
        toast.error(error.message || "Signup failed. Please try again.");
        console.error("Signup failed:", error);
      }
    } catch (err) {
      console.log(err);
      toast.error("An error occurred during signup. Please try again.");
    }
  }

  const login = (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      toast.error("Username and password are required");
      console.log("Username and password are required");
      return;
    }
    attemptLogin(form.username, form.password);
  };

  async function attemptLogin(username, password) {
    // fetch user salt
    // gen hash
    // send hash + user and attempt to establish session
    try {
      const res = await fetch(`${API_URL}/api/auth/salts?username=${username}`);
      if (!res.ok) {
        toast.error("Invalid username or password.");
        console.log("Failed to fetch salts for user.");
        return;
      }
      const { auth_salt, encryption_salt, argon2_params } = await res.json();

      const auth_hash = await generateHash(
        password,
        hexToUint8Array(auth_salt),
        argon2_params,
      );
      
      const loginRes = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          username: username,
          auth_hash: auth_hash,
        }),
      });

      if (loginRes.ok) {
        toast.success("Login successful!");

        const encryption_key = await generateHash(
          password,
          hexToUint8Array(encryption_salt),
          argon2_params,
        );
        sessionStorage.setItem("encryption_key", encryption_key);

        navigate("/secrets");
      } else {
        const error = await loginRes.json();
        toast.error(error.message || "Login failed.");
      }

    } catch (err) {
      console.error(err);
      toast.error("Failed to connect to the server. Please try again later.");
    }
  }

  const switchForm = (e, type) => {
    e.preventDefault();
    setFormType(type);
  };

  return (
    <div id="home-container">
      <div id="home">
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
              <p id="password-warning" className="text-center"></p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}