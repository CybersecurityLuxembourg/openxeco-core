import React from "react";
import "./DialogSendMail.css";
import Popup from "reactjs-popup";
import { NotificationManager as nm } from "react-notifications";
import FormLine from "../button/FormLine.jsx";
import { validateEmail } from "../../utils/re.jsx";
import { postRequest } from "../../utils/request.jsx";

export default class DialogSendMail extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			email: props.email ? props.email : null,
			subject: props.subject ? props.subject : null,
			content: props.content ? props.content : null,
			userAsCc: true,
		};
	}

	sendMail(close) {
		const params = {
			address: this.state.email,
			subject: this.state.subject,
			content: this.state.content.replaceAll("\n", "<br/>"),
			user_as_cc: this.state.userAsCc,
		};

		postRequest.call(this, "mail/send_mail", params, () => {
			nm.info("The email has been sent");
			close();
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	onOpen() {
		this.setState({
			subject: this.props.subject ? this.props.subject : null,
		});
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	render() {
		return (
			<Popup
				trigger={this.props.trigger}
				modal
				closeOnDocumentClick
				onOpen={() => this.onOpen()}
				className={"DialogSendMail"}
			>
				{(close) => (
					<div className={"row DialogSendMail-wrapper"}>
						<div className={"col-md-12"}>
							<h2>Send mail</h2>
						</div>

						<div className={"col-md-12"}>
							<FormLine
								label={"Recipient"}
								value={this.state.email}
								onChange={(v) => this.changeState("email", v)}
								format={validateEmail}
							/>
							<FormLine
								label={"Set my user address as CC"}
								type={"checkbox"}
								value={this.state.userAsCc}
								onChange={() => this.changeState("userAsCc", !this.state.userAsCc)}
							/>
							<FormLine
								label={"Subject"}
								value={this.state.subject}
								onChange={(s) => this.changeState("subject", s)}
							/>
							<FormLine
								label={"Mail content"}
								type={"textarea"}
								value={this.state.content}
								onChange={(v) => this.changeState("content", v)}
								fullWidth={true}
							/>
						</div>

						<div className={"col-md-12"}>
							<div className={"right-buttons"}>
								<button
									data-hover="Send mail"
									data-active=""
									onClick={() => this.sendMail(close)}
									disabled={!validateEmail(this.state.email)}>
									<span><i className="far fa-paper-plane"/> Send email</span>
								</button>
								<button
									className={"grey-background"}
									data-hover="Cancel"
									data-active=""
									onClick={close}>
									<span><i className="far fa-times-circle"/> Cancel</span>
								</button>
							</div>
						</div>
					</div>
				)}
			</Popup>
		);
	}
}
