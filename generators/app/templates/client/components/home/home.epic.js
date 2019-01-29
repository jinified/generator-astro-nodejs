import * as types from './home.constant';
import * as actions from './home.action';

export default (action$, store, { getJSON, of }) => action$.ofType(types.HOME_TEST).mergeMap(action => getJSON(`https://api.github.com/users/${action.payload}`)
  .map(response => actions.testSuccess(response))
  .takeUntil(action$.ofType(types.TEST_CANCEL))
  .catch(error => of(actions.testError(error))));
