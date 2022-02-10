import React from "react";
import "./DialogSelectCompany.css";
import Popup from "reactjs-popup";
import { NotificationManager as nm } from "react-notifications";
import FormLine from "../button/FormLine.jsx";
import { getRequest } from "../../utils/request.jsx";
import Loading from "../box/Loading.jsx";

export default class DialogSelectCompany extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			companies: null,
			selectedCompany: null,
		};
	}

	getCompanies() {
		getRequest.call(this, "company/get_companies", (data) => {
			this.setState({
				companies: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	onConfirmation(close) {
		if (this.props.onConfirmation) {
			this.props.onConfirmation(this.state.selectedCompany);
		}

		close();
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	render() {
		return (
			<Popup
				className="Popup-small-size"
				trigger={this.props.trigger}
				modal
				onOpen={() => this.getCompanies()}
			>
				{(close) => <div className="row">
					<div className="col-md-9">
						<h3>Select an entity</h3>
					</div>

					<div className={"col-md-3"}>
						<div className="top-right-buttons">
							<button
								className={"grey-background"}
								data-hover="Close"
								data-active=""
								onClick={close}>
								<span><i className="far fa-times-circle"/></span>
							</button>
						</div>
					</div>

					<div className="col-md-12 row-spaced">
						{this.state.companies !== null
							? <FormLine
								label={"Select entity"}
								type={"select"}
								fullWidth={true}
								value={this.state.selectedCompany}
								options={this.state.companies
									.map((v) => ({ label: v.name, value: v.id }))}
								onChange={(v) => this.changeState("selectedCompany", v)}
							/>
							: <Loading
								height={150}
							/>
						}
					</div>

					<div className="col-md-12">
						<div className="row">
							<div className="col-md-12 right-buttons">
								<button
									className={"blue-background"}
									onClick={() => this.onConfirmation(close)}
									disabled={!this.state.companies || !this.state.selectedCompany}>
									<i className="fas fa-check-circle"/> Confirm selection
								</button>
							</div>
						</div>
					</div>
				</div>}
			</Popup>
		);
	}
}
