import React from "react";
import "./CampaignEditContent.css";
import FormLine from "../../button/FormLine.jsx";
import DialogImportCommunicationContent from "../../dialog/DialogImportCommunicationContent.jsx";

export default class CampaignEditContent extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			subject: null,
			body: null,
		};
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	render() {
		return (
			<div id="CampaignEditContent" className="max-sized-page fade-in">
				<div className={"row row-spaced"}>
					<div className="col-md-12">
						<div className="right-buttons">
							<DialogImportCommunicationContent
								onConfirmation={(subject, body) => this.setState({
									subject,
									body,
								})}
							/>
						</div>
					</div>

					<div className="col-md-12 row-spaced">
						<FormLine
							label={"Subject"}
							value={this.state.subject}
							onChange={(v) => this.changeState("subject", v)}
							fullWidth={"true"}
						/>
						<FormLine
							className={"CampaignEditContent-body-field"}
							label={"Body"}
							type={"editor"}
							value={this.state.body}
							onChange={(v) => this.changeState("body", v)}
							fullWidth={"true"}
						/>
					</div>

					<div className="col-md-12 row-spaced">
						<div className="right-buttons">
							<button
								onClick={this.sendDraft}
								disabled={!this.state.user}>
								<i className="fas fa-stethoscope"/>&nbsp;
								{this.state.user
									? "Send a draft to " + this.state.user.email
									: "Send a draft to myself"
								}
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
