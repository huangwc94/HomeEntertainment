import React from 'react';
import {createStore} from 'redux'
import {Provider} from 'react-redux';
import {reducer} from "./reducer";

export const store = createStore(reducer);

export const HomeEntertainmentStore = (props) => {
    return (
        <Provider store={store}>
            {props.children}
        </Provider>
    )
    };
