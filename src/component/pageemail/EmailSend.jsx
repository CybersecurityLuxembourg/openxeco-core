import React from "react";
import "./EmailSend.css";
import { NotificationManager as nm } from "react-notifications";
import Loading from "../box/Loading.jsx";
import Info from "../box/Info.jsx";
import Warning from "../box/Warning.jsx";
import Table from "../table/Table.jsx";
import { getRequest, postRequest } from "../../utils/request.jsx";
import { extractEmails } from "../../utils/re.jsx";
import FormLine from "../button/FormLine.jsx";
import Chip from "../button/Chip.jsx";
import DialogConfirmation from "../dialog/DialogConfirmation.jsx";
import DialogImportCommunicationAddresses from "../dialog/DialogImportCommunicationAddresses.jsx";
import DialogImportCommunicationContent from "../dialog/DialogImportCommunicationContent.jsx";
import DialogImportDatabaseAddresses from "../dialog/DialogImportDatabaseAddresses.jsx";

export default class EmailSend extends React.Component {
	constructor(props) {
		super(props);

		this.sendDraft = this.sendDraft.bind(this);
		this.sendCommunication = this.sendCommunication.bind(this);
		this.removeAddress = this.removeAddress.bind(this);

		const defaultState = {
			ignoredAddresses: [],
			addresses: [],

			additionalAddressField: null,

			subject: null,
			body: null,
		};

		this.state = {
			user: null,

			defaultState,
			...defaultState,
		};
	}

	componentDidMount() {
		this.getMyUser();
	}

	sendDraft() {
		const params = {
			address: this.state.user.email,
			subject: this.state.subject,
			content: this.state.body,
		};

		postRequest.call(this, "mail/send_mail", params, () => {
			nm.info("The draft has been sent");
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	sendCommunication() {
		const params = {
			addresses: this.getSelectedAddresses(),
			subject: this.state.subject,
			body: this.state.body,
		};

		postRequest.call(this, "communication/send_communication", params, () => {
			nm.info("The communication has been sent");

			this.setState({
				...this.state.defaultState,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	getMyUser() {
		getRequest.call(this, "private/get_my_user", (data) => {
			this.setState({
				user: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	addAddresses(addresses) {
		if (addresses.length > 0) {
			const addressList = this.state.addresses.map((a) => a.email);
			let addressObjects = null;

			if (typeof addresses[0] === "string") {
				addressObjects = addresses
					.map((a) => ({
						email: a,
						information: "",
						source: "MANUALLY ADDED",
					}));
			} else {
				addressObjects = addresses;
			}

			this.setState({
				addresses: this.state.addresses
					.concat(addressObjects.filter((a) => addressList.indexOf(a.email) < 0)),
				additionalAddressField: null,
			});
		}
	}

	removeAddress(address) {
		this.setState({
			addresses: this.state.addresses
				.filter((a) => a.email !== address),
		});
	}

	addOrRemoveIgnoredAddress(address, isToAdd) {
		const ignoredAddresses = this.state.ignoredAddresses.map((a) => a);

		if (!isToAdd) {
			ignoredAddresses.push(address);
		} else {
			ignoredAddresses.filter((a) => a !== address);
		}

		this.setState({ ignoredAddresses });
	}

	getAddressesFromText() {
		if (this.state.additionalAddressField) {
			return extractEmails(this.state.additionalAddressField);
		}

		return [];
	}

	getSelectedAddresses() {
		if (this.state.addresses) {
			const addresses = this.state.addresses
				.filter((a) => this.state.ignoredAddresses.indexOf(a.email) < 0)
				.map((a) => a.email.toLowerCase());
			return [...new Set(addresses)];
		}

		return [];
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	render() {
		const columns = [
			{
				subject: "email",
				accessor: "email",
			},
			{
				subject: "Information",
				accessor: "information",
			},
			{
				subject: "Source",
				accessor: "source",
			},
			{
				id: "124",
				subject: "Action",
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					<button
						className={"small-button red-button"}
						onClick={() => this.removeAddress(value.email)}>
						<i className="fas fa-trash-alt"/>
					</button>
				),
				width: 60,
			},
		];

		return (
			<div id="EmailSend" className="page max-sized-page">
				<div className={"row row-spaced"}>
					<div className="col-md-12">
						<h1>Send a communication via email</h1>
					</div>

					<div className="col-md-12">
						<h2>Step 1: Select addresses</h2>
					</div>

					<div className="col-md-12 row-spaced">
						<div className="right-buttons">
							<DialogImportCommunicationAddresses
								onConfirmation={(addresses) => this.addAddresses(addresses)}
							/>
							<DialogImportDatabaseAddresses
								onConfirmation={(addresses) => this.addAddresses(addresses)}
							/>
						</div>
					</div>

					<div className="col-md-12">
						<FormLine
							label={"Add addresses manually"}
							type={"textarea"}
							value={this.state.additionalAddressField}
							onChange={(v) => this.changeState("additionalAddressField", v)}
						/>
					</div>

					<div className="col-md-6">
					</div>

					<div className="col-md-6">
						{this.getAddressesFromText().map((a) => <Chip
							label={a}
							key={a}
						/>)}
					</div>

					<div className="col-md-12 row-spaced">
						<div className="right-buttons">
							<button
								onClick={() => this.addAddresses(this.getAddressesFromText())}
								disabled={this.getAddressesFromText().length === 0}>
								<i className="fas fa-plus"/> Add addresses
							</button>
						</div>
					</div>

					<div className="col-md-12 row-spaced">
						{this.state.addresses
							? <div className="fade-in">
								<Table
									columns={columns}
									data={this.state.addresses}
									showBottomBar={true}
								/>
							</div>
							: <Loading
								height={300}
							/>
						}
					</div>

					<div className="col-md-12">
						<h2>Step 2: Edit the content of the email</h2>
					</div>

					<div className="col-md-12">
						<div className="right-buttons">
							<DialogImportCommunicationContent
								onConfirmation={(subject, body) => this.setState({
									subject,
									body,
								})}
							/>
						</div>
					</div>

					<div className="col-md-12 row-spaced">
						<FormLine
							label={"Subject"}
							value={this.state.subject}
							onChange={(v) => this.changeState("subject", v)}
							fullWidth={"true"}
						/>
						<FormLine
							className={"EmailSend-body-field"}
							label={"Body"}
							type={"editor"}
							value={this.state.body}
							onChange={(v) => this.changeState("body", v)}
							fullWidth={"true"}
						/>
					</div>

					<div className="col-md-12 row-spaced">
						<div className="right-buttons">
							<button
								onClick={this.sendDraft}
								disabled={!this.state.user}>
								<i className="fas fa-stethoscope"/>&nbsp;
								{this.state.user
									? "Send a draft to " + this.state.user.email
									: "Send a draft to myself"
								}
							</button>
						</div>
					</div>

					<div className="col-md-12">
						<h2>Step 3: Send the communication</h2>
					</div>

					<div className="col-md-12">
						<Info
							content={"The recipients are set as BCC. So they won't be able to see each others."}
						/>

						{this.getSelectedAddresses().length === 0
							? <Warning
								content={"You cannot send the communication as "
									+ "you have not selected any address"}
							/>
							: <Info
								content={this.getSelectedAddresses().length + " email addresses selected"}
							/>
						}

						{(this.state.subject === null || this.state.subject.length === 0)
							&& <Warning
								content={"You cannot sent the communication as the subject of the mail is empty"}
							/>
						}

						{(this.state.body === null || this.state.body.length === 0)
							&& <Warning
								content={"You cannot sent the communication as the body of the mail is empty"}
							/>
						}
					</div>

					<div className="col-md-12 row-spaced">
						<div className="right-buttons">
							<DialogConfirmation
								text={"Are you sure you want to send the communication?"}
								trigger={
									<button
										disabled={
											this.getSelectedAddresses().length === 0
											|| this.state.subject === null
											|| this.state.subject.length === 0
											|| this.state.body === null
											|| this.state.body.length === 0
										}
									>
										<i className="fas fa-bullhorn"/> Send the communication...
									</button>
								}
								afterConfirmation={this.sendCommunication}
							/>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
