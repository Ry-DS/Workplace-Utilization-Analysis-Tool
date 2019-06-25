//combines all the reducers so we can import them into redux at once
import {combineReducers} from "redux";
import authReducer from "./authReducer";
import errorReducer from "./errorReducer";

export default combineReducers({
  auth: authReducer,
  errors: errorReducer
});
