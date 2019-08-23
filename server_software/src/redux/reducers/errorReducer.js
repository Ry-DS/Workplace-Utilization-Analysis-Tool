//error reducer, to pass errors from the authentication
import {GET_ERRORS} from "../actions/types";

const initialState = {};
//simply passes on the errors to whoever requested an action
export default function (state = initialState, action) {
  switch (action.type) {
    case GET_ERRORS:
      return action.payload;
    default:
      return state;
  }
}
