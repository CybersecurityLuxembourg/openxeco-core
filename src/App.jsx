import React from "react";
import "./App.css";
import "./css/medium-editor.css";
import { NotificationContainer, NotificationManager as nm } from "react-notifications";
import "react-notifications/lib/notifications.css";
import { BrowserRouter } from "react-router-dom";
import { withCookies } from "react-cookie";
import InsideApp from "./component/InsideApp.jsx";
import Login from "./component/Login.jsx";
import { getApiURL } from "./utils/env.jsx";
import { getRequest } from "./utils/request.jsx";
import DialogMessage from "./component/dialog/DialogMessage.jsx";

class App extends React.Component {
	constructor(props) {
		super(props);

		this.connect = this.connect.bind(this);
		this.getSettings = this.getSettings.bind(this);

		this.state = {
			settings: null,
			logged: false,
			email: null,
			openMobileDialog: window
				.matchMedia("only screen and (max-width: 760px)").matches,
		};
	}

	// eslint-disable-next-line class-methods-use-this
	componentDidMount() {
		document.getElementById("favicon").href = getApiURL() + "public/get_public_image/favicon.ico";
		this.getSettings();
	}

	getSettings() {
		getRequest.call(this, "public/get_public_settings", (data) => {
			const settings = {};

			data.forEach((d) => {
				settings[d.property] = d.value;
			});

			this.setState({
				settings,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
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
							settings={this.state.settings}
							email={this.state.email}
							cookies={this.props.cookies}
						/>
					</BrowserRouter>
					: <Login
						settings={this.state.settings}
						connect={this.connect}
						cookies={this.props.cookies}
					/>
				}

				<NotificationContainer/>

				<DialogMessage
					trigger={""}
					text={<div>
						<h3>We have detected a small screen usage</h3>
						<p>
							This application is a content management platform.
							Hence, the functionnalities and the user interfaces
							are not optimized for mobile terminals.
						</p>
						<p>
							For a better experience, please use a computer or a
							tablet with a large screen.
						</p>
					</div>}
					open={this.state.openMobileDialog}
				/>
			</div>
		);
	}
}

export default withCookies(App);
