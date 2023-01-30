import React from "react";
import "./PageUser.css";
import UserUser from "./pageuser/UserUser.jsx";
import UserGroup from "./pageuser/UserGroup.jsx";
import Tab from "./tab/Tab.jsx";
import { getUrlParameter } from "../utils/url.jsx";

export default class PageUser extends React.Component {
	constructor(props) {
		super(props);

		this.onMenuClick = this.onMenuClick.bind(this);

		this.state = {
			selectedMenu: null,
			tabs: [
				"user",
				"group",
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
			<div id="PageUser" className="page max-sized-page">
				<Tab
					labels={["User", "Group"]}
					selectedMenu={this.state.selectedMenu}
					onMenuClick={this.onMenuClick}
					keys={this.state.tabs}
					content={[
						<UserUser
							key={"user"}
							user={this.props.user}
						/>,
						<UserGroup
							key={"group"}
						/>,
					]}
				/>
			</div>
		);
	}
}
