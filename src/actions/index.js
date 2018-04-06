import firebase from 'firebase';

export const addListItem = (text, id) => {
  return (dispatch) => {
    const { currentUser } = firebase.auth();
    console.log('New data', text);
    firebase.database().ref(`root/${currentUser.uid}/list/${id}`).set(text);
    // dispatch({ type: 'ADD_ITEM', payload: text });
  };
};

export const fetchItem = (id) => {
  const { currentUser } = firebase.auth();
  return (dispatch) => {
    var b = firebase.database().ref().child(`/root/${id}`).push().key;
    // firebase.database().ref(`users`).on('value', (snapshot) => {
    //   snapshot.forEach(function(childSnapshot) {
    //     var childData = childSnapshot.val();
    //     console.log('Value',childData, b);
    //   });
    // });
    firebase.database().ref(`/root/${currentUser.uid}/list`).on('value', (snapshot) => {
      var listObj = snapshot.val();
      console.log('Value',listObj, b);
      const Arr = [];
        if (listObj) {
          Object.keys(listObj).map((e) => {
            // const obj = {};
            // // obj.key = e;
            // obj.value = listObj[e];
            Arr.push(listObj[e]);
            return null;
          });
        }
        dispatch({ type: 'FETCH_ITEM', payload: Arr });
    });
    // console.log('Value', b);
  }
}

export * from './AuthAction';
export * from './UserAction';
