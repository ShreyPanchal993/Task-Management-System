import React, { useContext, useState } from "react";
import { validateEmail } from "../../utils/helper.js";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance.js";
import { API_PATHS } from "../../utils/apiPaths.js";
import { UserContext } from "../../context/userContext";
import uploadImage from "../../utils/uploadImage.js";
import { HiCheckCircle, HiUsers, HiClipboardList, HiChartBar } from 'react-icons/hi';
import { LuArrowLeft, LuEye, LuEyeOff } from "react-icons/lu";

const SignUp = () => {
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { updateUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setProfilePicture(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const getPasswordStrength = (pwd) => {
    if (!pwd) return null;
    if (pwd.length < 6) return { label: "Too short", color: "bg-red-400", width: "w-1/4" };
    if (pwd.length < 8) return { label: "Weak", color: "bg-orange-400", width: "w-2/4" };
    const hasUpper = /[A-Z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecial = /[^A-Za-z0-9]/.test(pwd);
    const score = [hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
    if (score === 3) return { label: "Strong", color: "bg-emerald-500", width: "w-full" };
    if (score >= 1) return { label: "Fair", color: "bg-yellow-400", width: "w-3/4" };
    return { label: "Weak", color: "bg-orange-400", width: "w-2/4" };
  };

  const passwordStrength = getPasswordStrength(password);
      e.preventDefault();

      let uploadedImageUrl = '';

      if (!fullName) {
        setError("Please enter full name.");
        return;
      }
  
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
        const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
          name: fullName,
          email,
          password,
          profilePicture: uploadedImageUrl,
        });

        let { user } = response.data.data;

        if (user) {
          if (profilePicture) {
            try {
              const imageUploadRes = await uploadImage(profilePicture);
              uploadedImageUrl = imageUploadRes.url;

              const profileUpdateResponse = await axiosInstance.patch(API_PATHS.AUTH.GET_PROFILE, {
                name: fullName,
                email,
                profilePicture: uploadedImageUrl,
              });

              user = profileUpdateResponse.data.data;
            } catch {
              // Profile picture upload failed — continue with account without picture
            }
          }

          updateUser(user);
          navigate(user.role === "admin" || user.role === "super_admin" ? "/admin/dashboard" : "/user/dashboard");
        }
      }catch (signupError) {
        const message =
          signupError.response?.data?.message ||
          signupError.message ||
          "Something went wrong. Please try again later.";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

  return(
    <div className="auth-shell">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-12 h-72 w-72 rounded-full blur-3xl opacity-35" style={{ background: "rgba(40, 80, 217, 0.18)" }} />
        <div className="absolute bottom-0 right-12 h-80 w-80 rounded-full blur-3xl opacity-35" style={{ background: "rgba(217, 119, 87, 0.18)" }} />
      </div>

      <div className="auth-frame relative z-10">
        <div className="flex flex-col lg:flex-row">
          <div className="auth-brand-panel">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-7">
                <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center">
                  <HiCheckCircle className="text-2xl" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-white/70">Trackora</p>
                  <h1 className="text-2xl font-semibold tracking-tight">A better-looking workflow</h1>
                </div>
              </div>

              <h2 className="text-3xl lg:text-4xl font-semibold leading-tight max-w-sm">
                Build your team space with structure and style.
              </h2>
              <p className="text-white/78 mt-4 max-w-md leading-6 text-sm lg:text-base">
                Create an account and start managing tasks in a UI that feels cleaner, warmer, and easier to use.
              </p>

              <div className="grid gap-3 mt-7">
                <FeatureItem icon={HiClipboardList} title="Task clarity" text="Create and assign work without cluttered forms or flat cards." />
                <FeatureItem icon={HiUsers} title="Collaboration-ready" text="Roles, ownership, and progress fit into one consistent product language." />
                <FeatureItem icon={HiChartBar} title="Aesthetic dashboards" text="Reports and tracking feel polished instead of default blue-and-white." />
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

              <p className="soft-label">Get Started</p>
              <h3 className="text-3xl font-semibold text-slate-900 mt-2">Create Your Account</h3>
              <p className="text-slate-500 mt-2 mb-5">Set up your profile and start organizing work.</p>

              <form onSubmit={handleSingUp} className="space-y-3.5">
                <div className="flex justify-center mb-4">
                  <div className="relative group">
                    <div className="w-20 h-20 rounded-full border border-dashed border-slate-300 flex items-center justify-center overflow-hidden bg-white/70 shadow-sm">
                      {previewUrl ? (
                        <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-slate-400 text-xs text-center px-2">Add photo</span>
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg">
                      <span className="text-xs">+</span>
                      <input accept="image/*" className="hidden" type="file" onChange={handleImageChange} />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                  <input
                    className="form-input mt-0"
                    placeholder="John Doe"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

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
                      placeholder="Create a password"
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

                  {/* Password strength indicator */}
                  {password && passwordStrength && (
                    <div className="mt-2">
                      <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color} ${passwordStrength.width}`}
                        />
                      </div>
                      <p className={`text-xs mt-1 font-medium ${
                        passwordStrength.label === "Strong" ? "text-emerald-600"
                        : passwordStrength.label === "Fair" ? "text-yellow-600"
                        : "text-red-500"
                      }`}>
                        {passwordStrength.label}
                        {passwordStrength.label !== "Strong" && " — min 8 chars, uppercase, number & symbol recommended"}
                      </p>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <button type="submit" disabled={isLoading} className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
                  {isLoading ? "Creating Account..." : "Create Account"}
                </button>

                <p className="text-center text-sm text-slate-600">
                  Already have an account?{" "}
                  <Link className="text-primary font-semibold hover:underline" to="/login">
                    Sign In
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
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

export default SignUp
