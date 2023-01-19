import React from "react";
import "./CampaignEditAddress.css";
import Loading from "../../box/Loading.jsx";
import Table from "../../table/Table.jsx";
import { extractEmails } from "../../../utils/re.jsx";
import FormLine from "../../button/FormLine.jsx";
import Chip from "../../button/Chip.jsx";
import DialogImportCommunicationAddresses from "../../dialog/DialogImportCommunicationAddresses.jsx";
import DialogImportDatabaseAddresses from "../../dialog/DialogImportDatabaseAddresses.jsx";

export default class CampaignEditAddress extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			ignoredAddresses: [],
			addresses: [],
			additionalAddressField: null,
		};
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
			<div id="CampaignEditAddress" className="max-sized-page fade-in">
				<div className={"row row-spaced"}>
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
							? <Table
								columns={columns}
								data={this.state.addresses}
								showBottomBar={true}
							/>
							: <Loading
								height={300}
							/>
						}
					</div>
				</div>
			</div>
		);
	}
}
