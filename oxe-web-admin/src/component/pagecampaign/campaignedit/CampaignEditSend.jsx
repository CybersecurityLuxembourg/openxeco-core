import React from "react";
import "./CampaignEditSend.css";
import { NotificationManager as nm } from "react-notifications";
import Info from "../../box/Info.jsx";
import Warning from "../../box/Warning.jsx";
import { postRequest } from "../../../utils/request.jsx";
import DialogConfirmation from "../../dialog/DialogConfirmation.jsx";

export default class CampaignEditSend extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	sendDraft() {
		const params = {
			address: this.state.user.email,
			subject: this.state.subject,
			content: this.state.body,
		};

		postRequest.call(this, "mail/send_mail", params, () => {
			nm.info("The draft has been sent");
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	sendCommunication() {
		const params = {
			addresses: this.getSelectedAddresses(),
			subject: this.state.subject,
			body: this.state.body,
		};

		postRequest.call(this, "communication/send_communication", params, () => {
			nm.info("The communication has been sent");

			this.setState({
				...this.state.defaultState,
			});
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
			<div id="CampaignEditSend" className="max-sized-page fade-in">
				<div className={"row row-spaced"}>
					<div className="col-md-12">
						<Info
							content={"The recipients are set as BCC. So they won't be able to see each others."}
						/>

						{[].length === 0
							? <Warning
								content={"You cannot send the communication as "
									+ "you have not selected any address"}
							/>
							: <Info
								content={" email addresses selected"}
							/>
						}

						{(this.state.subject === null || this.state.subject.length === 0)
							&& <Warning
								content={"You cannot send the communication as the subject of the mail is empty"}
							/>
						}

						{(this.state.body === null || this.state.body.length === 0)
							&& <Warning
								content={"You cannot send the communication as the body of the mail is empty"}
							/>
						}
					</div>

					<div className="col-md-12 row-spaced">
						<div className="right-buttons">
							<DialogConfirmation
								text={"Are you sure you want to send the communication?"}
								trigger={
									<button
										disabled={
											this.getSelectedAddresses().length === 0
											|| this.state.subject === null
											|| this.state.subject.length === 0
											|| this.state.body === null
											|| this.state.body.length === 0
										}
									>
										<i className="fas fa-bullhorn"/> Send the communication...
									</button>
								}
								afterConfirmation={this.sendCommunication}
							/>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
