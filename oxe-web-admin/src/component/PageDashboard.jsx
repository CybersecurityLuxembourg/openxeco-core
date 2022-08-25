import React from "react";
import "./PageDashboard.css";
import { NotificationManager as nm } from "react-notifications";
import { getRequest } from "../utils/request.jsx";
import DashboardAnalytics from "./pagedashboard/DashboardAnalytics.jsx";
import DashboardCommunity from "./pagedashboard/DashboardCommunity.jsx";
import DashboardGraph from "./pagedashboard/DashboardGraph.jsx";
import DashboardRecentActivity from "./pagedashboard/DashboardRecentActivity.jsx";
import Tab from "./tab/Tab.jsx";
import { getUrlParameter } from "../utils/url.jsx";

export default class PageDashboard extends React.Component {
	constructor(props) {
		super(props);

		this.getAnalytics = this.getAnalytics.bind(this);
		this.getEntities = this.getEntities.bind(this);
		this.onMenuClick = this.onMenuClick.bind(this);

		this.state = {
			analytics: null,
			entities: null,
			selectedMenu: null,
			tabs: [
				"community",
				"graph",
				"analytics",
				"recent_activities",
			],
		};
	}

	componentDidMount() {
		if (getUrlParameter("tab") !== null && this.state.tabs.indexOf(getUrlParameter("tab")) >= 0) {
			this.setState({ selectedMenu: getUrlParameter("tab") });
		}

		this.refresh();
	}

	componentDidUpdate() {
		if (this.state.selectedMenu !== getUrlParameter("tab")
			&& this.state.tabs.indexOf(getUrlParameter("tab")) >= 0) {
			this.setState({ selectedMenu: getUrlParameter("tab") });
		}
	}

	refresh() {
		this.getAnalytics();
		this.getEntities();
	}

	getAnalytics() {
		this.setState({ analytics: null }, () => {
			getRequest.call(this, "public/get_public_analytics", (data) => {
				this.setState({
					analytics: data,
				});
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		});
	}

	getEntities() {
		this.setState({ entities: null }, () => {
			getRequest.call(this, "entity/get_entities", (data) => {
				this.setState({
					entities: data,
				});
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		});
	}

	onMenuClick(m) {
		this.props.history.push("?tab=" + m);
	}

	render() {
		return (
			<div id="PageDashboard" className="page max-sized-page">
				<Tab
					labels={["Community", "Network graph", "Usage analytics", "Recent activities"]}
					selectedMenu={this.state.selectedMenu}
					onMenuClick={this.onMenuClick}
					keys={this.state.tabs}
					content={[
						<DashboardCommunity
							key={"community"}
							analytics={this.state.analytics}
							entities={this.state.entities}
						/>,
						<DashboardGraph
							key={"graph"}
							analytics={this.state.analytics}
							entities={this.state.entities}
						/>,
						<DashboardAnalytics
							key={"analytics"}
						/>,
						<DashboardRecentActivity
							key={"recent_activity"}
							entities={this.state.entities}
						/>,
					]}
				/>
			</div>
		);
	}
}
