import { useReducer, useEffect } from "react";
import axios from "axios";

// to be used in our dispatch type to figure out the action to be done
const ACTIONS = {
  MAKE_REQUEST: "make-request",
  GET_DATA: "get-data",
  ERROR: "error",
};

// using this in front of our URL creates a proxy server for development purposses https://cors-anywhere.herokuapp.com/
const BASE_URL =
  "https://cors-anywhere.herokuapp.com/https://jobs.github.com/positions.json";

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

  useEffect(() => {
    const cancelToken = axios.CancelToken.source();
    dispatch({ type: ACTIONS.MAKE_REQUEST });
    axios
      .get(BASE_URL, {
        cancelToken: cancelToken.token,
        params: { markdown: true, page: page, ...params },
      })
      .then((res) => {
        dispatch({ type: ACTIONS.GET_DATA, payload: { jobs: res.data } });
      })
      .catch((e) => {
        //   This isn't a real error, so the isCancel stops it from throwing an error
        if (axios.isCancel(e)) return;
        dispatch({ type: ACTIONS.ERROR, payload: { error: e } });
      });

    return () => {
      cancelToken.cancel();
    };
  }, [params, page]);

  return state;
}
