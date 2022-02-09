import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ReactComponent as ArrowRightIcon } from "../assets/svg/keyboardArrowRightIcon.svg";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import visibilityIcon from "../assets/svg/visibilityIcon.svg";
import eyeSlashSolid from "../assets/svg/eye-slash-solid.svg";
import OAuth from "../components/OAuth";
const Signin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { email, password } = formData;
  const navigate = useNavigate();
  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
  };
  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const auth = getAuth();

      const userCredentail = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log(userCredentail);
      if (userCredentail.user) {
        toast("Logged In");
        navigate("/");
      }
    } catch (error) {
      const errorCode = error.code;
      const errorMessage = error.message;
      if (errorCode === "auth/user-not-found") {
        console.log(errorMessage);
        toast.error("Email is Not registred");
      } else {
        toast.error("Emial or passwoerd is not maatched ");
      }
    }
  };
  return (
    <>
      <div className="pageContainer">
        <header>
          <p className="pageHeader">Welcome Back !</p>
        </header>
        <form onSubmit={onSubmit}>
          <input
            type="email"
            name="email"
            id="email"
            placeholder="Email"
            value={email}
            onChange={onChange}
            className="emailInput"
          />
          <div className="passwordInputDiv">
            <input
              type={showPassword ? "text" : "password"}
              className="passwordInput"
              placeholder="Password "
              id="password"
              value={password}
              onChange={onChange}
            />
            <img
              src={!showPassword ? visibilityIcon : eyeSlashSolid}
              className="showPassword"
              alt="show password"
              width="50px"
              onClick={() => setShowPassword((prevState) => !prevState)}
            />
          </div>
          <Link to="/forgotpassword" className="forgotPasswordLink">
            Forgot password
          </Link>
          <div className="signInBar">
            <p className="signInText">Sign In</p>
            <button className="signInButton">
              <ArrowRightIcon fill="#fff" width="34px" height="34px" />
            </button>
          </div>
        </form>
        <OAuth />
        <Link to="/signup" className="registerLink">
          Sign Up Instead
        </Link>
      </div>
    </>
  );
};
export default Signin;
