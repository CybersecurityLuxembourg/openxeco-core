import React from "react";
import "./PageContact.css";
import Tab from "./tab/Tab.jsx";
import ContactList from "./pagecontact/ContactList.jsx";
import ContactSend from "./pagecontact/ContactSend.jsx";
import { getUrlParameter } from "../utils/url.jsx";

export default class PageContact extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			selectedMenu: null,
			tabs: [
				"send",
				"ongoing",
			],
		};
	}

	componentDidMount() {
		if (getUrlParameter("tab") !== null && this.state.tabs.indexOf(getUrlParameter("tab")) >= 0) {
			this.setState({ selectedMenu: getUrlParameter("tab") });
		}
	}

	componentDidUpdate() {
		if (this.state.selectedMenu !== getUrlParameter("tab")
			&& this.state.tabs.indexOf(getUrlParameter("tab")) >= 0) {
			this.setState({ selectedMenu: getUrlParameter("tab") });
		}
	}

	onMenuClick(m) {
		this.props.history.push("?tab=" + m);
	}

	render() {
		return (
			<div id="PageContact" className="page max-sized-page">
				<h1>Contact us</h1>

				<Tab
					labels={[
						"Send a message",
						"My ongoing messages",
					]}
					selectedMenu={this.state.selectedMenu}
					onMenuClick={(m) => this.onMenuClick(m)}
					keys={this.state.tabs}
					content={[
						<ContactSend
							key={"send"}
							getNotifications={this.props.getNotifications}
							settings={this.props.settings}
						/>,
						<ContactList
							key={"ongoing"}
							getNotifications={this.props.getNotifications}
						/>,
					]}
				/>
			</div>
		);
	}
}
