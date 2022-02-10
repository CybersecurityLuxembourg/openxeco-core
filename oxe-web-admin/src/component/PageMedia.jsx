import React from "react";
import "./PageMedia.css";
import MediaImage from "./pagemedia/MediaImage.jsx";
import MediaDocument from "./pagemedia/MediaDocument.jsx";
import Tab from "./tab/Tab.jsx";
import { getUrlParameter } from "../utils/url.jsx";

export default class PageMedia extends React.Component {
	constructor(props) {
		super(props);

		this.onMenuClick = this.onMenuClick.bind(this);

		this.state = {
			notifications: null,
			selectedMenu: null,
			tabs: [
				"image",
				"document",
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
			<div id="PageMedia" className="page max-sized-page">
				<Tab
					labels={["Images", "Documents"]}
					selectedMenu={this.state.selectedMenu}
					onMenuClick={this.onMenuClick}
					keys={this.state.tabs}
					content={[
						<MediaImage
							key={"image"}
						/>,
						<MediaDocument
							key={"document"}
						/>,
					]}
				/>
			</div>
		);
	}
}
