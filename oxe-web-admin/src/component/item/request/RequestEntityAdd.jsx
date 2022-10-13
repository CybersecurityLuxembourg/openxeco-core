import React, { Component } from "react";
import "./RequestEntityAdd.css";
import Popup from "reactjs-popup";
import { NotificationManager as nm } from "react-notifications";
import { postRequest } from "../../../utils/request.jsx";
import FormLine from "../../button/FormLine.jsx";

export default class RequestEntityAdd extends Component {
	constructor(props) {
		super(props);

		this.insertEntity = this.insertEntity.bind(this);

		this.state = {
		};
	}

	insertEntity(close) {
		if (this.props.data === undefined || this.props.data === null) {
			nm.warning("Data to be inserted not found");
			return;
		}

		if (this.props.data.id !== undefined) {
			nm.warning("Cannot add an entity with an ID");
			return;
		}

		const params = {
			name: this.props.data.name,
		};

		postRequest.call(this, "entity/add_entity", params, (addedEntity) => {
			nm.info("The entity has been created");
			this.updateEntity(addedEntity.id);
			this.addEntityAddress(addedEntity.id);
			this.addEntityContact(addedEntity.id);
			this.linkUserEntity(addedEntity.id);
			close();
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	updateEntity(newId) {
		const entityParams = {
			name: this.props.data.name,
			description: this.props.data.description,
			trade_register_number: this.props.data.trade_register_number,
			creation_date: this.props.data.creation_date,
			is_startup: this.props.data.is_startup,
			entity_type: this.props.data.entity_type,
			vat_number: this.props.data.vat_number,
			website: this.props.data.website,
			size: this.props.data.size,
			sector: this.props.data.sector,
			industry: this.props.data.industry,
			involvement: this.props.data.involvement,
			id: newId,
		};

		postRequest.call(this, "entity/update_entity", entityParams, () => {
			nm.info("The information of the entity has been updated");
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	addEntityAddress(newId) {
		const entityParams = {
			address_1: this.props.data.address_1,
			address_2: this.props.data.address_2,
			city: this.props.data.city,
			country: this.props.data.country,
			postal_code: this.props.data.postal_code,
			entity_id: newId,
		};

		postRequest.call(this, "address/add_address", entityParams, () => {
			nm.info("The address for this entity has been saved");
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	addEntityContact(newId) {
		const contactParams = {
			work_email: this.props.data.company_email,
			name: this.props.data.primary_contact_name,
			work_telephone: this.props.data.work_telephone,
			seniority_level: this.props.data.seniority_level,
			department: this.props.data.department,
			entity_id: newId,
			representative: "PHYSICAL PERSON",
			type: "EMAIL ADDRESS",
			value: this.props.data.company_email,
		};

		postRequest.call(this, "contact/add_contact", contactParams, () => {
			nm.info("The user has been added as the primary contact");
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	linkUserEntity(newId) {
		const userEntityParams = {
			user_id: this.props.userId,
			entity_id: newId,
			department: this.props.data.department,
		};

		postRequest.call(this, "user/add_user_entity", userEntityParams, () => {
			nm.info("The user has been assigned to the entity");
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	render() {
		return (
			<Popup
				className="Popup-small-size"
				trigger={
					<button
						className={"blue-background"}
					>
						<i className="fas fa-tasks"/> Review entity add
					</button>
				}
				modal
				closeOnDocumentClick
			>
				{(close) => (
					<div className="row row-spaced">
						<div className="col-md-12">
							<h2>Review entity add</h2>

							<div className={"top-right-buttons"}>
								<button
									className={"grey-background"}
									onClick={close}>
									<i className="far fa-times-circle"/>
								</button>
							</div>
						</div>

						<div className="col-md-12">
							<FormLine
								label={"Name"}
								value={this.props.data.name}
								disabled={true}
							/>
							<FormLine
								label={"Description"}
								type={"textarea"}
								value={this.props.data.description}
								disabled={true}
							/>
							<FormLine
								label={"Trade register number"}
								value={this.props.data.trade_register_number}
								disabled={true}
							/>
							<FormLine
								label={"Creation Date"}
								type={"date"}
								value={this.props.data.creation_date}
								disabled={true}
							/>
							<FormLine
								label={"Address Line 1"}
								value={this.props.data.address_1}
								disabled={true}
							/>
							<FormLine
								label={"Address Line 2"}
								value={this.props.data.address_2}
								disabled={true}
							/>
							<FormLine
								label={"Postal Code"}
								value={this.props.data.postal_code}
								disabled={true}
							/>
							<FormLine
								label={"City"}
								value={this.props.data.city}
								disabled={true}
							/>
							<FormLine
								label={"Country"}
								value={this.props.data.country}
								disabled={true}
							/>
							<FormLine
								label={"Entity Type"}
								value={this.props.data.entity_type}
								disabled={true}
							/>
							<FormLine
								label={"VAT Number"}
								value={this.props.data.vat_number}
								disabled={true}
							/>
							<FormLine
								label={"Website"}
								value={this.props.data.website}
								disabled={true}
							/>
							<FormLine
								label={"Company Email"}
								value={this.props.data.company_email}
								disabled={true}
							/>
							<FormLine
								label={"Size"}
								value={this.props.data.size}
								disabled={true}
							/>
							<FormLine
								label={"Sector"}
								value={this.props.data.sector}
								disabled={true}
							/>
							<FormLine
								label={"Industry"}
								value={this.props.data.industry}
								disabled={true}
							/>
							<FormLine
								label={"Primary involvement"}
								value={this.props.data.involvement}
								disabled={true}
							/>
							<FormLine
								label={"Primary Contact Name"}
								value={this.props.data.primary_contact_name}
								disabled={true}
							/>
							<FormLine
								label={"Work Telephone"}
								value={this.props.data.work_telephone}
								disabled={true}
							/>
							<FormLine
								label={"Seniority Level"}
								value={this.props.data.seniority_level}
								disabled={true}
							/>
							<FormLine
								label={"Department"}
								value={this.props.data.department}
								disabled={true}
							/>
							<FormLine
								label={"Accepted Acknowledgements"}
								type={"checkbox"}
								value={this.props.data.acknowledge}
								disabled={true}
							/>
						</div>

						<div className="col-md-12 right-buttons">
							{this.props.status !== "REJECTED"
								&& <button
									className={"blue-background"}
									onClick={() => this.insertEntity(close)}
								>
									<i className="fas fa-plus" /> Add entity
								</button>
							}
						</div>
					</div>
				)}
			</Popup>
		);
	}
}
