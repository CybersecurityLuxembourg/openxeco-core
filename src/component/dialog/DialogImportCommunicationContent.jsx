import React from "react";
import "./DialogImportCommunicationContent.css";
import Popup from "reactjs-popup";
import { NotificationManager as nm } from "react-notifications";
import { getRequest } from "../../utils/request.jsx";
import DynamicTable from "../table/DynamicTable.jsx";
import Communication from "../item/Communication.jsx";
import Loading from "../box/Loading.jsx";
import { dictToURI } from "../../utils/url.jsx";

export default class DialogImportCommunicationContent extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			communications: null,
			selectedCommunication: null,
			pagination: null,
			page: 1,
		};
	}

	componentDidMount() {
		this.fetchCommunications();
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

	onConfirmation(close) {
		if (typeof this.props.onConfirmation === "function") {
			this.props.onConfirmation(
				this.state.selectedCommunication.subject,
				this.state.selectedCommunication.body,
			);
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
					<Communication
						info={value}
					/>
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
						<i className="fas fa-upload"/> Import from previous communication...
					</button>
				}
				modal
			>
				{(close) => <div className="row">
					<div className={"col-md-9 row-spaced"}>
						<h3>Import addresses from previous communication...</h3>
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

					{this.state.selectedCommunication
						&& <div className={"col-md-12 row-spaced"}>
							<h3>{this.state.selectedCommunication.subject}</h3>

							<div>
								{this.state.selectedCommunication.body}
							</div>
						</div>
					}

					<div className="col-md-12 row-spaced">
						<div className="right-buttons">
							<button
								onClick={() => this.onConfirmation(close)}
								disabled={!this.state.selectedCommunication
									|| !this.state.selectedCommunication.subject
									|| !this.state.selectedCommunication.body}>
								<i className="fas fa-plus"/> Add content
							</button>
						</div>
					</div>
				</div>}
			</Popup>
		);
	}
}
