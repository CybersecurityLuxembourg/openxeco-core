import React from "react";
import "./CampaignEdit.css";
import { NotificationManager as nm } from "react-notifications";
import FormLine from "../button/FormLine.jsx";
import Loading from "../box/Loading.jsx";
import TabStep from "../tab/TabStep.jsx";
import { getRequest } from "../../utils/request.jsx";
import CampaignEditContent from "./campaignedit/CampaignEditContent.jsx";
import CampaignEditAddress from "./campaignedit/CampaignEditAddress.jsx";
import CampaignEditSend from "./campaignedit/CampaignEditSend.jsx";

export default class CampaignEdit extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			activeCampaigns: null,

			campaign: null,
			campaignAddresses: null,

			selectedMenu: null,
			tabs: [
				"content",
				"address",
				"send",
			],
		};
	}

	componentDidMount() {
		this.refresh();
	}

	refresh() {
		this.getActiveCampaigns();
	}

	getActiveCampaigns() {
		this.setState({ activeCampaigns: null }, () => {
			getRequest.call(this, "campaign/get_campaigns?status=ACTIVE", (data) => {
				this.setState({
					activeCampaigns: data,
				});
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		});
	}

	getCampaignAddresses() {
		this.setState({ campaignAddresses: null }, () => {
			getRequest.call(this, "campaign/get_campaign_addresses?id=42", (data) => {
				this.setState({
					campaignAddresses: data,
				});
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		});
	}

	onCampaignChange(campaignId) {
		this.setState({
			campaign: this.state.activeCampaigns
				.filter((c) => c.id === campaignId)
				.pop(),
		});
	}

	render() {
		return (
			<div id="CampaignEdit" className="max-sized-page fade-in">
				<div className={"row row-spaced"}>
					<div className="col-md-12">
						<h1>Edit campaign</h1>
					</div>

					<div className="col-md-12 row-spaced">
						{this.state.activeCampaigns
							? <FormLine
								label={"Campaign to edit"}
								type={"select"}
								options={this.state.activeCampaigns.map((c) => ({
									value: c.id,
									label: c.title,
								}))}
								value={this.state.selectedCampaign}
								onChange={(v) => this.onCampaignChange(v)}
							/>
							: <Loading
								height={150}
							/>
						}
					</div>

					<div className="col-md-12 row-spaced">
						{this.state.campaign
							&& <div className="col-md-12">
								<TabStep
									labels={[
										"Content",
										"Target",
										"Review and send",
									]}
									selectedMenu={this.state.selectedMenu}
									keys={this.state.tabs}
									content={[
										<CampaignEditContent
											key={this.state.tabs[0]}
										/>,
										<CampaignEditAddress
											key={this.state.tabs[1]}
										/>,
										<CampaignEditSend
											key={this.state.tabs[2]}
										/>,
									]}
								/>
							</div>
						}
					</div>
				</div>
			</div>
		);
	}
}
