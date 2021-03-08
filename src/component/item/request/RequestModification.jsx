import React, { Component } from "react";
import "./RequestModification.css";
import Popup from "reactjs-popup";
import { NotificationManager as nm } from "react-notifications";
import { getRequest, postRequest } from "../../../utils/request.jsx";
import Message from "../../box/Message.jsx";

export default class RequestModification extends Component {
	constructor(props) {
		super(props);

		this.refresh = this.refresh.bind(this);
		this.onClick = this.onClick.bind(this);
		this.onClose = this.onClose.bind(this);
		this.onOpen = this.onOpen.bind(this);
		this.parseData = this.parseData.bind(this);
		this.insertCompany = this.insertCompany.bind(this);
		this.insertAddress = this.insertAddress.bind(this);
		this.updateCompany = this.updateCompany.bind(this);
		this.updateAddress = this.updateAddress.bind(this);

		this.state = {
			databaseCompany: null,
			databaseAddresses: null,
			company: null,
			addresses: null,
		};
	}

	componentDidUpdate(prevProps, prevState) {
		if (prevState.company !== this.state.company
            || prevState.addresses !== this.state.addresses) this.refresh();
	}

	refresh() {
		this.setState({
			databaseCompany: null,
			databaseAddresses: null,
		});

		if (this.state.company !== null && this.state.company.id !== undefined) {
			getRequest.call(this, "company/get_company/" + this.state.company.id, (data) => {
				this.setState({
					databaseCompany: data,
				});
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});

			getRequest.call(this, "company/get_company_addresses/" + this.state.company.id, (data) => {
				this.setState({
					databaseAddresses: data,
				});
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
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
		this.setState({ isDetailOpened: false });
	}

	onOpen() {
		this.parseData();
	}

	parseData() {
		const openMatches = this.props.request.indexOf("{");
		const closeMatches = this.props.request.lastIndexOf("}");

		if (openMatches === -1) {
			nm.warning("Impossible to parse the data #1");
			return;
		}

		if (closeMatches === -1) {
			nm.warning("Impossible to parse the data #2");
			return;
		}

		let data = this.props.request.substring(openMatches, closeMatches + 1);

		try {
			data = JSON.parse(data);

			this.setState({
				company: data.company === undefined ? null : data.company,
				addresses: data.addresses === undefined ? null : data.addresses,
			});
		} catch (e) {
			nm.warning("Impossible to parse the data #3");
		}
	}

	updateCompany(prop, value) {
		if (this.state.company !== null && this.state.company.id !== undefined) {
			const params = {
				id: this.state.company.id,
				[prop]: value,
			};

			postRequest.call(this, "company/update_company", params, () => {
				this.refresh();
				nm.info("The company has been updated");
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		} else {
			nm.warning("No company identifier found");
		}
	}

	updateAddress(id, prop, value) {
		const params = {
			id,
			[prop]: value,
		};

		postRequest.call(this, "address/update_address", params, () => {
			this.refresh();
			nm.info("The address has been updated");
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	insertCompany() {
		if (this.state.company !== null && this.state.company.id === undefined) {
			const params = this.state.company;

			postRequest.call(this, "company/add_company", params, () => {
				this.refresh();
				nm.info("The company has been added");
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		} else {
			nm.warning("A company with an ID cannot be inserted");
		}
	}

	insertAddress(address) {
		if (this.state.address !== null && this.state.address.id === undefined) {
			const params = address;

			params.company_id = this.state.company.id;

			postRequest.call(this, "address/add_address", params, () => {
				this.refresh();
				nm.info("The address has been added");
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		} else {
			nm.warning("An address with an ID cannot be inserted");
		}
	}

	static getModifiedFields(c1, c2) {
		const fields = [];

		Object.entries(c1).forEach(([key]) => {
			if (c1[key] !== c2[key]) fields.push(key);
		});

		return fields;
	}

	getUpdateCompanyBlock() {
		if (this.state.databaseCompany === null) return null;

		const modifiedFields = this.getModifiedFields(this.state.company, this.state.databaseCompany);

		if (modifiedFields.length === 0) {
			return (
				<div className="col-md-12 row-spaced">
					<h3>Update an existing company</h3>
					<Message
						text={"No difference detected between the request and the database"}
						height={100}
					/>
				</div>
			);
		}

		return (
			<div className="col-md-12">
				<h3>Update an existing company</h3>

				{modifiedFields.map((f) => (
					<div className="row row-spaced" key={f}>
						<div className="col-md-12">
							<h4>{f}</h4>
						</div>
						<div className="col-md-5">
							{this.state.databaseCompany[f]}
						</div>
						<div className="col-md-1">
							<i className="fas fa-long-arrow-alt-right"/>
						</div>
						<div className="col-md-5">
							{this.state.company[f]}
						</div>
						<div className="col-md-1">
							<button
								className={"blue-background small-button"}
								onClick={() => this.updateCompany(f, this.state.company[f])}
							>
								<i className="fas fa-check"/>
							</button>
						</div>
					</div>
				))}
			</div>
		);
	}

	getAddCompanyBlock() {
		if (this.state.company.id !== undefined) return null;

		return (
			<div className="col-md-12 row-spaced">
				<h3>Add a new company</h3>

				{Object.keys(this.state.company).map((key) => (
					<div className="row" key={key}>
						<div className="col-md-6">
							{key}
						</div>
						<div className="col-md-6">
							{this.state.company[key]}
						</div>
					</div>
				))}

				<div className="row">
					<div className="col-md-12 right-buttons">
						<button
							className={"blue-background"}
							onClick={this.insertCompany}
						>
							<i className="fas fa-check"/> Add company
						</button>
					</div>
				</div>
			</div>
		);
	}

	getUpdateAddressBlock(address) {
		if (this.state.databaseAddresses === null) return null;

		const databaseAddresses = this.state.databaseAddresses.filter((d) => d.id === address.id);

		if (databaseAddresses.length === 0) {
			return null;
		}

		const databaseAddress = databaseAddresses[0];

		const modifiedFields = this.getModifiedFields(address, databaseAddress);

		if (modifiedFields.length === 0) {
			return (
				<div className="col-md-12 row-spaced">
					<h3>Update an existing address</h3>
					<Message
						text={"No difference detected between the request and the database"}
						height={100}
					/>
				</div>
			);
		}

		return (
			<div className="col-md-12 row-spaced">
				<h3>Update an existing address</h3>

				{modifiedFields.map((f) => (
					<div className="row" key={f}>
						<div className="col-md-12">
							<h4>{f}</h4>
						</div>
						<div className="col-md-5">
							{databaseAddress[f]}
						</div>
						<div className="col-md-1">
							<i className="fas fa-long-arrow-alt-right"/>
						</div>
						<div className="col-md-5">
							{address[f]}
						</div>
						<div className="col-md-1">
							<button
								className={"blue-background small-button"}
								onClick={() => this.updateAddress(address.id, f, address[f])}
							>
								<i className="fas fa-check"/>
							</button>
						</div>
					</div>
				))}
			</div>
		);
	}

	getAddAddressBlock(address) {
		if (this.state.address.id !== undefined) return null;

		return (
			<div className="col-md-12 row-spaced">
				<h3>Add a new address</h3>

				{Object.keys(address).map((key) => (
					<div className="row" key={key}>
						<div className="col-md-6">
							{key}
						</div>
						<div className="col-md-6">
							{address[key]}
						</div>
					</div>
				))}

				<div className="row">
					<div className="col-md-12 right-buttons">
						<button
							className={"blue-background"}
							onClick={() => this.insertAddress(address)}
						>
							<i className="fas fa-check"/> Add address
						</button>
					</div>
				</div>
			</div>
		);
	}

	render() {
		return (
			<Popup
				className="Popup-small-size"
				trigger={
					<button
						className={"blue-background"}
					>
						<i className="fas fa-tasks"/> Review modifications
					</button>
				}
				modal
				closeOnDocumentClick
				onClose={this.onClose}
				onOpen={this.onOpen}
			>
				<div className="row row-spaced">
					<div className="col-md-12">
						<h2>
                            Review modifications
						</h2>
					</div>

					{this.state.company !== null && this.getUpdateCompanyBlock()}
					{this.state.company !== null && this.getAddCompanyBlock()}

					{this.state.addresses !== null
						? this.state.addresses.map((a) => this.getUpdateAddressBlock(a))
						: ""}

					{this.state.addresses !== null
						? this.state.addresses.map((a) => this.getAddAddressBlock(a))
						: ""}

					{this.state.addresses !== null
						? this.state.addresses.map((a) => this.getDeleteAddressBlock(a))
						: ""}
				</div>
			</Popup>
		);
	}
}
