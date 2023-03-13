import React from "react";
import "./TaskDataControl.css";
import TaskDataControlList from "./taskdatacontrol/TaskDataControlList.jsx";
import TaskDataControlLaunch from "./taskdatacontrol/TaskDataControlLaunch.jsx";
import Tab from "../tab/Tab.jsx";

export default class TaskDataControl extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			selectedMenu: null,
			tabs: [
				"controls",
				"launch",
			],
		};
	}

	onMenuClick(m) {
		this.setState({ selectedMenu: m });
	}

	render() {
		return (
			<div id="TaskDataControl" className="max-sized-page">
				<div className={"row"}>
					<div className="col-md-12">
						<h1>Data control</h1>
					</div>
				</div>

				<Tab
					fullWidth={true}
					labels={["Controls", "Launch scan"]}
					selectedMenu={this.state.selectedMenu}
					onMenuClick={(m) => this.onMenuClick(m)}
					keys={this.state.tabs}
					content={[
						<TaskDataControlList
							key={"list"}
						/>,
						<TaskDataControlLaunch
							key={"launch"}
						/>,
					]}
				/>
			</div>
		);
	}
}
