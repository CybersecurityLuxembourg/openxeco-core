import React from "react";
import "./CompanyAddress.css";
import _ from "lodash";
import { NotificationManager as nm } from "react-notifications";
import { getRequest, postRequest } from "../../utils/request.jsx";
import Address from "../form/Address.jsx";
import DialogConfirmation from "../dialog/DialogConfirmation.jsx";
import Loading from "../box/Loading.jsx";
import Message from "../box/Message.jsx";

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
				<div className={"row row-spaced"}>
					<div className="col-md-12">
						<h2>Address</h2>
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
								<DialogConfirmation
									text={"Do you want to request deletion for this address?"}
									trigger={
										<button
											className={"red-background"}
										>
											<i className="fas fa-save"/> Request deletion...
										</button>
									}
									afterConfirmation={() => this.submitDeletionRequests(a)}
								/>
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
