import React from "react";
import "./CampaignGlobal.css";
import { NotificationManager as nm } from "react-notifications";
import { getRequest, postRequest } from "../../../utils/request.jsx";
import FormLine from "../../button/FormLine.jsx";
import Loading from "../../box/Loading.jsx";

export default class CampaignGlobal extends React.Component {
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
				this.props.refresh();
				nm.warning(response.statusText);
			}, (error) => {
				this.props.refresh();
				nm.error(error.message);
			});
		}
	}

	render() {
		if (!this.props.campaign) {
			return <Loading height={300} />;
		}

		return (
			<div id="CampaignGlobal" className={"row"}>
				<div className="col-md-12">
					<h2>Global</h2>
				</div>

				<div className="col-md-12">
					<FormLine
						label={"ID"}
						value={this.props.campaign.id}
						disabled={true}
					/>
					<FormLine
						label={"Name"}
						value={this.props.campaign.name}
						onBlur={(v) => this.updateCampaign("name", v)}
						disabled={this.props.campaign.status === "PROCESSED"}
					/>
					<FormLine
						label={"Status"}
						value={this.props.campaign.status}
						disabled={true}
					/>
					<FormLine
						label={"System date"}
						value={this.props.campaign.sys_date}
						disabled={true}
					/>
					<FormLine
						label={"Process date"}
						value={this.props.campaign.process_date}
						disabled={true}
					/>
				</div>
			</div>
		);
	}
}
