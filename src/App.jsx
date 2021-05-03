import React from "react";
import "./App.css";
import "./css/medium-editor.css";
import { NotificationContainer } from "react-notifications";
import "react-notifications/lib/notifications.css";
import { BrowserRouter } from "react-router-dom";
import { withCookies } from "react-cookie";
import InsideApp from "./component/InsideApp.jsx";
import Login from "./component/Login.jsx";

class App extends React.Component {
	constructor(props) {
		super(props);

		this.connect = this.connect.bind(this);

		this.state = {
			logged: false,
			email: null,
		};
	}

	connect(email) {
		this.setState({
			logged: true,
			email,
		});
	}

	render() {
		return (
			<div id="App">
				{this.state.logged
					? <BrowserRouter>
						<InsideApp
							email={this.state.email}
							cookies={this.props.cookies}
						/>
					</BrowserRouter>
					: <Login
						connect={this.connect}
						cookies={this.props.cookies}
					/>
				}
				<NotificationContainer/>
			</div>
		);
	}
}

export default withCookies(App);
