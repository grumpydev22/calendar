import { call, put } from "redux-saga/effects";
import * as authActions from "../../actions/auth/authActions";

function fetchLogin(name, password) {

  return fetch("http://localhost:3000/api/auth/login", {
    method: 'post',
    headers: new Headers({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }),
    body: JSON.stringify({
      name,
      password
    })
  })
    .then(res => {
      return res.json()
        .then(json => {
          // console.log({json})
          return json;
        })
    })
    .catch(err => {
      console.log({err})
    })
}

function* callLoginSaga(action) {
  const {username, password} = action.payload;

  try {
    const response = yield call(fetchLogin, username, password);
    const auth = response;

    // console.log('login response', response);
    if (response.auth) {
      yield put(authActions.loginSuccess({auth, username}));
    } else {
      yield put(authActions.loginFailure());  
    }
  } catch (err) {
    yield put(authActions.loginFailure({err}));
  }
}

export default callLoginSaga;