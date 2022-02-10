import React, { Component } from "react";
import "./Company.css";
import Popup from "reactjs-popup";
import { NotificationManager as nm } from "react-notifications";
import { postRequest } from "../../utils/request.jsx";
import DialogConfirmation from "../dialog/DialogConfirmation.jsx";
import Tab from "../tab/Tab.jsx";
import CompanyGlobal from "./company/CompanyGlobal.jsx";
import CompanyContact from "./company/CompanyContact.jsx";
import CompanyAddress from "./company/CompanyAddress.jsx";
import CompanyUser from "./company/CompanyUser.jsx";
import CompanyTaxonomy from "./company/CompanyTaxonomy.jsx";
import CompanyWorkforce from "./company/CompanyWorkforce.jsx";
import { getUrlParameter } from "../../utils/url.jsx";

export default class Company extends Component {
	constructor(props) {
		super(props);

		this.onClick = this.onClick.bind(this);
		this.onClose = this.onClose.bind(this);
		this.onOpen = this.onOpen.bind(this);
		this.confirmCompanyDeletion = this.confirmCompanyDeletion.bind(this);

		this.state = {
			isDetailOpened: false,
			selectedMenu: null,
			tabs: [
				"global", "contact", "address", "user", "taxonomy", "workforce",
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

	onClick() {
		if (typeof this.props.disabled !== "undefined" || !this.props.disabled) {
			this.onOpen();

			const newState = !this.props.selected;
			if (typeof this.props.onClick !== "undefined") this.props.onClick(this.props.id, newState);
		}
	}

	onClose() {
		this.setState({ isDetailOpened: false }, () => {
			if (this.props.onClose !== undefined) this.props.onClose();
		});
	}

	onOpen() {
		this.setState({ isDetailOpened: true }, () => {
			if (this.props.onOpen !== undefined) this.props.onOpen();
		});
	}

	confirmCompanyDeletion() {
		const params = {
			id: this.props.id,
		};

		postRequest.call(this, "company/delete_company", params, () => {
			document.elementFromPoint(100, 0).click();
			nm.info("The entity has been deleted");

			if (typeof this.props.afterDeletion !== "undefined") this.props.afterDeletion();
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
				closeOnDocumentClick
				onClose={this.onClose}
				onOpen={this.onOpen}
				open={this.props.open || this.state.isDetailOpened}
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
								afterConfirmation={() => this.confirmCompanyDeletion()}
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
							{this.props.name}
						</h1>

						<Tab
							labels={["Global", "Contact", "Address", "User", "Taxonomy", "Workforce"]}
							selectedMenu={this.state.selectedMenu}
							onMenuClick={this.onMenuClick}
							keys={this.state.tabs}
							content={[
								<CompanyGlobal
									key={this.props.id}
									id={this.props.id}
								/>,
								<CompanyContact
									key={this.props.id}
									id={this.props.id}
								/>,
								<CompanyAddress
									key={this.props.id}
									id={this.props.id}
									name={this.props.name}
								/>,
								<CompanyUser
									key={this.props.id}
									id={this.props.id}
								/>,
								<CompanyTaxonomy
									key={this.props.id}
									id={this.props.id}
								/>,
								<CompanyWorkforce
									key={this.props.id}
									id={this.props.id}
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
