import React from "react";
import "./PageForm.css";
import FormForms from "./pageform/FormForms.jsx";
import Tab from "./tab/Tab.jsx";
import { getUrlParameter } from "../utils/url.jsx";

export default class PageForm extends React.Component {
	constructor(props) {
		super(props);

		this.onMenuClick = this.onMenuClick.bind(this);

		this.state = {
			notifications: null,
			selectedMenu: null,
			tabs: [
				"forms",
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
			<div id="PageForm" className="page max-sized-page">
				<Tab
					labels={["Forms"]}
					selectedMenu={this.state.selectedMenu}
					onMenuClick={this.onMenuClick}
					keys={this.state.tabs}
					content={[
						<FormForms
							key={"forms"}
						/>,
					]}
				/>
			</div>
		);
	}
}
