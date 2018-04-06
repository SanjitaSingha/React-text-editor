import firebase from 'firebase';

export const SingleUserFetch = (id) => {
  return (dispatch) => {
    firebase.database().ref(`/users/${id}`).on('value', snapshot => {
      dispatch({ type: 'SINGLE_USER_FETCH', payload: snapshot.val() });
    })
  }
}
