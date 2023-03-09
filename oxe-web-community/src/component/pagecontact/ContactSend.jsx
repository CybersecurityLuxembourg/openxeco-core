import React from "react";
import "./ContactSend.css";
import { NotificationManager as nm } from "react-notifications";
import { postRequest } from "../../utils/request.jsx";
import FormLine from "../form/FormLine.jsx";
import Message from "../box/Message.jsx";

export default class ContactSend extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			text: null,
		};
	}

	submitRequest() {
		const params = {
			request: this.state.text,
		};

		postRequest.call(this, "private/add_request", params, () => {
			this.setState({
				text: null,
			});
			this.props.getNotifications();
			nm.info("The request has been submitted");
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
			<div id={"ContactSend"} className={"max-sized-page"}>
				<div className={"row row-spaced"}>
					<div className="col-md-12">
						<h2>Send a message</h2>

						<FormLine
							label={"Message"}
							type={"textarea"}
							fullWidth={true}
							value={this.state.text}
							onChange={(v) => this.setState({ text: v })}
						/>

						<div className="right-buttons">
							<button
								onClick={() => this.submitRequest()}
								disabled={this.state.text === null || this.state.text.length === 0}>
								<i className="fas fa-paper-plane"/> Submit message
							</button>
						</div>
					</div>
				</div>

				<div className={"ContactSend-details row row-spaced"}>
					{this.props.settings && this.props.settings.EMAIL_ADDRESS
						&& <div className="col-lg-6 col-xl-4">
							<h2>Email</h2>

							<Message
								text={<div>
									<i className="fas fa-at"/>
									<br/>{this.props.settings.EMAIL_ADDRESS}
								</div>}
								height={150}
							/>
						</div>
					}

					{this.props.settings && this.props.settings.POSTAL_ADDRESS
						&& <div className="col-lg-6 col-xl-4">
							<h2>Postal address</h2>

							<Message
								text={<div>
									<i className="fas fa-envelope-open-text"/>
									<br/>{this.props.settings.POSTAL_ADDRESS}
								</div>}
								height={150}
							/>
						</div>
					}

					{this.props.settings && this.props.settings.PHONE_NUMBER
						&& <div className="col-lg-6 col-xl-4">
							<h2>Phone</h2>

							<Message
								text={<div>
									<i className="fas fa-phone"/>
									<br/>{this.props.settings.PHONE_NUMBER}
								</div>}
								height={150}
							/>
						</div>
					}
				</div>
			</div>
		);
	}
}
