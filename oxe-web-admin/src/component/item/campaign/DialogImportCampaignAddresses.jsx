import React from "react";
import "./DialogImportCampaignAddresses.css";
import Popup from "reactjs-popup";
import { NotificationManager as nm } from "react-notifications";
import { getRequest } from "../../../utils/request.jsx";
import DynamicTable from "../../table/DynamicTable.jsx";
import Loading from "../../box/Loading.jsx";
import Message from "../../box/Message.jsx";
import Chip from "../../button/Chip.jsx";
import { dictToURI } from "../../../utils/url.jsx";

export default class DialogImportCampaignAddresses extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			campaigns: null,
			selectedCampaign: null,
			selectedAddresses: [],
			pagination: null,
			page: 1,
		};
	}

	componentDidUpdate(_, prevState) {
		if (prevState.selectedCampaign !== this.state.selectedCampaign
			&& this.state.selectedCampaign) {
			this.fetchAddresses();
		}
	}

	fetchCampaigns(page) {
		const filters = {
			page: Number.isInteger(page) ? page : this.state.page,
			per_page: 10,
		};

		getRequest.call(this, "campaign/get_campaigns?" + dictToURI(filters), (data) => {
			this.setState({
				campaigns: data.items,
				pagination: data.pagination,
				page,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	fetchAddresses() {
		const filters = {
			campaign_id: this.state.selectedCampaign,
		};

		getRequest.call(this, "campaign/get_campaign_addresses?" + dictToURI(filters), (data) => {
			this.setState({
				selectedAddresses: data.map((a) => a.value),
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	onConfirmation(close) {
		if (typeof this.props.onConfirmation === "function") {
			this.props.onConfirmation(this.state.selectedAddresses);
		}

		close();
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	render() {
		const columns = [
			{
				Header: "Subject",
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					value.name
				),
				width: 300,
			},
			{
				Header: "Status",
				accessor: "status",
			},
			{
				Header: "System date",
				accessor: "sys_date",
			},
			{
				Header: "Select",
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					<button
						className={"small-button"}
						onClick={() => this.setState({ selectedCampaign: value.id })}>
						<i className="far fa-check-circle"/>
					</button>
				),
				width: 80,
			},
		];

		return (
			<Popup
				className="Popup-small-size"
				trigger={
					<button>
						<i className="fas fa-history"/> Import from prev. campaign...
					</button>
				}
				onOpen={() => this.fetchCampaigns()}
				modal
			>
				{(close) => <div className="row">
					<div className={"col-md-9 row-spaced"}>
						<h2><i className="fas fa-history"/> Import from previous campaign</h2>
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

					<div className={"col-md-12 row-spaced"}>
						{this.state.campaigns
							? <DynamicTable
								columns={columns}
								data={this.state.campaigns}
								pagination={this.state.pagination}
								changePage={this.fetchDataControls}
							/>
							: <Loading
								height={150}
							/>
						}
					</div>

					<div className={"col-md-12 row-spaced"}>
						<h3>{this.state.selectedAddresses.length} address{this.state.selectedAddresses.length > 1 && "es"} selected</h3>

						{this.state.selectedAddresses.length === 0
							&& <Message
								text={"No address selected"}
								height={100}
							/>
						}

						{this.state.selectedAddresses.length > 0
							&& this.state.selectedAddresses.map((a) => (
								<Chip
									key={a}
									label={a}
								/>
							))
						}
					</div>

					<div className="col-md-12 row-spaced">
						<div className="right-buttons">
							<button
								onClick={() => this.onConfirmation(close)}
								disabled={this.state.selectedAddresses.length === 0}>
								<i className="fas fa-upload"/> Import addresses
							</button>
						</div>
					</div>
				</div>}
			</Popup>
		);
	}
}
