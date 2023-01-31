import React from "react";
import "./CampaignSend.css";
import { NotificationManager as nm } from "react-notifications";
import { getRequest, postRequest } from "../../../utils/request.jsx";
import Loading from "../../box/Loading.jsx";
import Warning from "../../box/Warning.jsx";
import Info from "../../box/Info.jsx";
import DialogConfirmation from "../../dialog/DialogConfirmation.jsx";

export default class CampaignSend extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			addresses: null,
			user: null,
			template: null,
		};
	}

	componentDidMount() {
		this.fetchAddresses();
		this.getMyUser();
		this.getTemplate();
	}

	componentDidUpdate(prevProps) {
		if (prevProps.campaign !== this.props.campaign) {
			this.getTemplate();
		}
	}

	fetchAddresses() {
		getRequest.call(this, "campaign/get_campaign_addresses?campaign_id=" + this.props.campaign.id, (data) => {
			this.setState({
				addresses: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	getMyUser() {
		getRequest.call(this, "private/get_my_user", (data) => {
			this.setState({
				user: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	getTemplate() {
		if (this.props.campaign) {
			getRequest.call(this, "campaign/get_campaign_template/" + this.props.campaign.id, (data) => {
				this.setState({
					template: data,
				});
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		}
	}

	sendDraft() {
		let content = null;

		if (!this.props.campaign.template_id) {
			content = this.props.campaign.body;
		} else {
			if (!this.state.template) {
				nm.warning("Cannot send the draft as the template is not loaded");
				return;
			}
			if (!this.state.template.content) {
				nm.warning("Cannot send the draft as the template has no content");
				return;
			}

			content = this.state.template.content
				.replace("[CAMPAIGN CONTENT]", this.props.campaign.body);
		}

		const params = {
			address: this.state.user.email,
			subject: this.props.campaign.subject,
			content,
		};

		postRequest.call(this, "mail/send_mail", params, () => {
			nm.info("The draft has been sent");
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	sendCampaign() {
		const params = {
			id: this.props.campaign.id,
		};

		postRequest.call(this, "campaign/send_campaign", params, () => {
			nm.info("The campaign has been sent");
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	render() {
		if (!this.props.campaign || !this.state.addresses) {
			return <Loading height={300} />;
		}

		return (
			<div id="CampaignSend" >
				<div className={"row"}>
					<div className="col-md-12">
						<h2>Verify and send</h2>
					</div>

					<div className="col-md-12">
						<Info
							content={"The recipients are set as BCC. So they won't be able to see each others."}
						/>

						{!this.props.campaign.template_id
							&& <Info
								content={"No campaign template selected"}
							/>
						}

						{this.props.campaign.template_id && this.state.template
							&& <Info
								content={"Selected template: " + this.state.template.name}
							/>
						}

						{this.state.addresses.length === 0
							? <Warning
								content={"You cannot send the communication as "
									+ "you have not selected any address"}
							/>
							: <Info
								content={this.state.addresses.length + " email addresses selected"}
							/>
						}

						{(this.props.campaign.subject === null || this.props.campaign.subject.length === 0)
							&& <Warning
								content={"You cannot send the communication as the subject of the mail is empty"}
							/>
						}

						{(this.props.campaign.body === null || this.props.campaign.body.length === 0)
							&& <Warning
								content={"You cannot send the communication as the body of the mail is empty"}
							/>
						}

						{this.props.campaign.template_id && !this.state.template
							&& <Warning
								content={"The template has not been loaded successfully"}
							/>
						}

						{this.props.campaign.template_id && this.state.template
							&& !this.state.template.content
							&& <Warning
								content={"The content of the template is empty"}
							/>
						}

						{this.props.campaign.template_id && this.state.template
							&& this.state.template.content
							&& !this.state.template.content.includes("[CAMPAIGN CONTENT]")
							&& <Warning
								content={"The template does not contain '[CAMPAIGN CONTENT]'"}
							/>
						}
					</div>

					<div className="col-md-12 row-spaced">
						<div className="right-buttons">
							<button
								onClick={() => this.sendDraft()}
								disabled={!this.state.user}>
								<i className="fas fa-stethoscope"/>&nbsp;
								{this.state.user
									? "Send a draft to " + this.state.user.email
									: "Send a draft to myself"
								}
							</button>
							<DialogConfirmation
								text={"Are you sure you want to send the communication?"}
								trigger={
									<button
										disabled={
											this.state.addresses.length === 0
											|| this.props.campaign.subject === null
											|| this.props.campaign.subject.length === 0
											|| this.props.campaign.body === null
											|| this.props.campaign.body.length === 0
										}
									>
										<i className="far fa-paper-plane"/> Send the communication...
									</button>
								}
								afterConfirmation={() => this.sendCampaign()}
							/>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
