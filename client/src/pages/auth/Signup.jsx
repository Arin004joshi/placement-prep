import { UserPlus } from "lucide-react";
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import ErrorState from "../../components/ui/ErrorState";
import Input from "../../components/ui/Input";
import { useAuth } from "../../context/AuthContext";
import { getErrorMessage } from "../../utils/formatters";
import AuthShell from "./AuthShell";

const Signup = () => {
  const { isAuthenticated, signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await signup(form);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "Unable to create account"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell title="Create account" subtitle="Start with structured CS interview preparation.">
      <form className="space-y-4" onSubmit={handleSubmit}>
        {error ? <ErrorState title="Signup failed" message={error} /> : null}
        <Input
          label="Name"
          value={form.name}
          onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          required
        />
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          required
        />
        <Input
          label="Password"
          type="password"
          minLength={8}
          value={form.password}
          onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          required
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          <UserPlus className="h-4 w-4" aria-hidden="true" />
          {isSubmitting ? "Creating account" : "Create account"}
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link className="font-semibold text-brand hover:text-blue-700" to="/login">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
};

export default Signup;
