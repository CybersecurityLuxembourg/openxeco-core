import React from "react";
import "./PageCompany.css";
import { NotificationManager as nm } from "react-notifications";
import CompanyCompanies from "./pagecompany/CompanyCompanies.jsx";
import CompanyMap from "./pagecompany/CompanyMap.jsx";
import CompanyExport from "./pagecompany/CompanyExport.jsx";
import Tab from "./tab/Tab.jsx";
import { getUrlParameter, dictToURI } from "../utils/url.jsx";
import { getRequest } from "../utils/request.jsx";

export default class PageCompany extends React.Component {
	constructor(props) {
		super(props);

		this.onMenuClick = this.onMenuClick.bind(this);

		this.state = {
			notifications: null,
			selectedMenu: null,
			filters: null,
			companies: null,
			tabs: [
				"companies",
				"map",
				"export",
			],
		};
	}

	componentDidMount() {
		this.refreshCompanies();

		if (getUrlParameter("tab") !== null && this.state.tabs.indexOf(getUrlParameter("tab")) >= 0) {
			this.setState({ selectedMenu: getUrlParameter("tab") });
		}
	}

	componentDidUpdate(_, prevState) {
		if (prevState.filters !== this.state.filters) this.refreshCompanies();

		if (this.state.selectedMenu !== getUrlParameter("tab")
			&& this.state.tabs.indexOf(getUrlParameter("tab")) >= 0) {
			this.setState({ selectedMenu: getUrlParameter("tab") });
		}
	}

	refreshCompanies() {
		this.setState({
			companies: null,
			loading: true,
		});

		const params = dictToURI(this.state.filters);

		getRequest.call(this, "company/get_companies?" + params, (data) => {
			this.setState({
				companies: data.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1)),
				loading: false,
			});
		}, (response) => {
			this.setState({ loading: false });
			nm.warning(response.statusText);
		}, (error) => {
			this.setState({ loading: false });
			nm.error(error.message);
		});
	}

	applyFilter(filters) {
		this.setState({ filters });
	}

	onMenuClick(m) {
		this.props.history.push("?tab=" + m);
	}

	render() {
		return (
			<div id="PageCompany" className="page max-sized-page">
				<Tab
					labels={["Entities", "Map", "Export"]}
					selectedMenu={this.state.selectedMenu}
					onMenuClick={this.onMenuClick}
					keys={this.state.tabs}
					content={[
						<CompanyCompanies
							key={"companies"}
							companies={this.state.companies}
							refreshCompanies={() => this.refreshCompanies()}
							filters={this.state.filters}
							applyFilter={(f) => this.applyFilter(f)}
							{...this.props}
						/>,
						<CompanyMap
							key={"map"}
							companies={this.state.companies}
							refreshCompanies={() => this.refreshCompanies()}
							filters={this.state.filters}
							applyFilter={(f) => this.applyFilter(f)}
							{...this.props}
						/>,
						<CompanyExport
							key={"export"}
							companies={this.state.companies}
							refreshCompanies={() => this.refreshCompanies()}
							filters={this.state.filters}
							applyFilter={(f) => this.applyFilter(f)}
							{...this.props}
						/>,
					]}
				/>
			</div>
		);
	}
}
