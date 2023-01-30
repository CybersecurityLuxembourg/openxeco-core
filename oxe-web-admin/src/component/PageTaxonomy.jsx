import React from "react";
import "./PageTaxonomy.css";
import TaxonomyTaxonomies from "./pagetaxonomy/TaxonomyTaxonomies.jsx";
import Tab from "./tab/Tab.jsx";
import { getUrlParameter } from "../utils/url.jsx";

export default class PageTaxonomy extends React.Component {
	constructor(props) {
		super(props);

		this.onMenuClick = this.onMenuClick.bind(this);

		this.state = {
			notifications: null,
			selectedMenu: null,
			tabs: [
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
			<div id="PageTaxonomy" className="page max-sized-page">
				<Tab
					labels={["Taxonomies"]}
					selectedMenu={this.state.selectedMenu}
					onMenuClick={this.onMenuClick}
					keys={this.state.tabs}
					content={[
						<TaxonomyTaxonomies
							key={"taxonomies"}
							user={this.props.user}
						/>,
					]}
				/>
			</div>
		);
	}
}
