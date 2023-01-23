import React from "react";
import "./CampaignBody.css";
import { NotificationManager as nm } from "react-notifications";
import { getRequest, postRequest } from "../../../utils/request.jsx";
import FormLine from "../../button/FormLine.jsx";
import Loading from "../../box/Loading.jsx";
import DialogCampaignBodyEditor from "./DialogCampaignBodyEditor.jsx";

export default class CampaignBody extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			templates: null,
		};
	}

	componentDidMount() {
		this.fetchTemplates();
	}

	fetchTemplates() {
		getRequest.call(this, "campaign/get_campaign_templates", (data) => {
			this.setState({
				templates: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	updateCampaign(prop, value) {
		if (this.props.campaign[prop] !== value) {
			const params = {
				id: this.props.campaign.id,
				[prop]: value,
			};

			postRequest.call(this, "campaign/update_campaign", params, () => {
				this.props.refresh();
				nm.info("The property has been updated");
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		}
	}

	render() {
		if (!this.state.templates || !this.props.campaign) {
			return <Loading height={300} />;
		}

		return (
			<div id="CampaignBody" className={"row"}>
				<div className="col-md-12">
					<h2>Body</h2>
				</div>

				<div className="col-md-12">
					<FormLine
						label={"Subject"}
						value={this.props.campaign.subject}
						onBlur={(v) => this.updateCampaign("subject", v)}
						disabled={this.props.campaign.status === "PROCESSED"}
					/>
					<FormLine
						type={"select"}
						label={"Template"}
						value={this.props.campaign.template_id}
						options={this.state.templates.map((o) => ({ label: o.name || "No name", value: o.id }))}
						onChange={(v) => this.updateCampaign("template_id", v)}
						disabled={this.props.campaign.status === "PROCESSED"}
					/>
					<div className={"FormLine"}>
						<div className={"row"}>
							<div className={"col-md-6"}>
								<div className={"FormLine-label"}>
									Body
								</div>
							</div>
							<div className={"col-md-6"}>
								<DialogCampaignBodyEditor
									trigger={
										<button
											className={"blue-background full-size"}
										>
											<i className="far fa-edit"/> Open editor
										</button>
									}
									campaign={this.props.campaign}
									updateCampaign={(p, v) => this.updateCampaign(p, v)}
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
