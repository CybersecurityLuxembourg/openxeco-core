import React from "react";
import "./DialogImportDatabaseAddresses.css";
import Popup from "reactjs-popup";
import { NotificationManager as nm } from "react-notifications";
import { getRequest } from "../../utils/request.jsx";
import FormLine from "../button/FormLine.jsx";
import Chip from "../button/Chip.jsx";
import Loading from "../box/Loading.jsx";
import { dictToURI } from "../../utils/url.jsx";

export default class DialogImportDatabaseAddresses extends React.Component {
	constructor(props) {
		super(props);

		this.refresh = this.refresh.bind(this);
		this.onOpen = this.onOpen.bind(this);

		const defaultState = {
			includeContacts: false,
			includeUsers: false,

			taxonomyCategories: null,
			taxonomyValues: null,
			companies: null,
			selectedCompanies: [],
			selectedTaxonomyValues: [],

			addresses: null,
		};

		this.state = {
			...defaultState,
			defaultState,
		};
	}

	componentDidUpdate(_, prevState) {
		if (prevState.includeContacts !== this.state.includeContacts
			|| prevState.includeUsers !== this.state.includeUsers
			|| prevState.selectedCompanies !== this.state.selectedCompanies
			|| prevState.selectedTaxonomyValues !== this.state.selectedTaxonomyValues) {
			this.getAddresses();
		}
	}

	onOpen() {
		this.refresh();
		this.getAddresses();
	}

	refresh() {
		this.setState({
			defaultState: this.state.defaultState,
		});

		getRequest.call(this, "taxonomy/get_taxonomy_values", (data) => {
			this.setState({
				taxonomyValues: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});

		getRequest.call(this, "taxonomy/get_taxonomy_categories", (data) => {
			this.setState({
				taxonomyCategories: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});

		getRequest.call(this, "company/get_companies", (data) => {
			this.setState({
				companies: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	getAddresses() {
		this.setState({
			addresses: null,
		});

		const params = {
			include_users: this.state.includeUsers,
			include_contacts: this.state.includeContacts,
			companies: this.state.selectedCompanies,
			taxonomies: this.state.selectedTaxonomyValues,
		};

		getRequest.call(this, "mail/get_mail_addresses?" + dictToURI(params), (data) => {
			this.setState({
				addresses: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	getTaxonomyValuesForCompanies() {
		if (this.state.taxonomyCategories && this.state.taxonomyValues) {
			const companyTaxonomies = this.state.taxonomyCategories
				.filter((c) => c.active_on_companies)
				.map((c) => c.name);

			return this.state.taxonomyValues
				.filter((v) => companyTaxonomies.indexOf(v.category) >= 0);
		}

		return [];
	}

	onConfirmation(close) {
		if (typeof this.props.onConfirmation === "function") {
			this.props.onConfirmation(this.state.addresses);
		}

		close();
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	render() {
		return (
			<Popup
				className="Popup-full-size"
				trigger={
					<button>
						<i className="fas fa-upload"/> Import from database...
					</button>
				}
				onOpen={this.onOpen}
				modal
			>
				{(close) => <div className="row">
					<div className={"col-md-9 row-spaced"}>
						<h3>Import from database...</h3>
					</div>
					<div className={"col-md-3"}>
						<div className="right-buttons">
							<button
								className={"grey-background"}
								data-hover="Close"
								data-active=""
								onClick={close}>
								<span><i className="far fa-times-circle"/></span>
							</button>
						</div>
					</div>

					<div className={"col-md-12"}>
						<FormLine
							label={"Include contacts from companies"}
							type={"checkbox"}
							value={this.state.includeContacts}
							onChange={(v) => this.changeState("includeContacts", v)}
						/>
						<FormLine
							label={"Include active users"}
							type={"checkbox"}
							value={this.state.includeUsers}
							onChange={(v) => this.changeState("includeUsers", v)}
						/>
					</div>

					<div className="col-md-12">
						<div className={"row row-spaced"}>
							<div className="col-md-6">
								{this.state.taxonomyValues && this.state.taxonomyCategories
									? <FormLine
										label={"Filter by taxonomy value"}
										type={"multiselect"}
										fullWidth={true}
										value={this.state.selectedTaxonomyValues}
										options={this.getTaxonomyValuesForCompanies()
											.map((v) => ({ label: v.category + " - " + v.name, value: v.id }))}
										onChange={(v) => this.changeState("selectedTaxonomyValues", v)}
									/>
									: <Loading
										height={150}
									/>
								}
							</div>

							<div className="col-md-6">
								{this.state.companies !== null
									? <FormLine
										label={"Filter by entity"}
										type={"multiselect"}
										fullWidth={true}
										value={this.state.selectedCompanies}
										options={this.state.companies
											.map((v) => ({ label: v.name, value: v.id }))}
										onChange={(v) => this.changeState("selectedCompanies", v)}
									/>
									: <Loading
										height={150}
									/>
								}
							</div>
						</div>
					</div>

					<div className="col-md-12 row-spaced">
						{this.state.addresses
							? <div>
								<h3>{this.state.addresses.length} addresse{this.state.addresses.length > 1 && "s"} selected</h3>

								<div>
									{this.state.addresses.map((a) => <Chip
										label={a.email}
										key={a.email}
									/>)}
								</div>
							</div>
							: <Loading
								height={150}
							/>
						}
					</div>

					<div className="col-md-12 row-spaced">
						<div className="right-buttons">
							<button
								onClick={() => this.onConfirmation(close)}
								disabled={!this.state.addresses || this.state.addresses.length === 0}>
								<i className="fas fa-upload"/> Import addresses
							</button>
						</div>
					</div>
				</div>}
			</Popup>
		);
	}
}
