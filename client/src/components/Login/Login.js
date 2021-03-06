import React, { useState } from "react";
import Field from "./Field";
import useStyles from "./styles";
import styles from "./Login.module.css";
import { GoogleLogin } from "react-google-login";
import { useDispatch } from "react-redux";
import { useHistory, Link } from "react-router-dom";
import { signup, signin } from "../../actions/auth";
import {
  Avatar,
  Button,
  Paper,
  Grid,
  Typography,
  Container,
} from "@material-ui/core";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import { createProfile } from "../../actions/profile";
import Google from "./Google";
import { useSnackbar } from "react-simple-snackbar";
import CircularProgress from "@material-ui/core/CircularProgress";

const initialState = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
  profilePicture: "",
  bio: "",
};

const Login = () => {
  const classes = useStyles();
  const [formData, setFormData] = useState(initialState);
  const [isSignup, setIsSignup] = useState(false);
  const dispatch = useDispatch();
  const history = useHistory();
  const [showPassword, setShowPassword] = useState(false);
  // eslint-disable-next-line
  const [openSnackbar, closeSnackbar] = useSnackbar();
  const user = JSON.parse(localStorage.getItem("profile"));
  const [loading, setLoading] = useState(false);

  const handleShowPassword = () => setShowPassword(!showPassword);
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSignup) {
      dispatch(signup(formData, openSnackbar, setLoading));
    } else {
      dispatch(signin(formData, openSnackbar, setLoading));
    }
    setLoading(true);
  };

  const switchMode = () => {
    setIsSignup((prevState) => !prevState);
  };

  const googleSuccess = async (res) => {
    console.log(res);
    const result = res?.profileObj;
    const token = res?.tokenId;
    dispatch(
      createProfile({
        name: result?.name,
        email: result?.email,
        userId: result?.googleId,
        phoneNumber: "",
        businessName: "",
        contactAddress: "",
        logo: result?.imageUrl,
        website: "",
      })
    );

    try {
      dispatch({ type: "AUTH", data: { result, token } });

      window.location.href = "/dashboard";
    } catch (error) {
      console.log(error);
    }
  };
  const googleError = (error) => {
    console.log(error);
    console.log("Google Sign In was unseccassful. Try again later");
  };

  if (user) {
    history.push("/dashboard");
  }

  return (
    <Container component="main" maxWidth="xs">
      <Paper className={classes.paper} elevation={2}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          {isSignup ? "S'inscrire" : "Connexion"}
        </Typography>
        <form className={classes.form} onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {isSignup && (
              <>
                <Field
                  name="First Name"
                  label="Pr??nom"
                  handleChange={handleChange}
                  autoFocus
                  half
                />
                <Field
                  name="Last Name"
                  label="Nom"
                  handleChange={handleChange}
                  half
                />
              </>
            )}
            <Field
              name="email"
              label="Adresse Email"
              handleChange={handleChange}
              type="email"
            />
            <Field
              name="password"
              label="Mot de passe"
              handleChange={handleChange}
              type={showPassword ? "text" : "password"}
              handleShowPassword={handleShowPassword}
            />
            {isSignup && (
              <Field
                name="confirmPassword"
                label="R??p??ter le mot de passe"
                handleChange={handleChange}
                type="password"
              />
            )}
          </Grid>
          <div className={styles.buttons}>
            <div>
              {/* <button className={styles.submitBtn}> { isSignup ? 'Sign Up' : 'Sign In' }</button> */}
              {/* <ProgressButton>{ isSignup ? 'Sign Up' : 'Sign In' }</ProgressButton> */}
              {loading ? (
                <CircularProgress />
              ) : (
                <button className={styles.loginBtn}>
                  {isSignup ? "S'inscrire" : "Connexion"}
                </button>
              )}
            </div>
            <div>
              {/* <GoogleLogin
                    clientId = {process.env.REACT_APP_GOOGLE_CLIENT_ID}
                    render={(renderProps) => (
                        <button className={styles.googleBtn} onClick={renderProps.onClick} disabled={renderProps.disabled} ><Google /> Google</button>
                    )}
                    onSuccess={googleSuccess}
                    onFailure={googleError}
                    cookiePolicy="single_host_origin"
                /> */}
            </div>
          </div>
          <Grid container justifyContent="flex-end">
            <Grid item style={{ marginRight: "20px" }}>
              <Button onClick={switchMode}>
                {isSignup
                  ? "Vous avez d??j?? un compte? S'identifier"
                  : "Vous n'avez pas de compte??? S'inscrire"}
              </Button>
            </Grid>
          </Grid>
          <Link to="forgot">
            <p
              style={{
                textAlign: "center",
                color: "#1d7dd6",
                marginTop: "20px",
              }}
            >
              Mot de passe oubli???
            </p>
          </Link>
        </form>
      </Paper>
    </Container>
  );
};

export default Login;
