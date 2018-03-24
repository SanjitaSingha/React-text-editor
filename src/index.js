import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import 'medium-editor/dist/css/medium-editor.css';
import 'medium-editor/dist/css/themes/default.css';
import 'medium-draft/lib/index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import logger from 'redux-logger';
import rootReducer from './reducers';

const createStoreWithMiddleware = applyMiddleware(thunk, logger)(createStore);

ReactDOM.render(<Provider store={createStoreWithMiddleware(rootReducer)}><App /></Provider>, document.getElementById('root'));
registerServiceWorker();
