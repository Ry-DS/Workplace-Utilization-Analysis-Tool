//this is what stores the global state.
import {applyMiddleware, createStore} from "redux";
import {composeWithDevTools} from 'redux-devtools-extension/developmentOnly';
import thunk from "redux-thunk";
import rootReducer from "./reducers";

const initialState = {};
const middleware = [thunk];//thunk allows us to do async store updates. Since we have a backend, this is important.
const store = createStore(
  rootReducer,
  initialState,
  composeWithDevTools(
    applyMiddleware(...middleware)
  )
);
export default store;
