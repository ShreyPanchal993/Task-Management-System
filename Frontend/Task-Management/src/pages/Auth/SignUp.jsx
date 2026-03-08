import React, { useContext, useState } from "react";
import { validateEmail } from "../../utils/helper.js";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance.js";
import { API_PATHS } from "../../utils/apiPaths.js";
import { UserContext } from "../../context/userContext";
import uploadImage from "../../utils/uploadImage.js";
import { tokenStore } from "../../utils/tokenStore.js";
import { HiCheckCircle, HiUsers, HiClipboardList, HiChartBar } from 'react-icons/hi';

const SignUp = () => {
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminInviteToken, setAdminInviteToken] = useState('');
  
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

  const handleSingUp = async (e) => {
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
        if(profilePicture){
          const imageUploadRes = await uploadImage(profilePicture);
          uploadedImageUrl = imageUploadRes.url;
        }

        const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
          name: fullName,
          email,
          password,
          profilePicture: uploadedImageUrl,
          adminInviteToken: adminInviteToken || undefined,
        });

        const { token, user } = response.data.data;

        if (token) {
          tokenStore.set(token);
          updateUser(user);
          navigate(user.role === "admin" ? "/admin/dashboard" : "/user/dashboard");
        }
      }catch (error) {
        setError(error.response?.data?.message || "Something went wrong. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

  return(
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4 animate-gradient relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        
        {/* Floating Task Icons */}
        <div className="absolute top-1/4 left-1/4 animate-float">
          <HiClipboardList className="text-blue-300 text-4xl opacity-20" />
        </div>
        <div className="absolute top-1/3 right-1/4 animate-float animation-delay-1000">
          <HiCheckCircle className="text-indigo-300 text-5xl opacity-20" />
        </div>
        <div className="absolute bottom-1/4 left-1/3 animate-float animation-delay-2000">
          <HiUsers className="text-purple-300 text-4xl opacity-20" />
        </div>
        <div className="absolute bottom-1/3 right-1/3 animate-float animation-delay-3000">
          <HiChartBar className="text-blue-300 text-3xl opacity-20" />
        </div>
      </div>

      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-500 hover:shadow-2xl relative z-10">
        <div className="flex flex-col lg:flex-row">
          {/* Left Side - Branding */}
          <div className="lg:w-2/5 bg-gradient-to-br from-primary to-blue-600 p-8 lg:p-12 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-white opacity-5">
              <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-300 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-pulse" style={{animationDelay: '1s'}}></div>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-8 animate-fade-in">
                <HiCheckCircle className="text-3xl animate-bounce" style={{animationDuration: '2s'}} />
                <h1 className="text-2xl font-bold">TaskFlow</h1>
              </div>
              
              <h2 className="text-3xl lg:text-4xl font-bold mb-4 animate-fade-in" style={{animationDelay: '0.2s'}}>Organize. Collaborate. Achieve.</h2>
              <p className="text-blue-100 mb-8 animate-fade-in" style={{animationDelay: '0.4s'}}>Streamline your workflow and boost productivity with our intuitive task management platform.</p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3 animate-slide-in-left" style={{animationDelay: '0.6s'}}>
                  <HiClipboardList className="text-2xl mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">Smart Task Organization</h3>
                    <p className="text-sm text-blue-100">Create, assign, and track tasks with ease</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 animate-slide-in-left" style={{animationDelay: '0.8s'}}>
                  <HiUsers className="text-2xl mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">Team Collaboration</h3>
                    <p className="text-sm text-blue-100">Work together seamlessly in real-time</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 animate-slide-in-left" style={{animationDelay: '1s'}}>
                  <HiChartBar className="text-2xl mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">Progress Tracking</h3>
                    <p className="text-sm text-blue-100">Monitor performance with detailed insights</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="lg:w-3/5 p-8 lg:p-12">
            <div className="max-w-md mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-2 animate-fade-in">Create Your Account</h3>
              <p className="text-gray-600 mb-6 animate-fade-in" style={{animationDelay: '0.1s'}}>Start managing your tasks efficiently today</p>

              <form onSubmit={handleSingUp} className="space-y-4">
                {/* Profile Picture */}
                <div className="flex justify-center mb-4 animate-fade-in" style={{animationDelay: '0.2s'}}>
                  <div className="relative group">
                    <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:border-primary group-hover:scale-105">
                      {previewUrl ? (
                        <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-gray-400 text-xs text-center px-2">Photo</span>
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-blue-600 transition-all duration-300 hover:scale-110">
                      <span className="text-xs">+</span>
                      <input accept="image/*" className="hidden" type="file" onChange={handleImageChange} />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="animate-fade-in" style={{animationDelay: '0.3s'}}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 hover:border-gray-400"
                      placeholder="John Doe"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>

                  <div className="animate-fade-in" style={{animationDelay: '0.4s'}}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 hover:border-gray-400"
                      placeholder="you@company.com"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="animate-fade-in" style={{animationDelay: '0.5s'}}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 hover:border-gray-400"
                      placeholder="••••••••"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  <div className="animate-fade-in" style={{animationDelay: '0.6s'}}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Admin Token (Optional)</label>
                    <input
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 hover:border-gray-400"
                      placeholder="6-digit code"
                      type="text"
                      value={adminInviteToken}
                      onChange={(e) => setAdminInviteToken(e.target.value)}
                    />
                  </div>
                </div>

                {error && <p className="text-red-500 text-sm animate-shake">{error}</p>}

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed animate-fade-in"
                  style={{animationDelay: '0.7s'}}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Account...
                    </span>
                  ) : 'Create Account'}
                </button>

                <p className="text-center text-sm text-gray-600 animate-fade-in" style={{animationDelay: '0.8s'}}>
                  Already have an account?{" "}
                  <Link className="text-primary font-semibold hover:underline transition-all" to="/login">
                    Sign In
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-in-left {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
          opacity: 0;
        }
        .animate-slide-in-left {
          animation: slide-in-left 0.6s ease-out forwards;
          opacity: 0;
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-3000 {
          animation-delay: 3s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}

export default SignUp