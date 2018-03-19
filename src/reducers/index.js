import { combineReducers } from 'redux';
import Item from './ItemReducer';

const rootReducer = combineReducers({
  item: Item
});

export default rootReducer;
