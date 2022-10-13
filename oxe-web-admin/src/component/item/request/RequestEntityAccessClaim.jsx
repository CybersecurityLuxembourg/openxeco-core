import React, { Component } from "react";
import "./RequestEntityAccessClaim.css";
import Popup from "reactjs-popup";
import { NotificationManager as nm } from "react-notifications";
import { getRequest, postRequest } from "../../../utils/request.jsx";
import Entity from "../Entity.jsx";
import User from "../User.jsx";
import FormLine from "../../button/FormLine.jsx";

export default class RequestEntityAccessClaim extends Component {
	constructor(props) {
		super(props);

		this.state = {
			userEntitiesEnums: null,
			department: props.data && props.data.department ? props.data.department : null,
			departments: [],
		};
	}

	onOpen() {
		getRequest.call(this, "public/get_public_departments", (data) => {
			this.setState({
				departments: data,
			});
		}, (error) => {
			nm.warning(error.message);
		}, (error) => {
			nm.error(error.message);
		});

		if (this.props.department && this.props.data.department) {
			this.setState({ department: this.props.data.department });
		}
	}

	addUserEntity(close) {
		const params = {
			user_id: this.props.user.id,
			entity_id: this.props.entity.id,
			department: this.state.department,
		};

		postRequest.call(this, "user/add_user_entity", params, () => {
			nm.info("The entity has been added to the user");
			this.addEntityContact();
			close();
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	addEntityContact() {
		const contactParams = {
			work_email: this.props.data.email,
			name: this.props.user.first_name + " " + this.props.user.last_name,
			work_telephone: this.props.data.telephone,
			seniority_level: this.props.data.level,
			department: this.props.data.department,
			entity_id: this.props.entity.id,
			representative: "PHYSICAL PERSON",
			type: "EMAIL ADDRESS",
			value: this.props.data.email,
		};

		postRequest.call(this, "contact/add_contact", contactParams, () => {
			nm.info("The user has been added as the primary contact");
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
						<i className="fas fa-tasks"/> Review entity access claim
					</button>
				}
				onOpen={() => this.onOpen()}
				modal
				closeOnDocumentClick
			>
				{(close) => (
					<div className="row row-spaced">
						<div className="col-md-9">
							<h2>Review entity access claim</h2>
						</div>

						<div className={"col-md-3"}>
							<div className="top-right-buttons">
								<button
									className={"grey-background"}
									data-hover="Close"
									data-active=""
									onClick={close}>
									<span><i className="far fa-times-circle"/></span>
								</button>
							</div>
						</div>

						<div className="col-md-6">
							<h3>User</h3>

							<User
								id={this.props.user.id}
								email={this.props.user.email}
							/>
						</div>

						<div className="col-md-6 row-spaced">
							<h3>Entity</h3>

							<Entity
								id={this.props.entity.id}
								name={this.props.entity.name}
								legalStatus={this.props.entity.legal_status}
							/>
						</div>

						<div className="col-md-12">
							<h3>Details</h3>
							<FormLine
								label={"Company Email"}
								value={this.props.data.email}
								disabled={true}
							/>
							<FormLine
								label={"Work Telephone"}
								value={this.props.data.telephone}
								disabled={true}
							/>
							<FormLine
								label={"Seniority Level"}
								value={this.props.data.level}
								disabled={true}
							/>
							<FormLine
								label={"Department"}
								value={this.props.data.department}
								disabled={true}
							/>
						</div>

						<div className="col-md-12">
							<div className="right-buttons">
								<button
									onClick={() => this.addUserEntity(close)}>
									<i className="fas fa-plus"/> Create the link
								</button>
							</div>
						</div>
					</div>
				)}
			</Popup>
		);
	}
}
