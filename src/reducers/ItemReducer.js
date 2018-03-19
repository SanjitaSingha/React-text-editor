const INITIAL_STATE = {
  items: []
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'ADD_ITEM':
      
      return { ...state, items: action.payload };
    default:
      return { ...state }

  }
}
