import React from 'react';

import IO from 'socket.io-client';

export class Main extends React.Component {

    componentDidMount(): void {
        const io = IO.connect("http://localhost:8000");
        io.on('connect',() => {
            alert(`${io.id}`)
        });
    }

    render() {
        return (<div><h1>Hello</h1></div>)
    }
}
