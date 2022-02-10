import React, { Component } from "react";
import "./Request.css";
import Popup from "reactjs-popup";
import { NotificationManager as nm } from "react-notifications";
import { getRequest, postRequest } from "../../utils/request.jsx";
import User from "./User.jsx";
import Company from "./Company.jsx";
import FormLine from "../button/FormLine.jsx";
import Loading from "../box/Loading.jsx";
import Message from "../box/Message.jsx";
import DialogSendMail from "../dialog/DialogSendMail.jsx";
import RequestCompanyChange from "./request/RequestCompanyChange.jsx";
import RequestCompanyAdd from "./request/RequestCompanyAdd.jsx";
import RequestLogoChange from "./request/RequestLogoChange.jsx";
import RequestCompanyAddressAdd from "./request/RequestCompanyAddressAdd.jsx";
import RequestCompanyAddressChange from "./request/RequestCompanyAddressChange.jsx";
import RequestCompanyAddressDelete from "./request/RequestCompanyAddressDelete.jsx";
import RequestCompanyTaxonomyChange from "./request/RequestCompanyTaxonomyChange.jsx";

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
			company: null,
			requestStatus: null,
			settings: null,
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

		getRequest.call(this, "request/get_request_enums", (data) => {
			this.setState({
				requestStatus: data.status,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});

		if (this.props.info !== null && this.props.info !== undefined
			&& this.props.info.company_id !== null && this.props.info.company_id !== undefined) {
			getRequest.call(this, "company/get_company/" + this.props.info.company_id, (data) => {
				this.setState({
					company: data,
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
						if (value === "PROCESSED"
							&& this.state.user !== null) {
							const element = document.getElementById("Request-send-mail-button");
							element.click();
						}
					}

					nm.info("The property has been updated");
				});
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
			case "ENTITY ACCESS CLAIM":
				return "Your request to access the claimed entity has been treated.";
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
								? this.props.info.submission_date
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

						{this.props.info.type === "ENTITY CHANGE"
							&& this.state.user !== null
							&& this.state.company !== null
							&& <RequestCompanyChange
								data={this.props.info.data}
							/>
						}
						{this.props.info.type === "ENTITY ADD"
							&& this.state.user !== null
							&& <RequestCompanyAdd
								data={this.props.info.data}
							/>
						}
						{this.props.info.type === "ENTITY ADDRESS CHANGE"
							&& this.state.user !== null
							&& <RequestCompanyAddressChange
								data={this.props.info.data}
							/>
						}
						{this.props.info.type === "ENTITY ADDRESS ADD"
							&& this.state.user !== null
							&& <RequestCompanyAddressAdd
								data={this.props.info.data}
								companyId={this.props.info.company_id}
							/>
						}
						{this.props.info.type === "ENTITY ADDRESS DELETION"
							&& this.state.user !== null
							&& <RequestCompanyAddressDelete
								data={this.props.info.data}
							/>
						}
						{this.props.info.type === "ENTITY TAXONOMY CHANGE"
							&& this.state.user !== null
							&& <RequestCompanyTaxonomyChange
								data={this.props.info.data}
								companyId={this.props.info.company_id}
							/>
						}
						{this.props.info.type === "ENTITY LOGO CHANGE"
							&& this.state.user !== null
							&& <RequestLogoChange
								requestId={this.props.info.id}
								requestStatus={this.props.info.status}
								image={this.props.info.image}
								companyId={this.props.info.company_id}
							/>
						}

						{this.state.user !== null && this.state.settings !== null
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
						{this.state.user !== null
							? <User
								id={this.state.user.id}
								email={this.state.user.email}
							/>
							: <Loading
								height={50}
							/>
						}
					</div>

					<div className="col-md-6 row-spaced">
						<h3>Company</h3>
						{this.state.company !== null
							? <Company
								id={this.state.company.id}
								name={this.state.company.name}
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

					<div className="col-md-12 row-spaced">
						<h3>Data</h3>
						{this.props.info !== undefined && this.props.info !== null
							&& this.props.info.data !== undefined && this.props.info.data !== null
							? JSON.stringify(this.props.info.data)
							: <Message
								text={"No data in this request"}
								height={50}
							/>
						}
					</div>
				</div>
				}
			</Popup>
		);
	}
}
