import React, { Component } from 'react';
import firebase from 'firebase';
import renderHTML from 'react-render-html';
import { connect } from 'react-redux';
import { SingleUserFetch } from '../actions';

class Share extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: ''
    }
  }

  componentWillMount() {
    firebase.database().ref(`/share/${this.props.match.params.id}`).on('value', (snapshot) => {
      var listObj = snapshot.val();
      console.log('Share Value',listObj);
      if(listObj !== null) {
        this.setState({ data: listObj.info.data });
        this.props.SingleUserFetch(listObj.owner);
      }
    });
  }

  render() {
    return (
      <div>
        {/*Share id: {this.props.match.params.id}*/}
        <p style={{ backgroundColor: 'rebeccapurple', textAlign: 'center' }}>
          <div style={{ display: 'flex' }}>
            <p>This note is shared by: </p>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
              <img src={this.props.user.image} className="profileImage" alt="userImage" />
              {this.props.user.userName}
            </div>
          </div>

          <p><b>Note:</b> You are not authorised to edit this notes</p>
        </p>

        <div style={{ margin: 20 }}>{renderHTML(this.state.data)}</div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    user: state.user.user
  }
}

export default connect( mapStateToProps, { SingleUserFetch })(Share);
