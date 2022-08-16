import React from "react";
import "./PageDashboard.css";
import { NotificationManager as nm } from "react-notifications";
import { getRequest } from "../utils/request.jsx";
import DashboardAnalytics from "./pagedashboard/DashboardAnalytics.jsx";
import DashboardEcosystem from "./pagedashboard/DashboardEcosystem.jsx";
import DashboardRecentActivity from "./pagedashboard/DashboardRecentActivity.jsx";
import Tab from "./tab/Tab.jsx";
import { getUrlParameter } from "../utils/url.jsx";

export default class PageDashboard extends React.Component {
	constructor(props) {
		super(props);

		this.getAnalytics = this.getAnalytics.bind(this);
		this.getCompanies = this.getCompanies.bind(this);
		this.onMenuClick = this.onMenuClick.bind(this);

		this.state = {
			analytics: null,
			companies: null,
			selectedMenu: null,
			tabs: [
				"community",
				"network",
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
		this.getCompanies();
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

	getCompanies() {
		this.setState({ companies: null }, () => {
			getRequest.call(this, "company/get_companies", (data) => {
				this.setState({
					companies: data,
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
					labels={["Dashboard", "Network", "Analytics", "Recent activities"]}
					selectedMenu={this.state.selectedMenu}
					onMenuClick={this.onMenuClick}
					keys={this.state.tabs}
					content={[
						<DashboardEcosystem
							key={"community"}
							analytics={this.state.analytics}
							companies={this.state.companies}
						/>,
						<DashboardEcosystem
							key={"community"}
							analytics={this.state.analytics}
							companies={this.state.companies}
						/>,
						<DashboardAnalytics
							key={"analytics"}
						/>,
						<DashboardRecentActivity
							key={"recent_activity"}
							companies={this.state.companies}
						/>,
					]}
				/>
			</div>
		);
	}
}
