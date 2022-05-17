import React, { Component } from "react";
import "./Company.css";
import Popup from "reactjs-popup";
import { NotificationManager as nm } from "react-notifications";
import { getRequest, getForeignRequest, postRequest } from "../../utils/request.jsx";
import DialogConfirmation from "../dialog/DialogConfirmation.jsx";
import Tab from "../tab/Tab.jsx";
import CompanyGlobal from "./company/CompanyGlobal.jsx";
import CompanyContact from "./company/CompanyContact.jsx";
import CompanyAddress from "./company/CompanyAddress.jsx";
import CompanyUser from "./company/CompanyUser.jsx";
import CompanyTaxonomy from "./company/CompanyTaxonomy.jsx";
import CompanyWorkforce from "./company/CompanyWorkforce.jsx";
import CompanySync from "./company/CompanySync.jsx";
import { getUrlParameter } from "../../utils/url.jsx";
import Chip from "../button/Chip.jsx";

export default class Company extends Component {
	constructor(props) {
		super(props);

		this.state = {
			isDetailOpened: false,
			selectedMenu: null,
			tabs: [
				"global", "contact", "address", "user", "taxonomy", "workforce", "synchronization",
			],
		};
	}

	componentDidMount() {
		if (getUrlParameter("item_tab") !== null && this.state.tabs.indexOf(getUrlParameter("item_tab")) >= 0) {
			this.setState({ selectedMenu: getUrlParameter("item_tab") });
		}
	}

	componentDidUpdate() {
		if (this.state.selectedMenu !== getUrlParameter("item_tab")
			&& this.state.tabs.indexOf(getUrlParameter("item_tab")) >= 0) {
			this.setState({ selectedMenu: getUrlParameter("item_tab") });
		}
	}

	confirmDeletion(close) {
		const params = {
			id: this.props.id,
		};

		postRequest.call(this, "company/delete_company", params, () => {
			nm.info("The entity has been deleted");
			if (close) {
				close();
			}

			if (typeof this.props.afterDeletion !== "undefined") this.props.afterDeletion();
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	fetchCompany() {
		if (this.props.node && this.props.node.api_endpoint) {
			const url = this.props.node.api_endpoint + "/public/get_public_company/" + this.props.id;

			getForeignRequest.call(this, url, (data) => {
				this.setState({
					company: data,
				});
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		} else {
			getRequest.call(this, "company/get_company/" + this.props.id, (data) => {
				this.setState({
					company: data,
				});
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		}
	}

	importCompany(close) {
		const params = {
			network_node_id: this.props.node.id,
			company_id: this.state.company.id,
			sync_address: this.state.sync_address,
		};

		postRequest.call(this, "network/import_company", params, () => {
			nm.info("The entity has been imported");
			if (close) {
				close();
			}
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	render() {
		return (
			<Popup
				className="Popup-full-size"
				trigger={
					<div className={"Company"}>
						<i className="fas fa-building"/>
						<div className={"Company-name"}>
							{this.props.name}
						</div>
					</div>
				}
				modal
				closeOnDocumentClick={false}
				onOpen={() => this.fetchCompany()}
			>
				{(close) => <div className="row row-spaced">
					<div className="col-md-12">
						<div className={"top-right-buttons"}>
							<button
								className={"blue-background"}
								onClick={() => window.open("http://google.com/search?q=" + this.props.name)}>
								<i className="fab fa-google"></i>
							</button>
							<DialogConfirmation
								text={"This will permanently remove the data. Are you sure you want to delete this entity?"
									+ "<br/><br/>"
									+ "Please consider using the 'DELETED' or the 'INACTIVE' status before proceeding."}
								trigger={
									<button
										className={"red-background"}>
										<i className="fas fa-trash-alt"/>
									</button>
								}
								afterConfirmation={() => this.confirmDeletion(close)}
							/>
							<button
								className={"grey-background"}
								data-hover="Close"
								data-active=""
								onClick={close}>
								<span><i className="far fa-times-circle"/></span>
							</button>
						</div>
						<h1 className="Company-title">
							<i className="fas fa-building"/> {this.props.name}

							{this.props.node
								? <Chip
									label={"Remote"}
								/>
								: <Chip
									label={"Local"}
								/>
							}

							{this.state.company
								&& this.state.company.sync_node
								&& <Chip
									label={"Synchronized"}
								/>
							}

							{this.state.company
								&& this.state.company.sync_node
								&& this.state.company.sync_status
								&& <Chip
									label={"SYNC STATUS: " + this.state.company.sync_status}
								/>
							}
						</h1>

						<Tab
							labels={["Global", "Contact", "Address", "User", "Taxonomy", "Workforce", "Synchronization"]}
							selectedMenu={this.state.selectedMenu}
							onMenuClick={this.onMenuClick}
							keys={this.state.tabs}
							content={[
								<CompanyGlobal
									key={this.props.id}
									id={this.props.id}
									company={this.state.company}
									node={this.props.node}
									editable={!this.props.node}
									refresh={() => this.fetchCompany()}
								/>,
								<CompanyContact
									key={this.props.id}
									id={this.props.id}
									company={this.state.company}
									node={this.props.node}
									editable={!this.props.node}
									refresh={() => this.fetchCompany()}
								/>,
								<CompanyAddress
									key={this.props.id}
									id={this.props.id}
									name={this.props.name}
									company={this.state.company}
									node={this.props.node}
									editable={!this.props.node}
									refresh={() => this.fetchCompany()}
								/>,
								<CompanyUser
									key={this.props.id}
									id={this.props.id}
									company={this.state.company}
									node={this.props.node}
									editable={!this.props.node}
									refresh={() => this.fetchCompany()}
								/>,
								<CompanyTaxonomy
									key={this.props.id}
									id={this.props.id}
									company={this.state.company}
									node={this.props.node}
									editable={!this.props.node}
									refresh={() => this.fetchCompany()}
								/>,
								<CompanyWorkforce
									key={this.props.id}
									id={this.props.id}
									company={this.state.company}
									node={this.props.node}
									editable={!this.props.node}
									refresh={() => this.fetchCompany()}
								/>,
								<CompanySync
									key={this.props.id}
									id={this.props.id}
									company={this.state.company}
									node={this.props.node}
									editable={!this.props.node}
									refresh={() => this.fetchCompany()}
								/>,
							]}
						/>
					</div>
				</div>
				}
			</Popup>
		);
	}
}
