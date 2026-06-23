import React, { useContext, useState} from "react";
import { Link, useNavigate } from "react-router-dom";
import { validateEmail } from "../../utils/helper";
import axiosInstance from "../../utils/axiosInstance.js";
import { API_PATHS } from "../../utils/apiPaths.js";
import { UserContext } from "../../context/userContext.jsx";
import { HiCheckCircle, HiUsers, HiClipboardList, HiChartBar } from 'react-icons/hi';
import { LuArrowLeft, LuEye, LuEyeOff } from "react-icons/lu";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { updateUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
      e.preventDefault();

      if (!validateEmail(email)) {
        setError("Please enter a valid email address.");
        return;
      }

      if (!password) {
        setError("Please enter the password.");
        return;
      }

      setError("");
      setIsLoading(true);

      try{
        const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
          email,
          password,
        });

        const { user } = response.data.data;

        if (user) {
          updateUser(user);
          navigate(user.role === "admin" || user.role === "super_admin" ? "/admin/dashboard" : "/user/dashboard");
        }
      }catch (loginError) {
        const message =
          loginError.response?.data?.message ||
          loginError.message ||
          "Something went wrong. Please try again later.";
        setError(message);
      } finally {
        setIsLoading(false);
      }
  }

  return (
    <div className="auth-shell">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-16 left-8 h-72 w-72 rounded-full blur-3xl opacity-40" style={{ background: "rgba(40, 80, 217, 0.18)" }} />
        <div className="absolute top-32 right-8 h-80 w-80 rounded-full blur-3xl opacity-35" style={{ background: "rgba(217, 119, 87, 0.2)" }} />
        <div className="absolute bottom-0 left-1/4 h-64 w-64 rounded-full blur-3xl opacity-30" style={{ background: "rgba(15, 118, 110, 0.16)" }} />
      </div>

      <div className="auth-frame relative z-10">
        <div className="flex flex-col lg:flex-row">
          <div className="auth-brand-panel">
            <div className="absolute inset-0 opacity-20" style={{ background: "radial-gradient(circle at top right, rgba(255,255,255,0.32), transparent 30%)" }} />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-7">
                <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center">
                  <HiCheckCircle className="text-2xl" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-white/70">Trackora</p>
                  <h1 className="text-2xl font-semibold tracking-tight">Control center for work</h1>
                </div>
              </div>

              <h2 className="text-3xl lg:text-4xl font-semibold leading-tight max-w-sm">
                Sign in to a calmer, sharper workspace.
              </h2>
              <p className="text-white/78 mt-4 max-w-md leading-6 text-sm lg:text-base">
                Track work, coordinate your team, and keep delivery visible without the flat basic UI.
              </p>

              <div className="grid gap-3 mt-7">
                <FeatureItem icon={HiClipboardList} title="Organized task views" text="Clear status grouping, better hierarchy, less visual noise." />
                <FeatureItem icon={HiUsers} title="Team visibility" text="People, ownership, and progress stay readable at a glance." />
                <FeatureItem icon={HiChartBar} title="Sharper reporting" text="Dashboards and activity feel like a product, not a starter template." />
              </div>
            </div>
          </div>

          <div className="auth-form-panel flex items-center">
            <div className="w-full max-w-md mx-auto">
              <div className="mb-7 flex justify-start">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:-translate-x-0.5 hover:text-slate-900"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-600 shadow-sm">
                    <LuArrowLeft className="text-base" />
                  </span>
                  Back to Home
                </Link>
              </div>

              <p className="soft-label">Welcome Back</p>
              <h3 className="text-3xl font-semibold text-slate-900 mt-2">Sign In</h3>
              <p className="text-slate-500 mt-2 mb-5">Enter your credentials to access your workspace.</p>

              <form onSubmit={handleLogin} className="space-y-3.5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  <input
                    className="form-input mt-0"
                    placeholder="you@company.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                  <div className="password-input-shell mt-0">
                    <input
                      className="form-input password-input mt-0"
                      placeholder="Enter your password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <LuEye /> : <LuEyeOff />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <button type="submit" disabled={isLoading} className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
                  {isLoading ? "Signing In..." : "Sign In"}
                </button>

                <p className="text-center text-sm text-slate-600">
                  Don't have an account?{" "}
                  <Link className="text-primary font-semibold hover:underline" to="/signUp">
                    Create Account
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const FeatureItem = ({ icon: Icon, title, text }) => (
  <div className="flex items-start gap-3 rounded-[20px] border border-white/15 bg-white/8 px-4 py-3 backdrop-blur-sm">
    <div className="w-9 h-9 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
      <Icon className="text-lg" />
    </div>
    <div>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-[13px] text-white/72 mt-1 leading-5">{text}</p>
    </div>
  </div>
);

export default Login
