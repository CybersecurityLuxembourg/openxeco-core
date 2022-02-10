import React from "react";
import "./PageSettings.css";
import SettingGlobal from "./pagesettings/SettingGlobal.jsx";
import SettingLogo from "./pagesettings/SettingLogo.jsx";
import SettingMail from "./pagesettings/SettingMail.jsx";
import SettingCron from "./pagesettings/SettingCron.jsx";
import Tab from "./tab/Tab.jsx";
import { getUrlParameter } from "../utils/url.jsx";

export default class PageSettings extends React.Component {
	constructor(props) {
		super(props);

		this.onMenuClick = this.onMenuClick.bind(this);

		this.state = {
			selectedMenu: null,
			tabs: [
				"global",
				"logo",
				"mail",
				"scheduled_task",
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

	// eslint-disable-next-line class-methods-use-this
	render() {
		return (
			<div id="PageSettings" className="page max-sized-page">
				<Tab
					labels={["Global", "Logo", "Mail", "Scheduled task"]}
					selectedMenu={this.state.selectedMenu}
					onMenuClick={this.onMenuClick}
					keys={this.state.tabs}
					content={[
						<SettingGlobal
							key={"global"}
							settings={this.props.settings}
							refreshSettings={this.props.refreshSettings}
						/>,
						<SettingLogo
							key={"logo"}
						/>,
						<SettingMail
							key={"mail"}
						/>,
						<SettingCron
							key={"cron"}
						/>,
					]}
				/>
			</div>
		);
	}
}
