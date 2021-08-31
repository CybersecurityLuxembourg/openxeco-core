import React from "react";
import "./CompanyAddress.css";
import _ from "lodash";
import { NotificationManager as nm } from "react-notifications";
import { getRequest, postRequest } from "../../utils/request.jsx";
import Address from "../form/Address.jsx";
import DialogConfirmation from "../dialog/DialogConfirmation.jsx";
import Loading from "../box/Loading.jsx";
import Message from "../box/Message.jsx";
import DialogHint from "../dialog/DialogHint.jsx";

export default class CompanyAddress extends React.Component {
	constructor(props) {
		super(props);

		this.submitModificationRequests = this.submitModificationRequests.bind(this);
		this.submitDeletionRequests = this.submitDeletionRequests.bind(this);
		this.submitAddRequests = this.submitAddRequests.bind(this);

		this.state = {
			originalAddresses: null,
			addresses: null,
			addressToAdd: {},
		};
	}

	componentDidMount() {
		this.getAddresses();
	}

	getAddresses() {
		this.setState({
			originalAddresses: null,
			addresses: null,
		});

		getRequest.call(this, "private/get_my_company_addresses/" + this.props.companyId, (data) => {
			this.setState({
				originalAddresses: data,
				addresses: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	submitModificationRequests(address) {
		const params = {
			type: "ENTITY ADDRESS CHANGE",
			request: "The user requests modifications on an entity",
			company_id: this.props.companyId,
			data: address,
		};

		postRequest.call(this, "private/add_request", params, () => {
			this.props.getNotifications();
			nm.info("The request has been sent and will be reviewed");
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	submitDeletionRequests(address) {
		const params = {
			type: "ENTITY ADDRESS DELETION",
			request: "The user requests address deletion on an entity",
			company_id: this.props.companyId,
			data: address,
		};

		postRequest.call(this, "private/add_request", params, () => {
			this.props.getNotifications();
			nm.info("The request has been sent and will be reviewed");
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	submitAddRequests() {
		const params = {
			type: "ENTITY ADDRESS ADD",
			request: "The user requests address add on an entity",
			company_id: this.props.companyId,
			data: this.state.addressToAdd,
		};

		postRequest.call(this, "private/add_request", params, () => {
			this.props.getNotifications();
			nm.info("The request has been sent and will be reviewed");
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	updateAddresses(index, field, value) {
		const c = JSON.parse(JSON.stringify(this.state.addresses));
		c[index][field] = value;
		this.setState({ addresses: c });
	}

	revertAddress(index) {
		const c = JSON.parse(JSON.stringify(this.state.addresses));
		c[index] = this.state.originalAddresses[index];
		this.setState({ addresses: c });
	}

	updateAddressToAdd(field, value) {
		const c = JSON.parse(JSON.stringify(this.state.addressToAdd));
		c[field] = value;
		this.setState({ addressToAdd: c });
	}

	static isFieldCompleted(v) {
		return v !== undefined && v.length > 0;
	}

	render() {
		if (this.state.addresses === null
			|| this.state.addresses === undefined) {
			return <Loading
				height={300}
			/>;
		}

		return (
			<div id="CompanyAddress" className="max-sized-page fade-in">
				<div className={"row"}>
					<div className="col-md-9">
						<h2>Address</h2>
					</div>

					<div className="col-md-3 top-title-menu">
						<DialogHint
							content={
								<div className="row">
									<div className="col-md-12">
										<h2>How can I add an address to my entity?</h2>

										<p>
											You can add an address by completing the following form and
											selecting the &quot;Request add&quot; button:
										</p>

										<img src="/img/hint-add-address.png"/>

										<p>
											Note that the Street, City and Country fields are mandatory
											to complete the form.
										</p>

										<p>
											This will send a request to the administration team, who will
											either accept or reject your request.
										</p>

										<h2>How can I delete an address of my entity?</h2>

										<p>
											You can delete an address of your entity by clicking the
											red button:
										</p>

										<img src="/img/hint-delete-address-button.png"/>

										<p>
											This will send a request to the administration team, who will
											either accept or reject your request.
										</p>

										<h2>How can I modify an address from my entity?</h2>

										<p>
											You can modify the fields and select the following button:
										</p>

										<img src="/img/hint-modify-address-button.png"/>

										<p>
											This will send a request to the administration team, who will
											either accept or reject your request.
										</p>

										<h2>Note</h2>

										<p>
											You can follow up your requests by going on this menu:
										</p>

										<img src="/img/hint-request-menu.png"/>
									</div>
								</div>
							}
						/>
					</div>
				</div>

				<div className={"row row-spaced"}>
					<div className="col-md-12">
						{this.state.originalAddresses.length === 0
							&& <Message
								text={"No address found for this entity"}
								height={150}
							/>
						}

						{this.state.addresses.map((a, y) => <div className="col-md-12" key={a.company_id}>
							<h3>Address {y + 1}</h3>
							<Address
								info={a}
								onChange={(f, v) => this.updateAddresses(y, f, v)}
							/>

							<div className={"right-buttons"}>
								<button
									className={"blue-background"}
									disabled={_.isEqual(
										this.state.addresses.filter((ad) => ad.id === a.id),
										this.state.originalAddresses.filter((ad) => ad.id === a.id),
									)}
									onClick={() => this.revertAddress(y)}
								>
									<i className="fas fa-undo-alt"/>
								</button>

								<DialogConfirmation
									text={"Do you want to request deletion for this address?"}
									trigger={
										<button
											className={"red-background"}
										>
											<i className="far fa-trash-alt"/> Request deletion...
										</button>
									}
									afterConfirmation={() => this.submitDeletionRequests(a)}
								/>

								<DialogConfirmation
									text={"Do you want to request modifications for this address?"}
									trigger={
										<button
											className={"blue-background"}
											disabled={_.isEqual(
												this.state.addresses
													.filter((ad) => ad.id === a.id),
												this.state.originalAddresses
													.filter((ad) => ad.id === a.id),
											)}
										>
											<i className="fas fa-save"/> Request modifications...
										</button>
									}
									afterConfirmation={() => this.submitModificationRequests(a)}
								/>
							</div>
						</div>)
						}
					</div>
				</div>

				<div className={"row row-spaced"}>
					<div className="col-md-12">
						<h3>Add an address</h3>
					</div>
				</div>

				<div className="col-md-12">
					<Address
						info={this.state.addressToAdd}
						onChange={(f, v) => this.updateAddressToAdd(f, v)}
					/>

					<div className={"right-buttons"}>
						<button
							className={"blue-background"}
							onClick={this.submitAddRequests}
							disabled={ !CompanyAddress.isFieldCompleted(this.state.addressToAdd.address_1)
								|| !CompanyAddress.isFieldCompleted(this.state.addressToAdd.city)
								|| !CompanyAddress.isFieldCompleted(this.state.addressToAdd.country)}
						>
							<i className="fas fa-save"/> Request add
						</button>
					</div>
				</div>
			</div>
		);
	}
}
