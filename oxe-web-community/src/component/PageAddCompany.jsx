import React from "react";
import "./PageAddCompany.css";
import Tab from "./tab/Tab.jsx";
import AddCompanyClaim from "./pageaddcompany/AddCompanyClaim.jsx";
import AddCompanyRegister from "./pageaddcompany/AddCompanyRegister.jsx";
import { getUrlParameter } from "../utils/url.jsx";

export default class PageAddCompany extends React.Component {
	constructor(props) {
		super(props);

		this.onMenuClick = this.onMenuClick.bind(this);

		this.state = {
			selectedMenu: null,
			tabs: [
				"claim",
				"register",
			],
		};
	}

	componentDidMount() {
		if (getUrlParameter("tab") !== null && this.state.tabs.indexOf(getUrlParameter("tab")) >= 0) {
			this.setState({ selectedMenu: getUrlParameter("tab") });
		}
	}

	componentDidUpdate() {
		if (this.state.selectedMenu !== getUrlParameter("tab")
			&& this.state.tabs.indexOf(getUrlParameter("tab")) >= 0) {
			this.setState({ selectedMenu: getUrlParameter("tab") });
		}
	}

	onMenuClick(m) {
		this.props.history.push("?tab=" + m);
	}

	render() {
		return (
			<div id="PageAddCompany" className="page max-sized-page">
				<h1>Claim or register an entity</h1>

				<Tab
					labels={[
						"Claim an entity",
						"Register an entity",
					]}
					selectedMenu={this.state.selectedMenu}
					onMenuClick={this.onMenuClick}
					keys={this.state.tabs}
					content={[
						<AddCompanyClaim
							key={"claim"}
							getNotifications={this.props.getNotifications}
						/>,
						<AddCompanyRegister
							key={"register"}
							getNotifications={this.props.getNotifications}
						/>,
					]}
				/>
			</div>
		);
	}
}
