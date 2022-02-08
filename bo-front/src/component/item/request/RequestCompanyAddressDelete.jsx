import React, { Component } from "react";
import "./RequestCompanyAddressDelete.css";
import Popup from "reactjs-popup";
import { NotificationManager as nm } from "react-notifications";
import { postRequest } from "../../../utils/request.jsx";
import Address from "../../button/Address.jsx";

export default class RequestCompanyAddressDelete extends Component {
	constructor(props) {
		super(props);

		this.deleteAddress = this.deleteAddress.bind(this);

		this.state = {
		};
	}

	deleteAddress() {
		if (this.props.data === undefined || this.props.data === null) {
			nm.warning("Data to be inserted not found");
			return;
		}

		if (this.props.data.id === undefined) {
			nm.warning("Cannot delete an address without an ID");
			return;
		}

		const params = {
			id: this.props.data.id,
		};

		postRequest.call(this, "address/delete_address", params, () => {
			nm.info("The entity address has been deleted");
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
						<i className="fas fa-tasks"/> Review entity address delete
					</button>
				}
				modal
				closeOnDocumentClick
			>
				{(close) => (
					<div className="row row-spaced">
						<div className="col-md-12">
							<h2>Review entity address delete</h2>

							<div className={"top-right-buttons"}>
								<button
									className={"grey-background"}
									onClick={close}>
									<i className="far fa-times-circle"/>
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
								onClick={this.deleteAddress}
							>
								<i className="fas fa-trash-alt"/> Delete address
							</button>
						</div>
					</div>
				)}
			</Popup>
		);
	}
}
