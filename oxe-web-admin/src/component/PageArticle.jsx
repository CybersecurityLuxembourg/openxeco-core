import React from "react";
import "./PageArticle.css";
import Tab from "./tab/Tab.jsx";
import ArticleList from "./pagearticle/ArticleList.jsx";
import ArticleRssFeed from "./pagearticle/ArticleRssFeed.jsx";
import { getUrlParameter } from "../utils/url.jsx";

export default class PageArticle extends React.Component {
	constructor(props) {
		super(props);

		this.onMenuClick = this.onMenuClick.bind(this);

		this.state = {
			selectedMenu: null,
			tabs: [
				"articles",
				"rss_feed",
			],
		};
	}

	componentDidMount() {
		if (getUrlParameter("tab") && this.state.tabs.indexOf(getUrlParameter("tab")) >= 0) {
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
			<div id="PageArticle" className="page max-sized-page">
				<Tab
					labels={[
						"Articles",
						"Import from RSS Feeds",
					]}
					selectedMenu={this.state.selectedMenu}
					onMenuClick={this.onMenuClick}
					keys={this.state.tabs}
					content={[
						<ArticleList
							key={"articles"}
							{...this.props}
						/>,
						<ArticleRssFeed
							key={"rss_feed"}
						/>,
					]}
				/>
			</div>
		);
	}
}
