import {
  BrowserRouter as Router,
  Link,
  Redirect,
  Route,
  Switch,
} from 'react-router-dom';
import React, { Component } from 'react';
import Login from './components/Login';
import App from './App';
import firebase from 'firebase';

const PrivateRoute = ({ component: Component, authed, ...rest }) => (
  <Route {...rest} render={(props) => (
    authed
      ? <Component {...props} />
      : <Redirect to='/login' />
  )} />
);

export default class Routes extends Component {
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

  render() {
    return (
      <Router>
        <Switch>
          <Route path='/login' component={Login} />
          <PrivateRoute authed={this.state.loggedIn} path='/' component={App} />
        </Switch>
      </Router>
    )
  }

}
