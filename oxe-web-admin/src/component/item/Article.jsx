import React, { Component } from "react";
import "./Article.css";
import Popup from "reactjs-popup";
import { NotificationManager as nm } from "react-notifications";
import { postRequest } from "../../utils/request.jsx";
import DialogConfirmation from "../dialog/DialogConfirmation.jsx";
import Tab from "../tab/Tab.jsx";
import ArticleGlobal from "./article/ArticleGlobal.jsx";
import ArticleVersion from "./article/ArticleVersion.jsx";
import ArticleContent from "./article/ArticleContent.jsx";
import ArticleTag from "./article/ArticleTag.jsx";
import { getUrlParameter } from "../../utils/url.jsx";

export default class Article extends Component {
	constructor(props) {
		super(props);

		this.confirmDeletion = this.confirmDeletion.bind(this);

		this.state = {
			selectedMenu: null,
			tabs: [
				"global",
				"version",
				"content",
				"tag",
			],
		};
	}

	componentDidMount() {
		if (getUrlParameter("item_tab") !== null && this.state.tabs.indexOf(getUrlParameter("item_tab")) >= 0) {
			this.setState({ selectedMenu: getUrlParameter("item_tab") });
		}
	}

	componentDidUpdate() {
		if (this.state.selectedMenu !== getUrlParameter("item_tab")
			&& this.state.tabs.indexOf(getUrlParameter("item_tab")) >= 0) {
			this.setState({ selectedMenu: getUrlParameter("item_tab") });
		}
	}

	onClick() {
		if (typeof this.props.disabled !== "undefined" || !this.props.disabled) {
			this.onOpen();

			const newState = !this.props.selected;
			if (typeof this.props.onClick !== "undefined") this.props.onClick(this.props.id, newState);
		}
	}

	confirmDeletion() {
		const params = {
			id: this.props.id,
		};

		postRequest.call(this, "article/delete_article", params, () => {
			document.elementFromPoint(100, 0).click();
			nm.info("The article has been deleted");

			if (typeof this.props.afterDeletion !== "undefined") this.props.afterDeletion();
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	render() {
		return (
			<Popup
				className="Popup-full-size"
				trigger={
					<div className={"Article"}>
						<i className="fas fa-feather-alt"/>
						<div className={"Article-name"}>
							{this.props.name}
						</div>
					</div>
				}
				modal
				closeOnDocumentClick={false}
			>
				{(close) => <div className="Article-content row row-spaced">
					<div className="col-md-12">
						<div className={"top-right-buttons"}>
							<DialogConfirmation
								text={"Are you sure you want to delete this article?"}
								trigger={
									<button
										className={"red-background"}>
										<i className="fas fa-trash-alt"/>
									</button>
								}
								afterConfirmation={() => this.confirmDeletion()}
							/>
							<button
								className={"grey-background"}
								data-hover="Close"
								data-active=""
								onClick={close}>
								<span><i className="far fa-times-circle"/></span>
							</button>
						</div>
						<h1 className="Article-title">
							{this.props.name}
						</h1>

						<Tab
							labels={["Global", "Version", "Content", "Tag"]}
							selectedMenu={this.state.selectedMenu}
							onMenuClick={this.onMenuClick}
							keys={this.state.tabs}
							content={[
								<ArticleGlobal
									key={this.props.id}
									id={this.props.id}
								/>,
								<ArticleVersion
									key={this.props.id}
									id={this.props.id}
								/>,
								<ArticleContent
									key={this.props.id}
									id={this.props.id}
								/>,
								<ArticleTag
									key={this.props.id}
									id={this.props.id}
								/>]}
						/>
					</div>
				</div>
				}
			</Popup>
		);
	}
}
