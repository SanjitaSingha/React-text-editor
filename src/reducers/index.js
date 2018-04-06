import { combineReducers } from 'redux';
import Item from './ItemReducer';
import user from './UserReducer';

const rootReducer = combineReducers({
  item: Item,
  user 
});

export default rootReducer;
