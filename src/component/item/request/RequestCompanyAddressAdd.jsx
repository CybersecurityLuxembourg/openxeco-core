import React, { Component } from "react";
import "./RequestCompanyAddressAdd.css";
import Popup from "reactjs-popup";
import { NotificationManager as nm } from "react-notifications";
import { postRequest } from "../../../utils/request.jsx";
import Address from "../../button/Address.jsx";

export default class RequestCompanyAddressAdd extends Component {
	constructor(props) {
		super(props);

		this.insertAddress = this.insertAddress.bind(this);

		this.state = {
		};
	}

	insertAddress() {
		if (this.props.data === undefined || this.props.data === null) {
			nm.warning("Data to be inserted not found");
			return;
		}

		if (this.props.data.id !== undefined) {
			nm.warning("Cannot add an address with an ID");
			return;
		}

		if (this.props.companyId === undefined || this.props.companyId === null) {
			nm.warning("Company ID not found");
			return;
		}

		const params = this.props.data;
		params.company_id = this.props.companyId;

		postRequest.call(this, "address/add_address", params, () => {
			nm.info("The company address has been added");
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	render() {
		return (
			<Popup
				className="Popup-small-size"
				trigger={
					<button
						className={"blue-background"}
					>
						<i className="fas fa-tasks"/> Review entity address add
					</button>
				}
				modal
				closeOnDocumentClick
			>
				{(close) => (
					<div className="row row-spaced">
						<div className="col-md-12">
							<h2>Review entity address add</h2>

							<div className={"top-right-buttons"}>
								<button
									className={"red-background"}
									onClick={close}>
									<i className="fas fa-times"></i>
								</button>
							</div>
						</div>

						<div className="col-md-12">
							<Address
								info={this.props.data}
							/>
						</div>

						<div className="col-md-12 right-buttons">
							<button
								className={"blue-background"}
								onClick={this.insertAddress}
							>
								<i className="fas fa-plus"/> Add address
							</button>
						</div>
					</div>
				)}
			</Popup>
		);
	}
}
