import React from "react";
import "./PageNetwork.css";
import NetworkOverview from "./pagenetwork/NetworkOverview.jsx";
import NetworkEntities from "./pagenetwork/NetworkEntities.jsx";
import NetworkArticles from "./pagenetwork/NetworkArticles.jsx";
import NetworkTaxonomies from "./pagenetwork/NetworkTaxonomies.jsx";
import Tab from "./tab/Tab.jsx";
import { getUrlParameter } from "../utils/url.jsx";

export default class PageNetwork extends React.Component {
	constructor(props) {
		super(props);

		this.onMenuClick = this.onMenuClick.bind(this);

		this.state = {
			notifications: null,
			selectedMenu: null,
			tabs: [
				"overview",
				"entities",
				"articles",
				"taxonomies",
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
			<div id="PageNetwork" className="page max-sized-page">
				<Tab
					labels={["Overview", "Entities", "Articles", "Taxonomies"]}
					selectedMenu={this.state.selectedMenu}
					onMenuClick={this.onMenuClick}
					keys={this.state.tabs}
					content={[
						<NetworkOverview
							key={"overview"}
						/>,
						<NetworkEntities
							key={"entities"}
						/>,
						<NetworkArticles
							key={"articles"}
						/>,
						<NetworkTaxonomies
							key={"taxonomies"}
						/>,
					]}
				/>
			</div>
		);
	}
}
