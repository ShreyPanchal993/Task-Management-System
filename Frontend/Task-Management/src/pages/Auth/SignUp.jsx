import React, { useContext, useState } from "react";
import AuthLayout from "../../components/layouts/AuthLayout";
import { validateEmail } from "../../utils/helper.js";
import ProfilePhotoSelector from "../../components/Inputs/ProfilePhotoSelector";
import Input from "../../components/Inputs/Input";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance.js";
import { API_PATHS } from "../../utils/apiPaths.js";
import { UserContext } from "../../context/userContext";
import uploadImage from "../../utils/uploadImage.js";

const SignUp = () => {
  const [profilePicture, setProfilePictures] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminInviteToken, setAdminInviteToken] = useState('');
  
  const [error, setError] = useState(null);
  
  const { updateUser } = useContext(UserContext);
  const navigate = useNavigate();

  // Handle SignUp Form Submit
  const handleSingUp = async (e) => {
      e.preventDefault();

      let profilePicture = '';

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
  
      // SignUp API Call
      try{

        // upload image if present
        if(profilePicture){
          const imageUploadRes = await uploadImage(profilePicture);
          profilePicture = imageUploadRes.url;
        }

        const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
          name: fullName,
          email,
          password,
          profilePicture, // Send the uploaded image URL or null if not uploaded
          adminInviteToken: adminInviteToken || undefined, // Send only if provided
        });

        const { token, user } = response.data.data;

        if (token) {
          localStorage.setItem("token", token);
          updateUser({ ...user, token }); // Update user context with user data and token

          // Redirect based on role
          if (user.role === "admin") {
            navigate("/admin/dashboard");
          } else {
            navigate("/user/dashboard");
          }
        }
      }catch (error) {
        if (error.response && error.response.data.message) {
          setError(error.response.data.message);
        } else {
          setError("Something went wrong. Please try again later.");
        }
      }
    };

  return(
    <AuthLayout>
      <div className="lg:w-full h-auto md:h-full mt-10 md:mt-0 flex flex-col justify-center">
        <h3 className="text-xl font-semibold text-black">Create an Account</h3>
        <p className="text-xs text-slate-700 mt-[5px] mb-6">Join us today by entering your details below</p>

        <form onSubmit={handleSingUp}>
          <ProfilePhotoSelector image={profilePicture} setImage={setProfilePictures}/>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              value={fullName}
              onChange={({ target }) => setFullName(target.value)}
              label="Full Name"
              placeholder="Enter you full name"
              type=""
            />

            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              label="Email"
              type="text"
            />

            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              label="Password"
              type="password"
            />

            <Input
              value={adminInviteToken}
              onChange={(e) => setAdminInviteToken(e.target.value)}
              placeholder="6 Digit Code"
              label="Admin Invite Token"
              type="password"
            />
          </div>

          {error && <p className="text-red-500 text-xs pb-2.5">{error}</p>}

          <button type="submit" className="btn-primary">Sign Up</button>

          <p className="text-[13px] text-slate-800 mt-3">
            Already an account?{" "}
            <Link className="font-medium text-primary underline" to="/login">
              Login
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  )
}

export default SignUp