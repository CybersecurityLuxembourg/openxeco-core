import React, { Component } from "react";
import "./RequestCompanyAddressAdd.css";
import Popup from "reactjs-popup";
import Address from "../../button/Address.jsx";

export default class RequestCompanyAddressAdd extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
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
									className={"grey-background"}
									onClick={close}>
									<i className="far fa-times-circle"></i>
								</button>
							</div>
						</div>

						<div className="col-md-12">
							<Address
								info={{
									...this.props.data,
									...{ company_id: this.props.companyId },
								}}
							/>
						</div>
					</div>
				)}
			</Popup>
		);
	}
}
