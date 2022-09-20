import React from "react";
import "./PageArticle.css";
import Tab from "./tab/Tab.jsx";
import CampaignEdit from "./pagecampaign/CampaignEdit.jsx";
import CampaignList from "./pagecampaign/CampaignList.jsx";
import { getUrlParameter } from "../utils/url.jsx";

export default class PageCampaign extends React.Component {
	constructor(props) {
		super(props);

		this.onMenuClick = this.onMenuClick.bind(this);

		this.state = {
			selectedMenu: null,
			tabs: [
				"list",
				"edit",
			],
		};
	}

	componentDidMount() {
		if (getUrlParameter("tab") !== null && this.state.tabs.indexOf(getUrlParameter("tab")) >= 0) {
			this.setState({ selectedMenu: getUrlParameter("tab") });
		}
	}

	componentDidUpdate() {
		if (this.state.selectedMenu !== getUrlParameter("tab")
			&& this.state.tabs.indexOf(getUrlParameter("tab")) >= 0) {
			this.setState({ selectedMenu: getUrlParameter("tab") });
		}
	}

	onMenuClick(m) {
		this.props.history.push("?tab=" + m);
	}

	render() {
		return (
			<div id="PageCampaign" className="page max-sized-page">
				<Tab
					labels={[
						"Campaigns",
						"Edit campaign",
					]}
					selectedMenu={this.state.selectedMenu}
					onMenuClick={this.onMenuClick}
					keys={this.state.tabs}
					content={[
						<CampaignList
							key={this.state.tabs[0]}
						/>,
						<CampaignEdit
							key={this.state.tabs[1]}
						/>,
					]}
				/>
			</div>
		);
	}
}
