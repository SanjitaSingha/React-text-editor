import React, { Component } from 'react';
import './App.css';
import Editor from 'react-medium-editor';
import { connect } from 'react-redux';
import renderHTML from 'react-render-html';
import { addListItem } from './actions'

var id = 0;
class App extends Component {
  state = {
    inputValue: '',
    data: [],
    clickedData: '',
    clicked: false,
    new: true,
    child: false,
    collapsed: false,
    buttonText: '-',
  }
  componentWillReceiveProps(nextProps) {
    this.setState({ data: nextProps.item });
  }
  onSubmit(e) {
    var obj = {};
    console.log('clickedData', this.state.clickedData);
    // for edit
    if(!this.state.child && this.state.clickedData.id){
      obj.id = Number(this.state.clickedData.id);
      obj.data = this.state.inputValue;
      var d = this.props.item.filter(a => {
        if(a.id === Number(this.state.clickedData.id)) {
          return true;
        }
      });
      obj.parent = d[0].parent;
      var c = this.props.item.filter(a => {
        if(a.id !== Number(this.state.clickedData.id)) {
          return true;
        }
      });
      console.log('EDIT', c);
      c.push(obj);
      this.props.addListItem(c);
      this.setState({
        clickedData: {},
        child: false,
      });
    }
    // for child node
    if(this.state.child && this.state.clickedData.id) {
      var sentence = this.state.inputValue.replace('<p>', '');
      sentence = sentence.replace('</p>', '');
      obj.id = id;
      obj.data = sentence;
      obj.parent = this.state.clickedData.id;
      id++;
      var data = this.state.data;
      data.push(obj);
      console.log('child node', data);
      this.props.addListItem(data);
      this.setState({ child: false })
    }
    else {
      console.log('NEW', this.state.inputValue, this.state.new);
      if(this.state.inputValue && this.state.new) {

        var sentence = this.state.inputValue.replace('<p>', '');
        sentence = sentence.replace('</p>', '');
        obj.id = id;
        obj.data = sentence;
        obj.parent = "";

        id++;
        // listData = this.props.item;
        var ab = this.state.data;
          console.log('SUBMIT', ab);
        ab.push(obj);
        this.props.addListItem(ab);
        this.setState({ clickedData: {}, new: false });
      }
    }
  }

  onNewClicked() {
    this.setState({
      new: true,
      inputValue: '',
      child: false,
      clickedData: {}
    });
    console.log('New button clicked', this.state.inputValue);
  }

  onChildClicked() {
    this.setState({
      child: true,
      new: false
    });
  }

  deleteItem(id) {
    console.log('delete', id);
    var c = this.props.item.filter(a => {
      if(a.id !== Number(id)) {
        return true;
      }
    });
    console.log('DELETED', c);
    this.props.addListItem(c);
    this.setState({ inputValue: '' });
  }
//
//    getSelectedText() {
//     var text = "";
//     if (typeof window.getSelection !== "undefined") {
//         // console.log(window.getSelection.getRangeAt(0));
//         text = window.getSelection().toString();
//     } else if (typeof document.selection !== "undefined" && document.selection.type === "Text") {
//         text = document.selection.createRange().text;
//     }
//     return text;
// }
//
//  doSomethingWithSelectedText() {
//     var selectedText = this.getSelectedText();
//     if (selectedText) {
//       document.getElementById("style-format").style.visibility = "visible";
//       // alert("Got selected text " + selectedText);
//     } else{
//       document.getElementById("style-format").style.visibility = "hidden";
//     }
//
//   }


  handleChange(text) {
    this.setState({
      inputValue: text
    })
  }

  saveClickedButtonId(i) {
    this.setState({ clickedButton: i });
  }

  toggle(t, i) {
    var d = t;
    this.saveClickedButtonId(i);
    this.setState(function(prevState, props){
     return {collapsed: !prevState.collapsed}
    });
    if(this.state.collapsed && i === this.state.clickedButton) {
      d.innerHTML = '+'
    } else {
      d.innerHTML = '-'
    }
    // this.setState({ collapsed: !this.state.collapsed });
    var c = d.parentNode.nextSibling.childNodes;
    console.log('TOGGLE OUTER', c, this.state.collapsed);

    for (var i = 0; i < c.length; i++) {
    	// if(c[i].nodeName === 'LI' || ) {

			    var e = c[i].childNodes;
            console.log('TOGGLE', c[i], e);
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

  }

  clickHandler(e) {
    var target = e.target;
    // this.toggle(target);
    console.log('clicked DATA', target.getAttribute('id'), target);
    var id = target.getAttribute('id');
    if(id) {
      var c = this.props.item.filter(a => {
        if(a.id === Number(id)) {
          return true;
        }
      });
      console.log('print', c);
      var obj = {};
      obj.id = id;
      obj.data = c[0].data;
      if(target.getAttribute('id')) {
        this.setState({
          clickedData: obj,
          inputValue: c[0].data,
          clicked: true
        });
      }
    }
  }

  // renderInput() {
  //   if(this.state.clicked) {
  //     return (
  //       <div style={{ display: 'flex', flex: 1 }}>
  //         <textarea className="textarea"></textarea>
  //         <span onClick={() => { console.log('This is span click'); this.setState({ clicked: false }); }}>close</span>
  //       </div>
  //     )
  //   }
  // }

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
    var roots = [], children = {};

    // find the top level nodes and hash the children based on parent
    for (var i = 0, len = arry.length; i < len; ++i) {
        var item = arry[i],
            p = item.parent,
            target = !p ? roots : (children[p] || (children[p] = []));

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

    for (var j = 0, ln = roots.length; j < ln; ++j) {
        findChildren(roots[j]);
    }

    return roots;
  }

  renderButton(i) {
    console.log('ID', i);
      return <button id={i} style={{ alignSelf: 'flex-start' }} onClick={(e) => this.toggle(e.target, i)}>{this.state.buttonText}</button>;
    }


  renderList(list) {
    console.log("LIST DATA", list);
    return list.map((d, i) => {
      return (
        <div>
        {d.children && <div>{this.renderButton(d.id)}</div>}
        <li key={d.id} id={d.id} className="listData">

          {renderHTML(this.text_truncate(d.data,60))}
          {/*this.renderInput()*/}
          <span className="delButton" id={d.id} onClick={() => this.deleteItem(d.id)}>del</span>
          {d.children && <ul>{this.renderList(d.children)}</ul>}
        </li>
        </div>
      );

    });
  }

  render() {
    var list = this.deStructureData(this.state.data);
    console.log(list);
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', margin: 5 }}>
          <button className="button" onClick={(e) => this.onSubmit(e)}>Save</button>
          <button className="button" onClick={(e) => this.onNewClicked(e)}>New</button>
          <button className="button" onClick={(e) => this.onChildClicked(e)}>Child node</button>
        </div>
        <div className="App">
          <div className="right-side">

            <ul id="list" onClick={(e) => { this.clickHandler(e); }}>
              {this.renderList(list)}
            </ul>


          </div>
          {/*<textarea className="textarea" value={this.state.inputValue}
            onMouseUp={() => this.doSomethingWithSelectedText()}
            onChange={(e) => this.onChange(e) } onKeyUp={(e) => this.onSubmit(e)} >
          </textarea>*/}
          <div className="editor-container">
            <Editor
              className="editor"
              value={this.state.inputValue}
              text={this.state.inputValue}
              onChange={(text) => this.handleChange(text)}
            />
          </div>
        </div>

      </div>
    );
  }
}
const mapStateToProps = (state) => {
  return {
    item: state.item.items
  }
}

export default connect(mapStateToProps, {addListItem})(App);
