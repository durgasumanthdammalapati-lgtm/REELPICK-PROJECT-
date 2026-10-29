import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import FormField from "../components/FormField";

function validate({ name, email, password, confirm }) {
  const errors = {};
  if (name.trim().length < 2) errors.name = "Enter your name (at least 2 characters).";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = "Enter a valid email address.";
  if (password.length < 8) errors.password = "Use at least 8 characters.";
  else if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) errors.password = "Include at least one letter and one number.";
  if (confirm !== password) errors.confirm = "Passwords do not match.";
  return errors;
}

export default function Signup() {
  const { signup } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    setFormError("");
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    try {
      await signup(form); // on success the route guard redirects automatically
    } catch (err) {
      setFormError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <section className="auth">
      <div className="auth-card">
        <h1>Create your account</h1>
        <p className="auth-sub">It takes a minute. Then start liking movies.</p>

        <form onSubmit={handleSubmit} noValidate>
          <FormField
            id="name"
            label="Name"
            autoComplete="name"
            value={form.name}
            onChange={update("name")}
            error={errors.name}
          />
          <FormField
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={update("email")}
            error={errors.email}
          />
          <FormField
            id="password"
            label="Password"
            type="password"
            autoComplete="new-password"
            hint="At least 8 characters, with a letter and a number."
            value={form.password}
            onChange={update("password")}
            error={errors.password}
          />
          <FormField
            id="confirm"
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            value={form.confirm}
            onChange={update("confirm")}
            error={errors.confirm}
          />

          {formError && (
            <p className="form-error" role="alert">
              {formError}
            </p>
          )}

          <button type="submit" className="btn btn-on btn-block" disabled={submitting}>
            {submitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </section>
  );
}
