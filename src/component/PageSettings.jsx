import React from "react";
import "./PageSettings.css";
import SettingMail from "./pagesettings/SettingMail";
import SettingTaxonomy from "./pagesettings/SettingTaxonomy";
import Tab from "./tab/Tab";

export default class PageSettings extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			selectedMenu: "company_values",
		};
	}

	render() {
		return (
			<div id="PageSettings" className="page max-sized-page">
				<Tab
					menu={["Taxonomy", "Mail"]}
					content={[<SettingTaxonomy/>, <SettingMail/>]}
				/>
			</div>
		);
	}
}
