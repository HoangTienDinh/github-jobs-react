import { useReducer, useEffect } from "react";
import axios from "axios";

// to be used in our dispatch type to figure out the action to be done
const ACTIONS = {
  MAKE_REQUEST: "make-request",
  GET_DATA: "get-data",
  ERROR: "error",
  UPDATE_HAS_NEXT_PAGE: 'update-has-next-page'
};

// using this in front of our URL creates a proxy server for development purposses https://cors-anywhere.herokuapp.com/
const BASE_URL =
  "https://cors-anywhere.herokuapp.com/https://jobs.github.com/positions.json";
// issues with CORS happens some times, can be fixed with adding...
// "proxy": "https://cors-anywhere.herokuapp.com/https://jobs.github.com",
// to package.json, and changing BASE_URL to "/positions.json"



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
      case ACTIONS.UPDATE_HAS_NEXT_PAGE:
          return { ...state, hasNextPage: action.payload.hasNextPage}
    default:
      return state;
  }
}

export default function useFetchJobs(params, page) {
  const [state, dispatch] = useReducer(reducer, { jobs: [], loading: true });

  // dispatch becomes the action param in our reducer function
  //   dispatch({ type: "hello", payload: { x: 3 } });

  useEffect(() => {
    const cancelToken1 = axios.CancelToken.source();
    dispatch({ type: ACTIONS.MAKE_REQUEST });
    axios
      .get(BASE_URL, {
        cancelToken: cancelToken1.token,
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

    const cancelToken2 = axios.CancelToken.source();
      axios
      .get(BASE_URL, {
        cancelToken: cancelToken2.token,
        params: { markdown: true, page: page + 1, ...params },
      })
      .then((res) => {
        dispatch({ type: ACTIONS.UPDATE_HAS_NEXT_PAGE, payload: { hasNextPage: res.data.length !== 0 } });
      })
      .catch((e) => {
        //   This isn't a real error, so the isCancel stops it from throwing an error
        if (axios.isCancel(e)) return;
        dispatch({ type: ACTIONS.ERROR, payload: { error: e } });
      });

    return () => {
      cancelToken1.cancel();
      cancelToken2.cancel();
    };
  }, [params, page]);

  return state;
}
