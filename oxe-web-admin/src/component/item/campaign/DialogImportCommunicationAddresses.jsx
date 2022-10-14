import React from "react";
import "./DialogImportCommunicationAddresses.css";
import Popup from "reactjs-popup";
import { NotificationManager as nm } from "react-notifications";
import { getRequest } from "../../../utils/request.jsx";
import DynamicTable from "../../table/DynamicTable.jsx";
import Loading from "../../box/Loading.jsx";
import Chip from "../../button/Chip.jsx";
import { dictToURI } from "../../../utils/url.jsx";

export default class DialogImportCommunicationAddresses extends React.Component {
	constructor(props) {
		super(props);

		this.fetchCommunications = this.fetchCommunications.bind(this);
		this.onConfirmation = this.onConfirmation.bind(this);

		this.state = {
			communications: null,
			selectedCommunication: null,
			pagination: null,
			page: 1,
		};
	}

	fetchCommunications(page) {
		const filters = {
			page: Number.isInteger(page) ? page : this.state.page,
			per_page: 10,
		};

		getRequest.call(this, "communication/get_communications?" + dictToURI(filters), (data) => {
			this.setState({
				communications: data.items,
				pagination: data.pagination,
				page,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	getSelectedAddresses() {
		if (this.state.selectedCommunication && this.state.selectedCommunication.addresses) {
			return this.state.selectedCommunication.addresses
				.replaceAll(" ", "")
				.split(",")
				.map((a) => ({
					email: a,
					information: "",
					source: "PREVIOUS COMMUNICATION",
				}));
		}

		return [];
	}

	onConfirmation(close) {
		if (typeof this.props.onConfirmation === "function") {
			this.props.onConfirmation(this.getSelectedAddresses());
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
						onClick={() => this.setState({ selectedCommunication: value })}>
						<i className="far fa-check-circle"/>
					</button>
				),
				width: 80,
			},
		];

		return (
			<Popup
				className="Popup-full-size"
				trigger={
					<button>
						<i className="fas fa-history"/> Import from prev. campaign...
					</button>
				}
				onOpen={this.fetchCommunications}
				modal
			>
				{(close) => <div className="row">
					<div className={"col-md-9 row-spaced"}>
						<h3>Import addresses from prev. campaign...</h3>
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
						{this.state.communications
							? <DynamicTable
								columns={columns}
								data={this.state.communications}
								pagination={this.state.pagination}
								changePage={this.fetchDataControls}
							/>
							: <Loading
								height={250}
							/>
						}
					</div>

					<div className={"col-md-12 row-spaced"}>
						<h3>{this.getSelectedAddresses().length} addresse{this.getSelectedAddresses().length > 1 && "s"} selected</h3>

						{this.getSelectedAddresses().map((a) => (
							<Chip
								key={a.email}
								label={a.email}
							/>
						))}
					</div>

					<div className="col-md-12 row-spaced">
						<div className="right-buttons">
							<button
								onClick={() => this.onConfirmation(close)}
								disabled={this.getSelectedAddresses().length === 0}>
								<i className="fas fa-upload"/> Import addresses
							</button>
						</div>
					</div>
				</div>}
			</Popup>
		);
	}
}
