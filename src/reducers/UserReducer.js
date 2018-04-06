const INITIAL_STATE = {
  user: {}
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'SINGLE_USER_FETCH':

      return { ...state, user: action.payload };
    default:
      return { ...state }

  }
}
