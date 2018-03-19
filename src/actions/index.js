export const addListItem = (text) => {
  return (dispatch) => {
    dispatch({ type: 'ADD_ITEM', payload: text });
  };
};
