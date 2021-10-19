import React from "react";
import "./PageTask.css";
import { NotificationManager as nm } from "react-notifications";
import TaskRequest from "./pagetask/TaskRequest.jsx";
import TaskDataControl from "./pagetask/TaskDataControl.jsx";
import TaskArticle from "./pagetask/TaskArticle.jsx";
import Tab from "./tab/Tab.jsx";
import { getRequest } from "../utils/request.jsx";

export default class PageTask extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			notifications: null,
		};
	}

	componentDidMount() {
		this.getNotifications();
	}

	getNotifications() {
		this.setState({ notifications: null });

		getRequest.call(this, "notification/get_notifications", (data) => {
			this.setState({
				notifications: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	getTaskNotificationBlock(type) {
		if (this.state.notifications === null
			|| this.state.notifications[type] === undefined) {
			return "";
		}

		return this.state.notifications[type];
	}

	render() {
		return (
			<div id="PageTask" className="page max-sized-page">
				<Tab
					menu={[
						"Request",
						"Article to review",
						"Data control",
					]}
					notifications={[
						this.getTaskNotificationBlock("new_requests"),
						this.getTaskNotificationBlock("articles_under_review"),
						this.getTaskNotificationBlock("data_control"),
					]}
					content={[
						<TaskRequest
							key={"task"}
						/>,
						<TaskArticle
							key={"article"}
						/>,
						<TaskDataControl
							key={"datacontrol"}
						/>,
					]}
				/>
			</div>
		);
	}
}
