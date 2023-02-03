import React from "react";
import "./DialogImportContactAddresses.css";
import Popup from "reactjs-popup";
import { NotificationManager as nm } from "react-notifications";
import { getRequest } from "../../../utils/request.jsx";
import FormLine from "../../button/FormLine.jsx";
import Chip from "../../button/Chip.jsx";
import Loading from "../../box/Loading.jsx";
import Message from "../../box/Message.jsx";
import { dictToURI } from "../../../utils/url.jsx";

export default class DialogImportContactAddresses extends React.Component {
	constructor(props) {
		super(props);

		const defaultState = {
			taxonomyCategories: null,
			taxonomyValues: null,
			entities: null,
			selectedEntities: [],
			selectedTaxonomyValues: [],

			addresses: [],
		};

		this.state = {
			...defaultState,
			defaultState,
		};
	}

	componentDidUpdate(_, prevState) {
		if (prevState.selectedEntities !== this.state.selectedEntities
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

		getRequest.call(this, "entity/get_entities", (data) => {
			this.setState({
				entities: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	getAddresses() {
		this.setState({
			addresses: [],
		});

		const params = {
			include_contacts: true,
			entities: this.state.selectedEntities,
			taxonomies: this.state.selectedTaxonomyValues,
		};

		getRequest.call(this, "mail/get_mail_addresses?" + dictToURI(params), (data) => {
			this.setState({
				addresses: data.map((a) => a.email),
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	getTaxonomyValuesForEntities() {
		if (this.state.taxonomyCategories && this.state.taxonomyValues) {
			const entityTaxonomies = this.state.taxonomyCategories
				.filter((c) => c.active_on_entities)
				.map((c) => c.name);

			return this.state.taxonomyValues
				.filter((v) => entityTaxonomies.indexOf(v.category) >= 0);
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
				className="Popup-small-size"
				trigger={
					<button>
						<i className="fas fa-address-book"/> Import from contacts...
					</button>
				}
				onOpen={() => this.onOpen()}
				modal
			>
				{(close) => <div className="row">
					<div className={"col-md-9"}>
						<h2><i className="fas fa-address-book"/> Import from entity contacts</h2>
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

					<div className={"col-md-12 row-spaced"}>
						{this.state.taxonomyValues && this.state.taxonomyCategories
							? <FormLine
								label={"Filter by taxonomy value"}
								type={"multiselect"}
								value={this.state.selectedTaxonomyValues}
								options={this.getTaxonomyValuesForEntities()
									.map((v) => ({ label: v.category + " - " + v.name, value: v.id }))}
								onChange={(v) => this.changeState("selectedTaxonomyValues", v)}
							/>
							: <Loading
								height={20}
							/>
						}
						{this.state.entities !== null
							? <FormLine
								label={"Filter by entity"}
								type={"multiselect"}
								value={this.state.selectedEntities}
								options={this.state.entities
									.map((v) => ({ label: v.name, value: v.id }))}
								onChange={(v) => this.changeState("selectedEntities", v)}
							/>
							: <Loading
								height={20}
							/>
						}
					</div>

					<div className="col-md-12">
						<h3>{this.state.addresses.length} address{this.state.addresses.length > 1 && "es"} selected</h3>
					</div>

					<div className="col-md-12 row-spaced">
						{this.state.addresses && this.state.addresses.length > 0
							&& <div>
								<div>
									{this.state.addresses.map((a) => <Chip
										label={a}
										key={a}
									/>)}
								</div>
							</div>
						}

						{this.state.addresses && this.state.addresses.length === 0
							&& <Message
								text={"No address selected"}
								height={100}
							/>
						}

						{!this.state.addresses
							&& <Loading
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
