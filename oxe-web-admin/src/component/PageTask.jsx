import React from "react";
import "./PageTask.css";
import { NotificationManager as nm } from "react-notifications";
import TaskRequest from "./pagetask/TaskRequest.jsx";
import TaskDataControl from "./pagetask/TaskDataControl.jsx";
import TaskArticle from "./pagetask/TaskArticle.jsx";
import Tab from "./tab/Tab.jsx";
import { getRequest } from "../utils/request.jsx";
import { getUrlParameter } from "../utils/url.jsx";
import { getSettingValue } from "../utils/setting.jsx";

export default class PageTask extends React.Component {
	constructor(props) {
		super(props);

		this.onMenuClick = this.onMenuClick.bind(this);
		this.getTaskNotificationBlock = this.getTaskNotificationBlock.bind(this);
		this.updateTabs = this.updateTabs.bind(this);
		this.getNotifications = this.getNotifications.bind(this);

		this.state = {
			notifications: null,
			selectedMenu: "request",
			tabs: [
				"request",
				"article_to_review",
				"data_control",
			],
			labels: null,
			tabNotifications: null,
			content: null,
		};
	}

	componentDidMount() {
		if (getUrlParameter("tab") !== null && this.state.tabs.indexOf(getUrlParameter("tab")) >= 0) {
			this.setState({ selectedMenu: getUrlParameter("tab") });
		}

		this.getNotifications();
		this.updateTabs();
	}

	componentDidUpdate(prevProps, prevState) {
		if (this.state.selectedMenu !== getUrlParameter("tab")
			&& this.state.tabs.indexOf(getUrlParameter("tab")) >= 0) {
			this.setState({ selectedMenu: getUrlParameter("tab") });
		}

		if (JSON.stringify(prevState.notifications) !== JSON.stringify(this.state.notifications)
			|| JSON.stringify(prevProps.settings) !== JSON.stringify(this.props.settings)) {
			this.updateTabs();
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
		if (!this.state.notifications || !this.state.notifications[type]) {
			return "";
		}

		return this.state.notifications[type];
	}

	updateTabs() {
		if ((Number.isInteger(this.getTaskNotificationBlock("articles_under_review"))
			&& this.getTaskNotificationBlock("articles_under_review") > 0)
			|| getSettingValue(this.props.settings, "DEACTIVATE_REVIEW_ON_ECOSYSTEM_ARTICLE") !== "TRUE") {
			this.setState({
				tabs: [
					"request",
					"article_to_review",
					"data_control",
				],
				labels: [
					"Request",
					"Article to review",
					"Data control",
				],
				tabNotifications: [
					this.getTaskNotificationBlock("new_requests"),
					this.getTaskNotificationBlock("articles_under_review"),
					this.getTaskNotificationBlock("data_control"),
				],
				content: [
					<TaskRequest
						key={"task"}
					/>,
					<TaskArticle
						key={"article"}
					/>,
					<TaskDataControl
						key={"datacontrol"}
					/>,
				],
			});
		} else {
			this.setState({
				tabs: [
					"request",
					"data_control",
				],
				labels: [
					"Request",
					"Data control",
				],
				tabNotifications: [
					this.getTaskNotificationBlock("new_requests"),
					this.getTaskNotificationBlock("data_control"),
				],
				content: [
					<TaskRequest
						key={"task"}
					/>,
					<TaskDataControl
						key={"datacontrol"}
					/>,
				],
			});
		}
	}

	onMenuClick(m) {
		this.props.history.push("?tab=" + m);
	}

	render() {
		return (
			<div id="PageTask" className="page max-sized-page">
				<Tab
					labels={this.state.labels || []}
					selectedMenu={this.state.selectedMenu}
					onMenuClick={this.onMenuClick}
					notifications={this.state.tabNotifications || []}
					keys={this.state.tabs || []}
					content={this.state.content || []}
				/>
			</div>
		);
	}
}
