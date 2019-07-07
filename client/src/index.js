import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './containers/App';
import Admin from './containers/Admin';
import * as serviceWorker from './serviceWorker';

import { Route, BrowserRouter as Router } from 'react-router-dom';
import Room from './containers/Room';
import Controller from './containers/Controller';
import { HomeEntertainmentStore } from './store';


const Index = () => (
    <Router>
        <Route exact path='/' component={App}/>
        <Route path='/room/:game' component={Room}/>
        <Route exact path='/controller/:room/:game' component={Controller}/>
        <Route exact path='/admin' component={Admin}/>
    </Router>
);


ReactDOM.render(<HomeEntertainmentStore><Index/></HomeEntertainmentStore>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
