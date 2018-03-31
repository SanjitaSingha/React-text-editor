import React, { Component } from 'react';
import { Link, Route, Redirect } from 'react-router-dom';
import firebase from 'firebase';
import { connect } from 'react-redux';
import { fbLogin } from '../actions';

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedIn: null
    }
  }

  componentWillMount() {
    firebase.auth().onAuthStateChanged((user) => {
      console.log('USER', user);
    if (user) {
      this.setState({ loggedIn: true });
    } else {
      this.setState({ loggedIn: false });
    }
  });
  }


    // firebase.auth().signInWithRedirect(provider);
    //
    // firebase.auth().getRedirectResult().then(result => {
    //   if (result.credential) {
    //     // This gives you a Facebook Access Token. You can use it to access the Facebook API.
    //     var token = result.credential.accessToken;
    //     // ...
    //     var user = result.user;
    //     console.log('FaceBook User Info', token, user);
    //   }
    // })
    // .catch(err => {
    //   var errorCode = err.code;
    //   var errorMessage = err.message;
    //   // The email of the user's account used.
    //   var email = err.email;
    //   // The firebase.auth.AuthCredential type that was used.
    //   var credential = err.credential;
    //   console.log('Facebook Error', errorCode, errorMessage, email, credential);
    // })
login(history) {
  this.props.fbLogin(history);
}
renderPage() {
  if(this.state.loggedIn) {
    return <Redirect to='/' />
  } else if(this.state.loggedIn === null) {
    return (
      <div>Spinning....</div>
    );
  }else {
    return (
      <div>
        Login PAge
        <Route render={({ history }) => (
          <button  onClick={(e) => this.login(history)}>Login with Facebook</button>
        )} />
      </div>
    );
  }
}

  render() {
    return (
      this.renderPage()
    )
  }
}

export default connect(null, {fbLogin})(Login);
