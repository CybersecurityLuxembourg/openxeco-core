import React from "react";
import "./PageArticle.css";
import Tab from "./tab/Tab.jsx";
import ArticleList from "./pagearticle/ArticleList.jsx";
import ArticleRssFeed from "./pagearticle/ArticleRssFeed.jsx";

export default class PageArticle extends React.Component {
	// eslint-disable-next-line class-methods-use-this
	render() {
		return (
			<div id="PageArticle" className="page max-sized-page">
				<Tab
					menu={[
						"Articles",
						"Import from RSS Feeds",
					]}
					content={[
						<ArticleList
							key={"task"}
							{...this.props}
						/>,
						<ArticleRssFeed
							key={"article"}
						/>,
					]}
				/>
			</div>
		);
	}
}
