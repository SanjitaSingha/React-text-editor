import firebase from 'firebase';

var config = {
  apiKey: "AIzaSyCBf_TaZZQiw6AfyUmOssd8zYC2VGM2CGc",
  authDomain: "texteditor-5de28.firebaseapp.com",
  databaseURL: "https://texteditor-5de28.firebaseio.com",
  projectId: "texteditor-5de28",
  storageBucket: "texteditor-5de28.appspot.com",
  messagingSenderId: "716475007935"
};
firebase.initializeApp(config);

export const logOut = (history) => {
  return (dispatch) => {
    firebase.auth().signOut().then(function() {
      // Sign-out successful.
      console.log('LOGOT');
      localStorage.removeItem('token');
      history.push('/login');
    }).catch(function(error) {
      console.log(error);
    });
  }
};

export const fbLogin = (history) => {
  return (dispatch) => {
    var provider = new firebase.auth.FacebookAuthProvider();
    provider.setCustomParameters({
      'display': 'popup'
    });
    firebase.auth().signInWithPopup(provider)
      .then(res => {

        var fbToken = res.credential.accessToken;
        console.log('Facebook ', res, fbToken);
        localStorage.setItem('token', fbToken);
        history.replace('/');
        const { currentUser } = firebase.auth();
        var obj = {};
        obj.token = currentUser.uid;
        obj.userName = currentUser.displayName;
        obj.email = currentUser.email;
        console.log('Current USer', obj, currentUser);
        firebase.database().ref('users/'+ currentUser.uid).set(obj);
        // firebase.database().ref(`users`).push(obj);
        dispatch({ type: 'LOGIN_SUCCESSFUL', payload: obj });

      }).catch(error => {
        console.log('Facebook Error', error);
      });
  }

}
