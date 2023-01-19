import React from "react";
import "./CampaignAddresses.css";
import Popup from "reactjs-popup";
import { NotificationManager as nm } from "react-notifications";
import { getRequest, postRequest } from "../../../utils/request.jsx";
import FormLine from "../../button/FormLine.jsx";
import Loading from "../../box/Loading.jsx";
import DialogImportCampaignAddresses from "./DialogImportCampaignAddresses.jsx";
import DialogImportDatabaseAddresses from "./DialogImportDatabaseAddresses.jsx";
import Table from "../../table/Table.jsx";
import { extractEmails } from "../../../utils/re.jsx";
import Chip from "../../button/Chip.jsx";

export default class CampaignAddresses extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			addresses: null,
			manualAddressField: "",
		};
	}

	componentDidMount() {
		this.fetchAddresses();
	}

	fetchAddresses() {
		getRequest.call(this, "campaign/get_campaign_addresses?campaign_id=" + this.props.campaign.id, (data) => {
			this.setState({
				addresses: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	addAddresses(addresses, close) {
		const params = {
			campaign_id: this.props.campaign.id,
			addresses,
		};

		postRequest.call(this, "campaign/add_campaign_addresses", params, () => {
			this.fetchAddresses();
			if (close) {
				close();
			}
			nm.info("The addresses has been added");
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	deleteAddresses(addressId) {
		const params = {
			ids: [addressId],
		};

		postRequest.call(this, "campaign/delete_campaign_addresses", params, () => {
			this.fetchAddresses();
			nm.info("The addresses has been deleted");
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	getAddressesFromText() {
		if (this.state.manualAddressField) {
			return extractEmails(this.state.manualAddressField);
		}

		return [];
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	render() {
		if (!this.state.addresses || !this.props.campaign) {
			return <Loading height={300} />;
		}

		const columns = [
			{
				Header: "Address",
				accessor: "value",
			},
			{
				id: "124",
				Header: "Action",
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					<button
						className={"small-button red-button"}
						onClick={() => this.deleteAddresses(value.id)}>
						<i className="fas fa-trash-alt"/>
					</button>
				),
				width: 60,
			},
		];

		return (
			<div id="CampaignAddresses" className={"row"}>
				<div className="col-md-12">
					<h2>Addresses</h2>
				</div>

				<div className="col-md-12">
					<div className="right-buttons">
						<DialogImportCampaignAddresses
							onConfirmation={(addresses) => this.addAddresses(addresses)}
						/>
						<DialogImportDatabaseAddresses
							onConfirmation={(addresses) => this.addAddresses(addresses)}
						/>
						<Popup
							className="Popup-small-size"
							trigger={
								<button>
									<i className="fas fa-keyboard"/> Add manually...
								</button>
							}
							onOpen={this.fetchCommunications}
							modal
						>
							{(close) => <div className="row">
								<div className={"col-md-9"}>
									<h2>Add manually...</h2>
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

								<div className={"col-md-12"}>
									<FormLine
										label={"Add addresses manually"}
										type={"textarea"}
										value={this.state.manualAddressField}
										onChange={(v) => this.changeState("manualAddressField", v)}
									/>
								</div>

								<div className="offset-md-6 col-md-6">
									{this.getAddressesFromText().map((a) => <Chip
										label={a}
										key={a}
									/>)}
								</div>

								<div className={"col-md-12"}>
									<div className="right-buttons">
										<button
											onClick={() => this.addAddresses(this.getAddressesFromText(), close)}
											disabled={this.getAddressesFromText().length === 0}>
											<i className="fas fa-plus"/> Add addresses
										</button>
									</div>
								</div>
							</div>}
						</Popup>
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
		);
	}
}
