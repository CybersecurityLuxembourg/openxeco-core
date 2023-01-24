import React from "react";
import "./DialogLegalAndUsage.css";
import Popup from "reactjs-popup";
import { NotificationManager as nm } from "react-notifications";
import FormLine from "../form/FormLine.jsx";
import { postRequest } from "../../utils/request.jsx";
import { getApiURL } from "../../utils/env.jsx";

export default class DialogLegalAndUsage extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			termsCheckbox: props.user.accept_terms_and_conditions === 1,
			policyCheckbox: props.user.accept_privacy_policy === 1,
		};
	}

	updateMyUser() {
		const params = {
			accept_terms_and_conditions: this.props.settings.ACTIVATE_TERMS_AND_CONDITIONS === "TRUE"
				? this.state.termsCheckbox : undefined,
			accept_privacy_policy: this.props.settings.ACTIVATE_PRIVACY_POLICY === "TRUE"
				? this.state.policyCheckbox : undefined,
		};

		postRequest.call(this, "private/update_my_user", params, () => {
			nm.info("The user has been updated");

			if (this.props.onValidate) {
				this.props.onValidate();
			}
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	render() {
		return (
			<Popup
				trigger={""}
				modal
				className={"DialogLegalAndUsage"}
				open={this.props.open}
			>
				{() => (
					<div className={"row DialogLegalAndUsage-wrapper"}>
						<div className={"col-md-12 row-spaced"}>
							<h2><i className="fas fa-gavel"/> Legal and usage</h2>
						</div>

						{this.props.settings.ACTIVATE_TERMS_AND_CONDITIONS === "TRUE"
							&& <div className={"col-md-12"}>
								<FormLine
									type={"checkbox"}
									label={"I accept the terms and conditions"}
									value={this.state.termsCheckbox}
									onChange={(v) => this.changeState("termsCheckbox", v)}
								/>
								<div className={"row"}>
									<div className={"offset-md-6 col-md-6"}>
										<div className={"DialogLegalAndUsage-document-link"}>
											<a
												href={getApiURL() + "public/get_public_document/" + this.props.settings.TERMS_AND_CONDITIONS_DOCUMENT}
												target="_blank"
												rel="noreferrer">
												<i className="fas fa-file-alt"/> Open the terms and conditions
											</a>
										</div>
									</div>
								</div>
							</div>
						}
						{this.props.settings.ACTIVATE_PRIVACY_POLICY === "TRUE"
							&& <div className={"col-md-12 row-spaced"}>
								<FormLine
									type={"checkbox"}
									label={"I accept the privacy policy"}
									value={this.state.policyCheckbox}
									onChange={(v) => this.changeState("policyCheckbox", v)}
								/>
								<div className={"row"}>
									<div className={"offset-md-6 col-md-6"}>
										<div className={"DialogLegalAndUsage-document-link"}>
											<a
												href={getApiURL() + "public/get_public_document/" + this.props.settings.PRIVACY_POLICY_DOCUMENT}
												target="_blank"
												rel="noreferrer">
												<i className="fas fa-file-alt"/> Open the privacy policy
											</a>
										</div>
									</div>
								</div>
							</div>
						}

						<div className={"col-md-12"}>
							<div className={"right-buttons"}>
								<button
									onClick={() => this.updateMyUser()}
									disabled={(this.props.settings.ACTIVATE_TERMS_AND_CONDITIONS === "TRUE" && !this.state.termsCheckbox)
										|| (this.props.settings.ACTIVATE_PRIVACY_POLICY === "TRUE" && !this.state.policyCheckbox)}>
									<span><i className="fas fa-check"/> Validate my choice</span>
								</button>
							</div>
						</div>
					</div>
				)}
			</Popup>
		);
	}
}
