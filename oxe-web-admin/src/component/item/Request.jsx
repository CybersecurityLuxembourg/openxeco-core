import React, { Component } from "react";
import "./Request.css";
import Popup from "reactjs-popup";
import { NotificationManager as nm } from "react-notifications";
import { getRequest, postRequest } from "../../utils/request.jsx";
import RequestViewUser from "./request/RequestViewUser.jsx";
import Entity from "./Entity.jsx";
import FormLine from "../button/FormLine.jsx";
import Loading from "../box/Loading.jsx";
import Message from "../box/Message.jsx";
import DialogSendMail from "../dialog/DialogSendMail.jsx";
import RequestEntityChange from "./request/RequestEntityChange.jsx";
import RequestEntityAdd from "./request/RequestEntityAdd.jsx";
import RequestLogoChange from "./request/RequestLogoChange.jsx";
import RequestEntityAddressAdd from "./request/RequestEntityAddressAdd.jsx";
import RequestEntityAddressChange from "./request/RequestEntityAddressChange.jsx";
import RequestEntityAddressDelete from "./request/RequestEntityAddressDelete.jsx";
import RequestEntityTaxonomyChange from "./request/RequestEntityTaxonomyChange.jsx";
import RequestEntityAccessClaim from "./request/RequestEntityAccessClaim.jsx";
import RequestIndividualAccountAdd from "./request/RequestIndividualAccountAdd.jsx";
import { getApiURL } from "../../utils/env.jsx";

export default class Request extends Component {
	constructor(props) {
		super(props);

		this.onClick = this.onClick.bind(this);
		this.onClose = this.onClose.bind(this);
		this.onOpen = this.onOpen.bind(this);
		this.getMailBody = this.getMailBody.bind(this);
		this.getSettingValue = this.getSettingValue.bind(this);

		this.state = {
			user: null,
			user_profile: null,
			entity: null,
			requestStatus: null,
			settings: null,
			currentStatus: this.props.info.status,
		};
	}

	onClick() {
		if (typeof this.props.disabled !== "undefined" || !this.props.disabled) {
			this.onOpen();

			const newState = !this.props.selected;
			if (typeof this.props.onClick !== "undefined") this.props.onClick(this.props.id, newState);
		}
	}

	onClose() {
		if (this.props.onClose) {
			this.props.onClose();
		}
	}

	onOpen() {
		this.setState({
			user: null,
			settings: null,
		});

		getRequest.call(this, "user/get_user/" + this.props.info.user_id, (data) => {
			this.setState({
				user: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});

		getRequest.call(this, "user/get_user_profile/" + this.props.info.user_id, (data) => {
			this.setState({
				user_profile: data,
			});
		}, (response) => {
			console.log(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});

		getRequest.call(this, "request/get_request_enums", (data) => {
			this.setState({
				requestStatus: data.status,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});

		if (this.props.info && (this.props.info.entity_id
			|| (this.props.info.data && JSON.parse(this.props.info.data).entity_id))) {
			const entityId = this.props.info.entity_id
				? this.props.info.entity_id
				: JSON.parse(this.props.info.data).entity_id;

			getRequest.call(this, "entity/get_entity/" + entityId, (data) => {
				this.setState({
					entity: data,
				});
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		}

		getRequest.call(this, "public/get_public_settings", (data) => {
			this.setState({
				settings: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	updateRequest(prop, value) {
		if (this.props.info[prop] !== value) {
			const params = {
				id: this.props.info.id,
				[prop]: value,
			};

			postRequest.call(this, "request/update_request", params, () => {
				const request = { ...this.props.info };
				request[prop] = value;

				this.setState({ request }, () => {
					if (prop === "status") {
						if ((value === "ACCEPTED" || value === "REJECTED")
							&& this.state.user !== null) {
							const element = document.getElementById("Request-send-mail-button");
							element.click();
						}
					}

					nm.info("The property has been updated");
				});
				if (prop === "status") {
					this.setState({ currentStatus: value });
				}
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		}
	}

	getMailBody() {
		if (this.props.info !== undefined && this.props.info !== null) {
			switch (this.props.info.type) {
			case "ENTITY ASSOCIATION CLAIM":
				return "Your request to access the claimed entity has been treated. Please log in to review the data of your entity.";
			case "ENTITY CHANGE":
				return "Your request to modify the entity information has been treated.";
			case "ENTITY ADD":
				return "Your request to add the entity in our database has been treated.";
			case "ENTITY ADDRESS CHANGE":
				return "Your request to modify the address of your entity has been treated.";
			case "ENTITY ADDRESS ADD":
				return "Your request to add an address to your entity has been treated.";
			case "ENTITY ADDRESS DELETION":
				return "Your request to remove an address from your entity has been treated.";
			case "ENTITY TAXONOMY CHANGE":
				return "Your request to modify the taxonomy of your entity has been treated.";
			case "ENTITY LOGO CHANGE":
				return "Your request to modify the logo of your entity has been treated.";
			case "NEW INDIVIDUAL ACCOUNT":
				return "Your request to create your profile has been treated.";
			default:
				return "Your request has been treated.";
			}
		} else {
			return "Your request has been treated.";
		}
	}

	getSettingValue(property) {
		if (this.state.settings !== null) {
			const concernedSettings = this.state.settings.filter((s) => s.property === property);

			if (concernedSettings.length > 0) {
				return concernedSettings[0].value;
			}

			return null;
		}

		return null;
	}

	static dateStringToLocal(dateString) {
		const date = new Date(dateString + "Z");
		return Request.formatTime(date);
	}

	static formatTime(date) {
		const yyyy = date.getFullYear();
		let mm = date.getMonth() + 1; // Months start at 0!
		let dd = date.getDate();
		let hh = date.getHours();
		let ll = date.getMinutes();
		let ss = date.getSeconds();
		if (dd < 10) dd = "0" + dd;
		if (mm < 10) mm = "0" + mm;
		if (hh < 10) hh = "0" + hh;
		if (ll < 10) ll = "0" + ll;
		if (ss < 10) ss = "0" + ss;
		return yyyy + "-" + mm + "-" + dd + "T" + hh + ":" + ll + ":" + ss;
	}

	render() {
		if (this.props.info === undefined || this.props.info === null) {
			return <Loading
				height={300}
			/>;
		}

		return (
			<Popup
				className="Popup-small-size"
				trigger={
					<div className={"Request"}>
						<i className="fas fa-thumbtack"/>
						<div className={"Request-name"}>
							{this.props.info !== undefined && this.props.info !== null
								&& this.props.info.type !== undefined && this.props.info.type !== null
								? this.props.info.type + " - "
								: ""
							}
							{this.props.info !== undefined && this.props.info !== null
								? this.props.info.request
								: "Unfound request"
							}
						</div>

						{this.props.info !== undefined && this.props.info !== null
							? <div className={"Request-status"}>{this.props.info.status}</div>
							: ""
						}

						<div className={"Request-time"}>
							{this.props.info !== undefined && this.props.info !== null
								? Request.dateStringToLocal(this.props.info.submission_date)
								: "Unfound request"
							}
						</div>
					</div>
				}
				modal
				closeOnDocumentClick
				onClose={this.onClose}
				onOpen={this.onOpen}
			>
				{(close) => <div className="row row-spaced">
					<div className="col-md-12">
						<h2>
							{this.props.info !== undefined && this.props.info !== null
								? "Request " + this.props.info.submission_date
								: "Unfound request"
							}
						</h2>
						<div className={"top-right-buttons"}>
							<button
								className={"grey-background"}
								data-hover="Close"
								data-active=""
								onClick={close}>
								<span><i className="far fa-times-circle"/></span>
							</button>
						</div>
					</div>

					<div className="col-md-12 row-spaced">
						{this.state.info !== null
							? <FormLine
								label={"Status"}
								type={"select"}
								value={this.props.info.status}
								options={this.state.requestStatus !== null
									? this.state.requestStatus.map((v) => ({ label: v, value: v }))
									: []}
								onChange={(v) => this.updateRequest("status", v)}
							/>
							: <Loading
								height={50}
							/>
						}
						{this.state.info !== null
							? <FormLine
								label={"Type"}
								value={this.props.info.type}
								disabled={true}
							/>
							: <Loading
								height={50}
							/>
						}
					</div>

					<div className="col-md-12 row-spaced">
						<h3>Action</h3>

						{this.props.info.type === "ENTITY ASSOCIATION CLAIM"
							&& this.state.user
							&& this.state.entity
							&& <RequestEntityAccessClaim
								data={this.props.info.data ? JSON.parse(this.props.info.data) : null}
								user={this.state.user}
								entity={this.state.entity}
							/>
						}
						{this.props.info.type === "ENTITY CHANGE"
							&& this.state.user
							&& this.state.entity
							&& <RequestEntityChange
								data={this.props.info.data ? JSON.parse(this.props.info.data) : null}
							/>
						}
						{this.props.info.type === "ENTITY ADD"
							&& this.state.user
							&& <RequestEntityAdd
								data={this.props.info.data ? JSON.parse(this.props.info.data) : null}
								userId={this.state.user.id}
								entity={this.state.entity}
								status={this.state.currentStatus}
							/>
						}
						{this.props.info.type === "ENTITY ADDRESS CHANGE"
							&& this.state.user
							&& <RequestEntityAddressChange
								data={this.props.info.data ? JSON.parse(this.props.info.data) : null}
							/>
						}
						{this.props.info.type === "ENTITY ADDRESS ADD"
							&& this.state.user
							&& <RequestEntityAddressAdd
								data={this.props.info.data ? JSON.parse(this.props.info.data) : null}
								entityId={this.props.info.entity_id}
							/>
						}
						{this.props.info.type === "ENTITY ADDRESS DELETION"
							&& this.state.user
							&& <RequestEntityAddressDelete
								data={this.props.info.data ? JSON.parse(this.props.info.data) : null}
							/>
						}
						{this.props.info.type === "ENTITY TAXONOMY CHANGE"
							&& this.state.user
							&& <RequestEntityTaxonomyChange
								data={this.props.info.data ? JSON.parse(this.props.info.data) : null}
								entityId={this.props.info.entity_id}
							/>
						}
						{this.props.info.type === "ENTITY LOGO CHANGE"
							&& this.state.user
							&& <RequestLogoChange
								requestId={this.props.info.id}
								requestStatus={this.props.info.status}
								image={this.props.info.image}
								entityId={this.props.info.entity_id}
							/>
						}
						{this.props.info.type === "NEW INDIVIDUAL ACCOUNT"
							&& this.state.user
							&& <RequestIndividualAccountAdd
								data={this.props.info.data ? JSON.parse(this.props.info.data) : null}
								requestId={this.props.info.id}
								userId={this.state.user.id}
								requestStatus={this.props.info.status}
							/>
						}
						{this.state.user && this.state.settings
							? <DialogSendMail
								trigger={
									<button
										className={"blue-background"}
										id="Request-send-mail-button">
										<i className="fas fa-envelope-open-text"/> Prepare email...
									</button>
								}
								email={this.state.user.email}
								subject={(this.getSettingValue("PROJECT_NAME") !== null
									? "[" + this.getSettingValue("PROJECT_NAME") + "] " : "") + "Treated request"}
								content={"Dear user,\n\n"
									+ this.getMailBody()
									+ "\n\nSincerely,\n"
									+ (this.getSettingValue("PROJECT_NAME") !== null
										? this.getSettingValue("PROJECT_NAME") + " " : "") + "Support Team"}
							/>
							: <Loading
								height={50}
							/>
						}
					</div>

					<div className="col-md-6 row-spaced">
						<h3>User</h3>
						{this.state.user_profile !== null
							? <>
								<RequestViewUser user_profile={this.state.user_profile}/>
							</>
							: <Message
								text={"No user in this request"}
								height={50}
							/>
						}
					</div>

					<div className="col-md-6 row-spaced">
						<h3>Entity</h3>
						{this.state.entity !== null
							? <Entity
								id={this.state.entity.id}
								name={this.state.entity.name}
								legalStatus={this.state.entity.legal_status}
							/>
							: <Message
								text={"No entity in this request"}
								height={50}
							/>
						}
					</div>

					<div className="col-md-12 row-spaced">
						<h3>Content</h3>
						{this.props.info !== undefined && this.props.info !== null
							&& this.props.info.request !== undefined && this.props.info.request !== null
							? this.props.info.request
							: <Message
								text={"No request content"}
								height={100}
							/>
						}
					</div>

					{this.props.info !== undefined && this.props.info !== null
						&& this.props.info.image !== undefined && this.props.info.image !== null
						&& <div className="col-md-12 row-spaced">
							<h3>Image</h3>
							<div className="Request-image">
								<img src={"data:image/png;base64," + this.props.info.image} />
							</div>
						</div>
					}

					{this.props.info !== undefined && this.props.info !== null
						&& this.props.info.file !== undefined && this.props.info.file !== null
						&& <div className="col-md-12 row-spaced">
							<h3>File</h3>
							<div>
								<a href={getApiURL() + "public/get_public_document/" + this.props.info.file}
									className="btn btn-secondary" rel="noreferrer" target="_blank">
									{this.props.info.file}
								</a>
							</div>
						</div>
					}

					{/* <div className="col-md-12 row-spaced">
						<h3>Data</h3>
						{this.props.info && this.props.info.data
							? this.props.info.data
							: <Message
								text={"No data in this request"}
								height={50}
							/>
						}
					</div> */}
				</div>
				}
			</Popup>
		);
	}
}
