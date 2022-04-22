import React from "react";
import "./PageCompany.css";
import Tab from "./tab/Tab.jsx";
import CompanyGlobal from "./pagecompany/CompanyGlobal.jsx";
import CompanyLogo from "./pagecompany/CompanyLogo.jsx";
import CompanyAddress from "./pagecompany/CompanyAddress.jsx";
import CompanyCollaborator from "./pagecompany/CompanyCollaborator.jsx";
import CompanyRequest from "./pagecompany/CompanyRequest.jsx";
import CompanyTaxonomy from "./pagecompany/CompanyTaxonomy.jsx";
import Loading from "./box/Loading.jsx";
import { getUrlParameter } from "../utils/url.jsx";

export default class PageCompany extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			company: null,
			selectedMenu: null,
			tabs: [
				"global_information",
				"logo",
				"address",
				"taxonomy",
				"collaborator",
				"request",
			],
		};
	}

	componentDidMount() {
		this.selectCompany();

		if (getUrlParameter("tab") && this.state.tabs.indexOf(getUrlParameter("tab")) >= 0) {
			this.setState({ selectedMenu: getUrlParameter("tab") });
		}
	}

	componentDidUpdate(prevProps) {
		if (this.props.myCompanies !== prevProps.myCompanies) {
			this.selectCompany();
		}

		if (this.state.selectedMenu !== getUrlParameter("tab")
			&& this.state.tabs.indexOf(getUrlParameter("tab")) >= 0) {
			this.setState({ selectedMenu: getUrlParameter("tab") });
		}
	}

	selectCompany() {
		if (this.props.myCompanies === null
			|| this.props.match.params.id === null) {
			this.setState({ company: null, selectedMenu: null });
		} else {
			const c = this.props.myCompanies
				.filter((m) => m.id === parseInt(this.props.match.params.id, 10));

			if (c.length > 0) {
				this.setState({
					company: c[0],
					selectedMenu: c[0].id,
				});
			}
		}
	}

	onMenuClick(m) {
		this.props.history.push("?tab=" + m);
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	render() {
		return (
			<div id="PageCompany" className="page max-sized-page">
				<div className={"row row-spaced"}>
					<div className="col-md-12">
						<h1>{this.state.company !== null
							? "Entity: " + this.state.company.name
							: "Unfound entity"}</h1>

						<div className="top-right-buttons">
							<button
								onClick={this.refresh}>
								<i className="fas fa-redo-alt"/>
							</button>
						</div>
					</div>
					<div className="col-md-12">
						{this.state.company !== null
							? <Tab
								selectedMenu={this.state.selectedMenu}
								onMenuClick={(m) => this.onMenuClick(m)}
								keys={this.state.tabs}
								labels={[
									"Global information",
									"Logo",
									"Address",
									"Taxonomy",
									"Collaborator",
									"Request",
								]}
								notifications={[
									0,
									0,
									0,
									0,
									0,
									this.props.notifications !== undefined
									&& this.props.notifications !== null
									&& this.props.notifications.entity_requests !== undefined
									&& this.props.notifications.entity_requests[this.state.company.id]
										!== undefined
										? this.props.notifications.entity_requests[this.state.company.id]
										: 0,
								]}
								content={[
									<CompanyGlobal
										getNotifications={this.props.getNotifications}
										company={this.state.company}
										key={"CompanyGlobal"}
									/>,
									<CompanyLogo
										getNotifications={this.props.getNotifications}
										company={this.state.company}
										key={"CompanyLogo"}
									/>,
									<CompanyAddress
										getNotifications={this.props.getNotifications}
										companyId={this.state.company.id}
										key={"CompanyAddress"}
									/>,
									<CompanyTaxonomy
										getNotifications={this.props.getNotifications}
										companyId={this.state.company.id}
										key={"CompanyTaxonomy"}
									/>,
									<CompanyCollaborator
										companyId={this.state.company.id}
										key={"CompanyCollaborator"}
										changeMenu={this.props.changeMenu}
									/>,
									<CompanyRequest
										getNotifications={this.props.getNotifications}
										companyId={this.state.company.id}
										companyName={this.state.company.name}
										key={"CompanyRequest"}
									/>,
								]}
							/>
							: <Loading
								height={300}
							/>
						}
					</div>
				</div>
			</div>
		);
	}
}
