import { useReducer, useEffect } from "react";

// to be used in our dispatch type to figure out the action to be done
const ACTIONS = {
  MAKE_REQUEST: "make-request",
  GET_DATA: "get-data",
  ERROR: "error",
};

function reducer(state, action) {
  switch (action.type) {
    case ACTIONS.MAKE_REQUEST:
      // everytime a new request is made, we say we're loading and clear out our jobs array
      return { loading: true, jobs: [] };
    case ACTIONS.GET_DATA:
      // take our current state, and add to it
      return { ...state, loading: false, jobs: action.payload.jobs };
    case ACTIONS.ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
        jobs: [],
      };
    default:
      return state;
  }
}

export default function useFetchJobs(params, page) {
  const [state, dispatch] = useReducer(reducer, { jobs: [], loading: true });

  // dispatch becomes the action param in our reducer function
  //   dispatch({ type: "hello", payload: { x: 3 } });

  return {
    jobs: [],
    loading: true,
    error: false,
  };
}
