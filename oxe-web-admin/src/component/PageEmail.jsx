import React from "react";
import "./PageArticle.css";
import Tab from "./tab/Tab.jsx";
import EmailSend from "./pageemail/EmailSend.jsx";
import EmailHistory from "./pageemail/EmailHistory.jsx";
import { getUrlParameter } from "../utils/url.jsx";

export default class PageEmail extends React.Component {
	constructor(props) {
		super(props);

		this.onMenuClick = this.onMenuClick.bind(this);

		this.state = {
			selectedMenu: null,
			tabs: [
				"communication",
				"history",
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
			<div id="PageEmail" className="page max-sized-page">
				<Tab
					labels={[
						"Send a communication",
						"History",
					]}
					selectedMenu={this.state.selectedMenu}
					onMenuClick={this.onMenuClick}
					keys={this.state.tabs}
					content={[
						<EmailSend
							key={"send"}
						/>,
						<EmailHistory
							key={"history"}
						/>,
					]}
				/>
			</div>
		);
	}
}
