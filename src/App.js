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
import { addListItem, logOut, fetchItem } from './actions'
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
      buttonText: '-',
      editorState: createEditorState()
    };
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
        this.setState({ loggedIn: true });
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
      // console.log(getReducedArr(this.props.item));
      // var filtered = getReducedArr(this.props.item);
      //
      // var b = filtered.filter(a => {
      //   return a !== undefined
      // });

      // this.props.addListItem(b);
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

  toggle(t, id) {
    var d = t;
    this.saveClickedButtonId(id);

    var c = d.parentNode.nextSibling.childNodes;
    this.setState({ collapsed: !this.state.collapsed }, function () {
      // console.log(this.state.collapsed, this.state.clickedButton);
      if(this.state.collapsed && id === this.state.clickedButton) {
        d.innerHTML = '+'
      } else {
        d.innerHTML = '-'
      }
      for (var i = 0; i < c.length; i++) {
        // if(c[i].nodeName === 'LI' || ) {

            var e = c[i].childNodes;
              // console.log('TOGGLE', c[i], e);
              if(c[i].nodeName === 'UL') {
                if(this.state.collapsed) {
                  c[i].classList.add('hide');
                } else {
                  c[i].classList.remove('hide');
                }
              }
            // for(var j = 0; j < e.length; j++) {
            //   // console.log('TOGGLE', e[j]);
            //   if(e[j].nodeName === 'DIV') {
            //     if(this.state.collapsed) {
            //       e[j].classList.add('hide');
            //     } else {
            //       e[j].classList.remove('hide');
            //     }
            //   }
            // }
          // }
      }
    });
    // this.setState({ collapsed: !this.state.collapsed });

    // console.log('TOGGLE OUTER', c, this.state.collapsed);
  }

  importDataToEditor(e) {
    const html = e;
    const editorState = createEditorState(convertToRaw(mediumDraftImporter(html)));
    // console.log('importDataToEditor', editorState);
    this.setState({ editorState });
  }

  clickHandler(e, d) {
    var target = e.target;
    var id = target.getAttribute('id');
    if(id && id === d.id) {

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
      return <button id={i} className="collapsedButton"  onClick={(e) => this.toggle(e.target, i)}>{this.state.buttonText}</button>;
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
          var data = this.highlightElement(d.data, this.state.listSearchTerm) || d.data;
          var title = this.highlightElement(d.title, this.state.listSearchTerm) || d.title;

          return (
            <div style={{ display: 'flex' }}>


              {d.children && <div>{this.renderButton(d.id)}</div>}

              <li key={d.id} id={d.id} className="listData" onClick={(e) => { this.clickHandler(e, d); }}>
                {d.title && <p className="title">{renderHTML(title)}</p>}
                {renderHTML(this.text_truncate(data,150))}
                {/*this.renderInput()*/}
                <span className="delButton" id={d.id} onClick={() => this.deleteItem(d.id)}>
                  <i className="fa fa-trash" />
                </span>
                {d.children && <ul>{this.renderList(d.children)}</ul>}
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
      // var text1 = text.replace(/<mark[^>]*(?:\/>|>(?:\s|&nbsp;)*<\/mark>)/im, '');
      text = text.replace(pattern, '<mark>$1</mark>');
      // console.log('TEXT', text);
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

    // var text = this.state.editorSearchTerm ?

    return (
      this.state.loggedIn ?
      <div style={{ height: '100vh' }}>
        <Route render={({ history }) => (
          <button onClick={() => this.props.logOut(history)}>logout</button>
        )} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', margin: 5 }}>

          <button className="button" onClick={(e) => this.onSubmit(e)}>Save</button>
          <button className="button" onClick={(e) => this.onNewClicked(e)}>New</button>
          <button className="button" onClick={(e) => this.onChildClicked(e)}>Child node</button>
        </div>

        <div className="App">

          <div className="right-side">
            <input placeholder="Search list.." value={this.state.listSearchTerm} onChange={(e) => this.onChangeSearchTerm(e)}/>

            <ul id="list">

              {list !== undefined && this.renderList(list)}
            </ul>

          </div>

          <div className="editor-container">
            <input placeholder="Title.."
              value={this.state.title}
              onChange={(text) => this.onChangeSearchTerm(text, 'title')}
              disabled = {(this.state.new || this.state.parentEdit)? "" : "disabled"}
              ref={input => this.titleInput = input}
            />
            {/*<Editor
              className="editor"
              value={this.state.inputValue}
              text={this.state.inputValue}
              onChange={(text) => this.handleChange(text)}
            />*/}
            <Editor
            ref="editor"
            editorState={this.state.editorState}
            onChange={this.onChange} />
          </div>
        </div>

      </div> :
      <div>Login</div>
    );
  }
}
const mapStateToProps = (state) => {
  return {
    item: state.item.items,
  }
}

export default connect(mapStateToProps, {addListItem, logOut, fetchItem})(App);
