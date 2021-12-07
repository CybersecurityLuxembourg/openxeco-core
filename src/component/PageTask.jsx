import React from "react";
import "./PageTask.css";
import { NotificationManager as nm } from "react-notifications";
import TaskRequest from "./pagetask/TaskRequest.jsx";
import TaskDataControl from "./pagetask/TaskDataControl.jsx";
import TaskArticle from "./pagetask/TaskArticle.jsx";
import TaskUserToAssign from "./pagetask/TaskUserToAssign.jsx";
import Tab from "./tab/Tab.jsx";
import { getRequest } from "../utils/request.jsx";
import { getUrlParameter } from "../utils/url.jsx";

export default class PageTask extends React.Component {
	constructor(props) {
		super(props);

		this.onMenuClick = this.onMenuClick.bind(this);

		this.state = {
			notifications: null,
			selectedMenu: null,
			tabs: [
				"request",
				"user_to_assign",
				"article_to_review",
				"data_control",
			],
		};
	}

	componentDidMount() {
		if (getUrlParameter("tab") !== null && this.state.tabs.indexOf(getUrlParameter("tab")) >= 0) {
			this.setState({ selectedMenu: getUrlParameter("tab") });
		}

		this.getNotifications();
	}

	componentDidUpdate() {
		if (this.state.selectedMenu !== getUrlParameter("tab")
			&& this.state.tabs.indexOf(getUrlParameter("tab")) >= 0) {
			this.setState({ selectedMenu: getUrlParameter("tab") });
		}
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

	onMenuClick(m) {
		this.props.history.push("?tab=" + m);
	}

	render() {
		return (
			<div id="PageTask" className="page max-sized-page">
				<Tab
					labels={[
						"Request",
						"User to assign",
						"Article to review",
						"Data control",
					]}
					selectedMenu={this.state.selectedMenu}
					onMenuClick={this.onMenuClick}
					notifications={[
						this.getTaskNotificationBlock("new_requests"),
						this.getTaskNotificationBlock("user_to_assign"),
						this.getTaskNotificationBlock("articles_under_review"),
						this.getTaskNotificationBlock("data_control"),
					]}
					keys={this.state.tabs}
					content={[
						<TaskRequest
							key={"task"}
						/>,
						<TaskUserToAssign
							key={"user_to_assign"}
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
