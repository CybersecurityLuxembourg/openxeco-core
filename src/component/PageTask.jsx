import React from "react";
import "./PageTask.css";
import TaskRequest from "./pagetask/TaskRequest.jsx";
import Tab from "./tab/Tab.jsx";

export default class PageTask extends React.Component {
	constructor(props) {
		super(props);

		this.state = {};
	}

	// eslint-disable-next-line class-methods-use-this
	render() {
		return (
			<div id="PageTask" className="page max-sized-page">
				<Tab
					menu={["Request"]}
					content={[
						<TaskRequest
							key={"task"}
						/>,
					]}
				/>
			</div>
		);
	}
}
