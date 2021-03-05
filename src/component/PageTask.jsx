import React from "react";
import "./PageTask.css";
import TaskRequest from "./pagetask/TaskRequest";
import Tab from "./tab/Tab";

export default class PageTask extends React.Component {
	constructor(props) {
		super(props);

		this.state = {};
	}

	render() {
		return (
			<div id="PageTask" className="page max-sized-page">
				<Tab
					menu={["Request"]}
					content={[<TaskRequest/>]}
				/>
			</div>
		);
	}
}
