import React, { Component } from "react";
import "./RequestCompanyChange.css";
import Popup from "reactjs-popup";
import { NotificationManager as nm } from "react-notifications";
import { getRequest, postRequest } from "../../../utils/request.jsx";
import Message from "../../box/Message.jsx";

export default class RequestCompanyChange extends Component {
	constructor(props) {
		super(props);

		this.refresh = this.refresh.bind(this);
		this.updateCompany = this.updateCompany.bind(this);

		this.state = {
			databaseCompany: null,
		};
	}

	refresh() {
		this.setState({
			databaseCompany: null,
		});

		if (this.props.data !== null && this.props.data.id !== undefined) {
			getRequest.call(this, "company/get_company/" + this.props.data.id, (data) => {
				this.setState({
					databaseCompany: data,
				});
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		}
	}

	updateCompany(prop, value) {
		if (this.props.data === undefined || this.props.data === null) {
			nm.warning("Data to be inserted not found");
			return;
		}

		if (this.props.data.id === undefined || this.props.data.id === undefined) {
			nm.warning("Company ID not found");
			return;
		}

		const params = {
			id: this.props.data.id,
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

		const modifiedFields = RequestCompanyChange
			.getModifiedFields(this.props.data, this.state.databaseCompany);

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
				<h3>Review entity changes</h3>

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
							{this.props.data[f]}
						</div>
						<div className="col-md-1">
							<button
								className={"blue-background small-button"}
								onClick={() => this.updateCompany(f, this.props.data[f])}
							>
								<i className="fas fa-check"/>
							</button>
						</div>
					</div>
				))}
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
						<i className="fas fa-tasks"/> Review entity changes
					</button>
				}
				modal
				closeOnDocumentClick
				onOpen={this.refresh}
			>
				{(close) => (
					<div className="row row-spaced">
						<div className="col-md-12">
							<h2>Review entity changes</h2>

							<div className={"top-right-buttons"}>
								<button
									className={"red-background"}
									onClick={close}>
									<i className="fas fa-times"></i>
								</button>
							</div>
						</div>

						{this.props.data !== null && this.getUpdateCompanyBlock()}
					</div>
				)}
			</Popup>
		);
	}
}
