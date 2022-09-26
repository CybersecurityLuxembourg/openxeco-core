import React from "react";
import "./Campaign.css";
import Popup from "reactjs-popup";
import { NotificationManager as nm } from "react-notifications";
import { getRequest } from "../../utils/request.jsx";
import Item from "./Item.jsx";
import Tab from "../tab/Tab.jsx";
import CampaignGlobal from "./campaign/CampaignGlobal.jsx";
import CampaignBody from "./campaign/CampaignBody.jsx";
import CampaignAddresses from "./campaign/CampaignAddresses.jsx";
import CampaignSend from "./campaign/CampaignSend.jsx";

export default class Campaign extends Item {
	constructor(props) {
		super(props);

		this.state = {
			campaign: null,
			selectedMenu: null,
			tabs: [
				"global",
				"body",
				"addresses",
				"send",
			],
		};
	}

	fetchCampaign() {
		getRequest.call(this, "campaign/get_campaign/" + this.props.info.id, (data) => {
			this.setState({
				campaign: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	render() {
		return (
			<Popup
				className="Popup-full-size"
				trigger={
					<div className={"Item Campaign"}>
						<i className="fas fa-mail-bulk"/>
						<div className={"name"}>
							{this.props.info.name || "No name"}
						</div>
					</div>
				}
				modal
				closeOnDocumentClick={false}
				onOpen={() => this.fetchCampaign()}
			>
				{(close) => <div className="row">
					<div className={"col-md-9"}>
						<h1>
							<i className="fas fa-mail-bulk"/> {this.props.info.name || "No name"}
						</h1>
					</div>

					<div className={"col-md-3"}>
						<div className="right-buttons">
							<button
								className={"grey-background"}
								data-hover="Close"
								data-active=""
								onClick={close}>
								<span><i className="far fa-times-circle"/></span>
							</button>
						</div>
					</div>

					<div className="col-md-12">
						<Tab
							labels={["Global", "Body", "Addresses", "Verify and send"]}
							selectedMenu={this.state.selectedMenu}
							onMenuClick={this.onMenuClick}
							keys={this.state.tabs}
							content={[
								<CampaignGlobal
									key={this.props.id}
									id={this.props.id}
									campaign={this.state.campaign}
									refresh={() => this.fetchCampaign()}
								/>,
								<CampaignBody
									key={this.props.id}
									id={this.props.id}
									campaign={this.state.campaign}
									refresh={() => this.fetchCampaign()}
								/>,
								<CampaignAddresses
									key={this.props.id}
									id={this.props.id}
									campaign={this.state.campaign}
									refresh={() => this.fetchCampaign()}
								/>,
								<CampaignSend
									key={this.props.id}
									id={this.props.id}
									campaign={this.state.campaign}
									refresh={() => this.fetchCampaign()}
								/>,
							]}
						/>
					</div>
				</div>}
			</Popup>
		);
	}
}
