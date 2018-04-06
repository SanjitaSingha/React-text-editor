import React, { Component } from 'react';
import './App.css';
// import Editor from 'react-medium-editor';
import { connect } from 'react-redux';
import renderHTML from 'react-render-html';
import { Route } from 'react-router-dom';
import {
  Editor,
  createEditorState,
} from 'medium-draft';

import mediumDraftExporter from 'medium-draft/lib/exporter';
import mediumDraftImporter from 'medium-draft/lib/importer';
import { convertToRaw } from 'draft-js'
import firebase from 'firebase';
import { addListItem, logOut, fetchItem, SingleUserFetch } from './actions'
import CustomImageSideButton from './components/CustomImageSideButton';
var sampleText;
var id = 0;

// var list;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inputValue: '',
      title: '',
      editorSearchTerm: '',
      listSearchTerm: '',
      data: [],
      clickedData: '',
      clicked: false,
      new: true,
      child: false,
      collapsed: false,
      parentEdit: false,
      buttonText: <i className="fa fa-caret-right" />,
      editorState: createEditorState()
    };
    this.sideButtons = [{
      title: 'Image',
      component: CustomImageSideButton,
    }];
    this.onChange = (editorState) => {
      // console.log(convertToRaw(this.state.editorState.getCurrentContent()));
      this.setState({ editorState }, function() {
        console.log(this.state.editorState);
          // localStorage.setItem('editorText', this.state.editorState);
          this.setState({ draftInfo: mediumDraftExporter(this.state.editorState.getCurrentContent()) },
            function() {
              localStorage.setItem('editorText', this.state.draftInfo)
            }
          )

        }
      );
    };

    this.getEditorState = () => this.state.editorState;
    // this.handleDroppedFiles = this.handleDroppedFiles.bind(this);
  }

  // componentWillReceiveProps(nextProps) {
  //   this.setState({ data: nextProps.item });
  //   // sampleText = window.document.getElementById('list').innerHTML;
  //
  // }

  componentWillMount() {
    const { currentUser } =firebase.auth();
    this.props.fetchItem(currentUser.uid);
    firebase.auth().onAuthStateChanged((user) => {
      console.log('USER', user);
      if (user) {
        this.props.SingleUserFetch(user.uid);
        this.setState({ loggedIn: true, src: user.photoURL });
      } else {
        this.setState({ loggedIn: false });
      }
    });
  }

  componentDidMount() {

    var html = localStorage.getItem('editorText');
    if(html) {
      console.log('EDITOR TEXT', html);
      const editorState = createEditorState(convertToRaw(mediumDraftImporter(html)));
      this.setState({ editorState });
    }

    this.setState({ title: localStorage.getItem('title')});

    // Minimum resizable area
    var minWidth = 150;
    // Thresholds
    var FULLSCREEN_MARGINS = -10;
    var MARGINS = 4;

    // End of what's configurable.
    var clicked = null;
    var onRightEdge, onBottomEdge, onLeftEdge, onTopEdge;

    var rightScreenEdge, bottomScreenEdge;

    var preSnapped;

    var b, x, y;

    var redraw = false;

    var pane = document.getElementById('pane');
    var ghostpane = document.getElementById('ghostpane');
    var panecontainer = document.getElementById("pane-container");

    function setBounds(element, x, y, w, h) {
      element.style.left = x + 'px';
      element.style.top = y + 'px';
      element.style.width = w + 'px';
      element.style.height = h + 'px';
    }

    function hintHide() {
      console.log('HInt hide run');
      setBounds(ghostpane, b.left, b.top, b.width, b.height);
      ghostpane.style.display = 'none';
    }


    // Mouse events
    pane.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);

    function onMouseDown(e) {
      onDown(e);
      e.preventDefault();
    }

    function onDown(e) {
      console.log('Mouse down run', e);
      calc(e);

      var isResizing = onRightEdge || onBottomEdge || onTopEdge || onLeftEdge;

      clicked = {
        x: x,
        y: y,
        cx: e.clientX,
        cy: e.clientY,
        w: b.width,
        h: b.height,
        isResizing: isResizing,
        onRightEdge: onRightEdge
      };
    }


    function calc(e) {
      b = pane.getBoundingClientRect();

      x = e.clientX;
      y = e.clientY;
      console.log('CAlc', b, x, y);
      onTopEdge = y < MARGINS;
      onLeftEdge = x < MARGINS;
      onRightEdge = x >= b.width - MARGINS;
      onBottomEdge = y >= b.height - MARGINS;

      rightScreenEdge = window.innerWidth - MARGINS;
      bottomScreenEdge = window.innerHeight - MARGINS;
    }

    var e;

    function onMove(ee) {
      console.log('On move running', ee);
      calc(ee);

      e = ee;

      redraw = true;

    }

    function animate() {

      requestAnimationFrame(animate);

      if (!redraw) return;

      redraw = false;

      if (clicked && clicked.isResizing) {

        if (clicked.onRightEdge) {
          pane.style.width = Math.max(x, minWidth) + 'px';
          // panecontainer.style.width = Math.max(x, minWidth) + 'px';
        }

        hintHide();

        return;
      }

      if (clicked && clicked.isMoving) {

        if (preSnapped) {
          setBounds(pane,
            e.clientX - preSnapped.width / 2,
            e.clientY - Math.min(clicked.y, preSnapped.height),
            preSnapped.width,
            preSnapped.height
          );

          return;
        }

        // moving
        pane.style.top = (e.clientY - clicked.y) + 'px';
        pane.style.left = (e.clientX - clicked.x) + 'px';

        return;
      }

      // This code executes when mouse moves without clicking

      // style cursor
      if (onRightEdge || onLeftEdge) {
        pane.style.cursor = 'ew-resize';
      }else {
        pane.style.cursor = 'default';
      }
    }

    animate();

    function onUp(e) {
      calc(e);

      if (clicked && clicked.isMoving) {
        // Snap
        var snapped = {
          width: b.width,
          height: b.height
        };

        if (b.top < FULLSCREEN_MARGINS || b.left < FULLSCREEN_MARGINS || b.right > window.innerWidth - FULLSCREEN_MARGINS || b.bottom > window.innerHeight - FULLSCREEN_MARGINS) {
          // hintFull();
          setBounds(pane, 0, 0, window.innerWidth, window.innerHeight);
          preSnapped = snapped;
        } else if (b.top < MARGINS) {
          // hintTop();
          setBounds(pane, 0, 0, window.innerWidth, window.innerHeight / 2);
          preSnapped = snapped;
        } else if (b.left < MARGINS) {
          // hintLeft();
          setBounds(pane, 0, 0, window.innerWidth / 2, window.innerHeight);
          preSnapped = snapped;
        } else if (b.right > rightScreenEdge) {
          // hintRight();
          setBounds(pane, window.innerWidth / 2, 0, window.innerWidth / 2, window.innerHeight);
          // setBounds(panecontainer, window.innerWidth / 2, 0, window.innerWidth / 2, window.innerHeight);

          preSnapped = snapped;
        } else if (b.bottom > bottomScreenEdge) {
          // hintBottom();
          setBounds(pane, 0, window.innerHeight / 2, window.innerWidth, window.innerWidth / 2);
          preSnapped = snapped;
        } else {
          preSnapped = null;
        }

        hintHide();

      }

      clicked = null;

    }

  }




  onShare(e, history) {
      console.log('Share clickedData', this.state.clickedData);
      var update = {};
      var id = this.state.clickedData.id;
      var arr;
      if(id) {
        firebase.database().ref('/share').on('value', snapshot => {
          const list = snapshot.val();
          arr = list ? Object.keys(list) : [];

          if(arr.indexOf(id) < 0) {
            var obj = {};
            obj.owner = firebase.auth().currentUser.uid;
            obj.info = this.state.clickedData;
            update[`/share/${id}`] = obj;
            firebase.database().ref().update(update);
          } else {
            firebase.database().ref().child(`/share/${id}`)
        .update({ info: this.state.clickedData });
          }
        });
        history.push(`/share/${this.state.clickedData.id}`);
      } else {
        window.alert('Please select one list to share');
      }
  }


  onSubmit(e) {
    var obj = {};
    this.setState({
      listSearchTerm: ''
    });
    // for edit
    if(!this.state.child && this.state.clickedData.id){
      // obj.id = this.state.clickedData.id;
      const id = this.state.clickedData.id;
      var sentence = this.state.draftInfo.replace('<p class="md-block-unstyled">', '');
      sentence = sentence.replace('</p>', '');
      obj.data = sentence;
      obj.title = this.state.title;
      const { currentUser } = firebase.auth();
      firebase.database().ref(`root/${currentUser.uid}/list/${id}`).update(obj);
      firebase.database().ref(`share/${id}/info`).update(obj);

      this.setState({
        clickedData: {},
        child: false,
        parentEdit: false,
        title: ''
      });
    }
    // for child node
    if(this.state.child && this.state.clickedData.id) {
      var sentence = this.state.draftInfo.replace('<p class="md-block-unstyled">', '');
      sentence = sentence.replace('</p>', '');
      const { currentUser } = firebase.auth();
      // console.log('ID..', firebase.database().ref().child(`/root/${currentUser.uid}/list`).push().key);
      const id = firebase.database().ref().child(`/root/${currentUser.uid}/list`).push().key;
      obj.id = id;
      obj.data = sentence;
      obj.parent = this.state.clickedData.id;
      obj.title = "";
      console.log('Child node to be added', obj);
      this.props.addListItem(obj, id);
      this.setState({ child: false });
    }
    else {
      console.log('NEW', this.state.draftInfo, this.state.new);
      if(this.state.draftInfo && this.state.new) {

        var sentence = this.state.draftInfo.replace('<p class="md-block-unstyled">', '');
        sentence = sentence.replace('</p>', '');
        const { currentUser } = firebase.auth();
        // console.log('ID..', firebase.database().ref().child(`/root/${currentUser.uid}/list`).push().key);
        const id = firebase.database().ref().child(`/root/${currentUser.uid}/list`).push().key;
        obj.id = id;
        obj.data = sentence;
        obj.parent = "";
        obj.title = this.state.title ? this.state.title : 'Untitled';

        this.props.addListItem(obj, id);
        this.setState({ clickedData: {}, new: false, title: '' });

      }
    }
    localStorage.removeItem('title');
    localStorage.removeItem('editorText');
    this.setState({ editorState: createEditorState() });
  }

  onNewClicked() {
    this.setState({
      new: true,
      inputValue: '',
      child: false,
      clickedData: {},
      title: '',
      editorState: createEditorState(),
    });
    this.titleInput.focus();
    // console.log('New button clicked', this.state.inputValue);
  }

  onChildClicked() {
    this.setState({
      child: true,
      new: false,
      parentEdit: false,
      title: '',
    });
  }


  deleteItem(id) {
    // console.log('delete', id, this.state.data, this.props.item);
    var answer = window.confirm("Are you Sure you want to delete this list?");
    if(answer) {
      // const getReducedArr = (data) => {
      //   return data.map((obj) => {
      //     if (obj !== undefined && obj.id !== id) {
      //       const children = obj.children ? getReducedArr(obj.children) : [];
      //       return {
      //         ...obj,
      //         ...(children.length > 0 ? { children } : Number(id))
      //       }
      //     }
      //   }).filter(data => data !== Number(id))
      // }

      const { currentUser } = firebase.auth();
      firebase.database().ref(`/root/${currentUser.uid}/list/${id}`).remove();

      this.setState({ inputValue: '' });
    }

  }


  handleChange(text) {
    this.setState({
      inputValue: text
    })
  }

  saveClickedButtonId(i) {
    this.setState({ clickedButton: i });
  }

  toggle(e, id) {
    var d = e.target;
    this.saveClickedButtonId(id);
    console.log('TOGGLE', d);
    var c = d.parentNode.parentNode.parentNode.parentNode.nextSibling;
    console.log('TOGGLE', d, c);
    this.setState({ collapsed: !this.state.collapsed }, function () {
      // console.log(this.state.collapsed, this.state.clickedButton);
      if(this.state.collapsed && id === this.state.clickedButton) {
        // d.innerHTML = <i className="fa fa-caret-up" />
        d.classList.remove('fa-caret-right');
        d.classList.add('fa-caret-down');
        c.classList.remove('hide');
        // c.setAttribute("style", "display: block;");

      } else {
        d.classList.remove('fa-caret-down');
        d.classList.add('fa-caret-right');
        c.classList.add('hide');
        // c.setAttribute("style", "display: none;");

      }

    });
    e.stopPropagation();

  }

  importDataToEditor(e) {
    const html = e;
    const editorState = createEditorState(convertToRaw(mediumDraftImporter(html)));
    // console.log('importDataToEditor', editorState);
    this.setState({ editorState });
  }

  clickHandler(e, d) {
    console.log('CLICKED', e.target, d);
    var target = e.target;
    var id = target.getAttribute('id');
    if(d.id) {

      this.importDataToEditor(d.data);
      console.log('clicked DATA', id, d.data);
      var obj = {};
      obj.id = d.id;
      obj.data = d.data;
      obj.parent = d.parent;
      if(d.parent === '') {
        this.setState({ parentEdit: true, title: d.title
        });
      } else {
        this.setState({ parentEdit: false });
      }

      this.setState({
        clickedData: obj,
        inputValue: d.data,
        new: false,
        clicked: true
      });

    }
    e.stopPropagation();
  }


  text_truncate = function(str, length, ending) {
    if (length == null) {
      length = 100;
    }
    if (ending == null) {
      ending = '...';
    }
    if (str.length > length) {
      return str.substring(0, length) + ending;
    } else {
      return str;
    }
  };

  deStructureData(arry) {
  var data = [], children = {};

  // find the top level nodes and hash the children based on parent
  for (var i = 0, len = arry.length; i < len; ++i) {
      var item = arry[i],
          p = item.parent,
          target = !p ? data : (children[p] || (children[p] = []));

      target.push(item);
  }
  // function to recursively build the tree
  var findChildren = function(parent) {
      if (children[parent.id]) {
          parent.children = children[parent.id];
          for (var i = 0, len = parent.children.length; i < len; ++i) {
              findChildren(parent.children[i]);
          }
      }
  };

  for (var j = 0, ln = data.length; j < ln; ++j) {
      findChildren(data[j]);
  }

  return data;
}

  renderButton(i) {
    // console.log('ID', i);
      return <span id={i} className="collapsedButton"  onClick={(e) => this.toggle(e, i)}>{this.state.buttonText}</span>;
    }

  renderList(list) {
    // console.log("LIST DATA", list);
    return list.map((d, i) => {

      if(d !== undefined) {
        // if(this.state.listSearchTerm) {
        //   const regex = new RegExp(this.state.listSearchTerm, 'gi');
        //   console.log(d.data, this.removeHtmlTags(d.data));
        //   // var withoutHtmlTag = this.removeHtmlTags(d.data);
        //   var newData = d.title.replace(regex, `<span class="highlight">${this.state.listSearchTerm}</span>`);
        //   var newTitle = d.title ? d.title.replace(regex, `<span class="highlight">${this.state.listSearchTerm}</span>`) : null;
        //   return (
        //     <div>
        //       {d.title && <p className="title">{renderHTML(newTitle)}</p>}
        //       {d.children && <div>{this.renderButton(d.id)}</div>}
        //       <li key={d.id} id={d.id} className="listData">
        //
        //         {renderHTML(this.text_truncate(newData,150))}
        //         {/*this.renderInput()*/}
        //         <span className="delButton" id={d.id} onClick={() => this.deleteItem(d.id)}>del</span>
        //         {d.children && <ul>{this.renderList(d.children)}</ul>}
        //       </li>
        //
        //     </div>
        //   );
        // }
        // else {
          var deta = d.data.replace(/<(figure|figcaption|img|br).*?>/g, '');
          // console.log('figure removed', deta);

          var data = this.highlightElement(deta, this.state.listSearchTerm) || deta;
          var title = this.highlightElement(d.title, this.state.listSearchTerm) || d.title;

          return (
            <div style={{ display: 'flex' }}>


              {/*d.children && <div>{this.renderButton(d.id)}</div>*/}

              <li key={d.id} id={d.id} className="listData" onClick={(e) => { this.clickHandler(e, d); }}>
                <a>
                  <p>{d.children && <span>{this.renderButton(d.id)}</span>}{d.title && <span className="title">{renderHTML(title)}</span>}</p>

                  {renderHTML(this.text_truncate(data,150))}
                  {/*this.renderInput()*/}
                  <span className="delButton" id={d.id} onClick={() => this.deleteItem(d.id)}>
                    <i className="fa fa-trash" />
                  </span>
                </a>

                {d.children && <div class="message hide"><ul>{this.renderList(d.children)}</ul></div>}
              </li>
            </div>
          );
        // }


      }
    });
  }

  onChangeSearchTerm(e, a) {
    if(a === 'title') {
      this.setState({ title: e.target.value }, function() {
        localStorage.setItem('title', this.state.title);
      });
    } else {
      this.setState({ listSearchTerm: e.target.value });
    }
    // if((a !== 'title') && (this.state.listSearchTerm === '')) {
    //   sampleText = window.document.getElementById('list').innerHTML;
    //   // sampleText = sampleText.replace(/<[^\/>][^>]*><\/[^>]+>/gim, "");
    //   sampleText = sampleText.replace(/<mark[^>]*(?:\/>|>(?:\s|&nbsp;)*<\/mark>)/gim, '');
    //   // to remove empty tag
    //   console.log('SAMPLE TEXT', sampleText);
    // }

  }

  highlightElement(text, term) {
    if(text && term) {
      var pattern = new RegExp('('+term+')(?![^<]*>)', 'gi');
      text = text.replace(pattern, '<mark>$1</mark>');
      return text;
    }

  }


  searchItem(wordToMatch, b) {
   return b.filter(function f(d) {
     const regex = new RegExp(wordToMatch, 'gi');
    //  console.log(d.data);
     if (d.children) {
       return (d.children = d.children.filter(f)).length
     } else {
       if(d.title) {
        //  console.log('Search title child', d);
         return d.data.match(regex) || d.title.match(regex);
       } else {
        //  console.log('Search no title child', d);
         return d.data.match(regex);
       }
     }
   });
  }


  render() {
    var dataOption = this.state.listSearchTerm ? this.searchItem(this.state.listSearchTerm, this.props.item) : this.props.item;
    var list = this.deStructureData(dataOption);
    console.log('LIST deStructureData', list);
    return (
      <div style={{ height: '100vh' }}>
        <Route render={({ history }) => (
          <button onClick={() => this.props.logOut(history)}>logout</button>
        )} />


        <div className="App" id="pane-container">
          <div style={{ position: 'relative', height: 'inherit', width: '35%', display: this.state.fullScreen ? 'none' : 'block' }}>
            <div id="pane" className="left-side">

              <input placeholder="Search list.." value={this.state.listSearchTerm} onChange={(e) => this.onChangeSearchTerm(e)}/>

              <ul id="list">
                <li>
                  <ul>
                    {list !== undefined && this.renderList(list)}
                  </ul>
                </li>

              </ul>


            </div>
            <div id="ghostpane"></div>
          </div>

          <div className="editor-container" id="editor">
          <div style={{ display: 'flex', justifyContent: 'space-between', margin: 5 }}>
            <button onClick={() => this.setState({ fullScreen: !this.state.fullScreen })}>{this.state.fullScreen ? <i className="fa fa-arrow-right" /> : <i className="fa fa-arrow-left" />}</button>
            <div style={{ display: 'flex' }}>
              <Route render={({ history }) => (
                <button className="button" onClick={(e) => this.onShare(e, history)}>Share</button>
              )} />
              <button className="button" onClick={(e) => this.onSubmit(e)}>Save</button>
              <button className="button" onClick={(e) => this.onNewClicked(e)}>New</button>
              <button className="button" onClick={(e) => this.onChildClicked(e)}>Child node</button>
            </div>
          </div>
            <input placeholder="Title.."
              value={this.state.title}
              onChange={(text) => this.onChangeSearchTerm(text, 'title')}
              disabled = {(this.state.new || this.state.parentEdit)? "" : "disabled"}
              ref={input => this.titleInput = input}
            />

            <Editor
            ref="editor"
            editorState={this.state.editorState}
            sideButtons={this.sideButtons}
            onChange={this.onChange} />
          </div>
        </div>

      </div>
    );
  }
}
const mapStateToProps = (state) => {
  return {
    item: state.item.items,
    user: state.user.user
  }
}

export default connect(mapStateToProps, {addListItem, logOut, fetchItem, SingleUserFetch})(App);
