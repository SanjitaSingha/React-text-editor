import firebase from 'firebase';

export const config = () => {
  var config = {
    apiKey: "AIzaSyCBf_TaZZQiw6AfyUmOssd8zYC2VGM2CGc",
    authDomain: "texteditor-5de28.firebaseapp.com",
    databaseURL: "https://texteditor-5de28.firebaseio.com",
    projectId: "texteditor-5de28",
    storageBucket: "texteditor-5de28.appspot.com",
    messagingSenderId: "716475007935"
  };
  return firebase.initializeApp(config);
}
