import axios from "axios";
import setAuthToken from "../../utils/authToken";
import jwt_decode from "jwt-decode";
import {GET_ERRORS, SET_CURRENT_USER} from "./types";
// Login - get user token
export const loginUser = userData => dispatch => {

  axios.post("/api/users/login", userData)
    .then(res => {
      // Save to localStorage
// Set token to localStorage
      const {token} = res.data;
      localStorage.setItem("jwtToken", token);
      // Set token to Auth header
      setAuthToken(token);
      // Decode token to get user data
      const decoded = jwt_decode(token);
      // Set current user
      dispatch(setCurrentUser(decoded));
    })
    .catch(err => {
      dispatch({//set errors to state if failed login
        type: GET_ERRORS,
        payload: err.response.data
      });

      }
    );
};
// Set logged in user
export const setCurrentUser = decoded => {
  return {
    type: SET_CURRENT_USER,
    payload: decoded
  };
};

// Log user out
export const logoutUser = () => dispatch => {
  // Remove token from local storage
  localStorage.removeItem("jwtToken");
  // Remove auth header for future requests
  setAuthToken(false);
  // Set current user to empty object {} which will set isAuthenticated to false
  dispatch(setCurrentUser({}));
};
