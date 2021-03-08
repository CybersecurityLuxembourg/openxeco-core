import React from "react";
import "./PageUser.css";
import UserUser from "./pageuser/UserUser.jsx";
import UserGroup from "./pageuser/UserGroup.jsx";
import Tab from "./tab/Tab.jsx";

export default class PageUser extends React.Component {
	constructor(props) {
		super(props);

		this.state = {};
	}

	// eslint-disable-next-line class-methods-use-this
	render() {
		return (
			<div id="PageUser" className="page max-sized-page">
				<Tab
					menu={["User", "Group"]}
					content={[
						<UserUser
							key={"user"}
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
