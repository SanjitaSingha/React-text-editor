import React from 'react';
import {
  ImageSideButton,
  Block,
  addNewBlock,
} from 'medium-draft';
// import 'isomorphic-fetch';
import firebase from 'firebase';
import PropTypes from 'prop-types';

class CustomImageSideButton extends ImageSideButton {
  // static propTypes = {
  //   setEditorState: PropTypes.func,
  //   getEditorState: PropTypes.func,
  //   close: PropTypes.func,
  // };
  /*

  We will only check for first file and also whether
  it is an image or not.
  */

  onChange(e) {
    const file = e.target.files[0];
    if (file.type.indexOf('image/') === 0) {
      // This is a post request to server endpoint with image as `image`
      const formData = new FormData();
      formData.append('image', file);
      var fileName = file.name;
      var storageRef = firebase.storage().ref(`/dataImages/${fileName}`);

      var uploadTask = storageRef.put(file);
      console.log('Upload Task', uploadTask, formData);

      uploadTask.then((snapshot) => {
        console.log('Uplaod', snapshot.downloadURL, snapshot);
        if(snapshot.state === 'success') {
          // const editorData = data => {
          //    if (data.downloadURL) {
          //      const src = data.downloadURL;
          //      this.props.setEditorState(addNewBlock(
          //        this.props.getEditorState(),
          //        Block.IMAGE, {
          //          src,
          //        }
          //      ));
          //    }
          //  }
          //  return editorData(snapshot)

          return snapshot.task.then(data => {
            console.log('DATA', data);
           if (data) {
             this.props.setEditorState(addNewBlock(
               this.props.getEditorState(),
               Block.IMAGE, {
                 src: data.downloadURL,
               }
             ));
           }
         });

        }
      }).catch(error => { console.log('Error', error) });
    }
    this.props.close();
  }


//
//   onChange(e) {
//     const file = e.target.files[0];
//     if (file.type.indexOf('image/') === 0) {
//       var fileName = file.name;
//       var storageRef = firebase.storage().ref(`/dataImages/${fileName}`);
//       var uploadTask = storageRef.put(file);
//       uploadTask.on('state_changed', function(snapshot){
//         // Observe state change events such as progress, pause, and resume
//         // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
//         var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
//         console.log('Upload is ' + progress + '% done');
//         switch (snapshot.state) {
//           case firebase.storage.TaskState.PAUSED: // or 'paused'
//             console.log('Upload is paused');
//             break;
//           case firebase.storage.TaskState.RUNNING: // or 'running'
//             console.log('Upload is running');
//             break;
//           default:
//             return null;
//         }
//       }, function(error) {
//         // Handle unsuccessful uploads
//       }, function() {
//         // Handle successful uploads on complete
//         // For instance, get the download URL: https://firebasestorage.googleapis.com/...
//         var downloadURL = uploadTask.snapshot.downloadURL;
//         this.props.setEditorState(addNewBlock(
//              this.props.getEditorState(),
//              Block.IMAGE, {
//                 src: downloadURL
//              }
//         ));
//       });
//     }
//
//   }

}

CustomImageSideButton.propTypes = {
  setEditorState: PropTypes.func,
  getEditorState: PropTypes.func,
  close: PropTypes.func,
};

export default CustomImageSideButton;
