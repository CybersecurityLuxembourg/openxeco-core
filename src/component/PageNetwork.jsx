import React from "react";
import "./PageNetwork.css";
import NetworkOverview from "./pagenetwork/NetworkOverview.jsx";
import NetworkEntities from "./pagenetwork/NetworkEntities.jsx";
import NetworkArticles from "./pagenetwork/NetworkArticles.jsx";
import NetworkTaxonomies from "./pagenetwork/NetworkTaxonomies.jsx";
import Tab from "./tab/Tab.jsx";

export default class PageNetwork extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	// eslint-disable-next-line class-methods-use-this
	render() {
		return (
			<div id="PageNetwork" className="page max-sized-page">
				<Tab
					menu={["Overview", "Entities", "Articles", "Taxonomies"]}
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
