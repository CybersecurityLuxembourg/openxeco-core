import React from "react";
import "./PageDashboard.css";
import { NotificationManager as nm } from "react-notifications";
import { getRequest } from "../utils/request.jsx";
import DashboardAnalytics from "./pagedashboard/DashboardAnalytics.jsx";
import DashboardEcosystem from "./pagedashboard/DashboardEcosystem.jsx";
import DashboardRecentActivity from "./pagedashboard/DashboardRecentActivity.jsx";
import Tab from "./tab/Tab.jsx";

export default class PageDashboard extends React.Component {
	constructor(props) {
		super(props);

		this.getAnalytics = this.getAnalytics.bind(this);
		this.getCompanies = this.getCompanies.bind(this);

		this.state = {
			analytics: null,
			companies: null,
		};
	}

	componentDidMount() {
		this.refresh();
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

	render() {
		return (
			<div id="PageDashboard" className="page max-sized-page">
				<Tab
					menu={["Ecosystem", "Analytics", "Recent activities"]}
					content={[
						<DashboardEcosystem
							key={"ecosystem"}
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
