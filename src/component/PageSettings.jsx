import React from "react";
import "./PageSettings.css";
import SettingMail from "./pagesettings/SettingMail.jsx";
import SettingTaxonomy from "./pagesettings/SettingTaxonomy.jsx";
import SettingCron from "./pagesettings/SettingCron.jsx";
import Tab from "./tab/Tab.jsx";

export default class PageSettings extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			selectedMenu: "company_values",
		};
	}

	// eslint-disable-next-line class-methods-use-this
	render() {
		return (
			<div id="PageSettings" className="page max-sized-page">
				<Tab
					menu={["Scheduled task", "Taxonomy", "Mail"]}
					content={[
						<SettingCron
							key={"cron"}
						/>,
						<SettingTaxonomy
							key={"taxonomy"}
						/>,
						<SettingMail
							key={"mail"}
						/>,
					]}
				/>
			</div>
		);
	}
}
