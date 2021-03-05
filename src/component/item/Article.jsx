import React, { Component } from "react";
import "./Article.css";
import Popup from "reactjs-popup";
import { NotificationManager as nm } from "react-notifications";
import { getRequest, postRequest } from "../../utils/request";
import FormLine from "../button/FormLine";
import Loading from "../box/Loading";
import DialogConfirmation from "../dialog/DialogConfirmation";
import Tab from "../tab/Tab";
import ArticleGlobal from "./article/ArticleGlobal";
import ArticleVersion from "./article/ArticleVersion";
import ArticleContent from "./article/ArticleContent";
import ArticleTag from "./article/ArticleTag";

export default class Article extends Component {
	constructor(props) {
		super(props);

		this.onClick = this.onClick.bind(this);
		this.onClose = this.onClose.bind(this);
		this.onOpen = this.onOpen.bind(this);
		this.confirmDeletion = this.confirmDeletion.bind(this);

		this.state = {
			isDetailOpened: false,
		};
	}

	onClick() {
		if (typeof this.props.disabled !== "undefined" || !this.props.disabled) {
			this.onOpen();

			const newState = !this.props.selected;
			if (typeof this.props.onClick !== "undefined") this.props.onClick(this.props.id, newState);
		}
	}

	onClose() {
		this.setState({ isDetailOpened: false }, () => {
			if (this.props.onClose !== undefined) this.props.onClose();
		});
	}

	onOpen() {
		this.setState({ isDetailOpened: true }, () => {
			if (this.props.onOpen !== undefined) this.props.onOpen();
		});
	}

	confirmDeletion() {
		const params = {
			id: this.props.id,
		};

		postRequest.call(this, "article/delete_article", params, (response) => {
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
				closeOnDocumentClick
				onClose={this.onClose}
				onOpen={this.onOpen}
				open={this.props.open || this.state.isDetailOpened}
			>
				<div className="Article-content row row-spaced">
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
						</div>
						<h1 className="Article-title">
							{this.props.name}
						</h1>

						<Tab
							menu={["Global", "Version", "Content", "Tag"]}
							content={[
								<ArticleGlobal
									id={this.props.id}
								/>,
								<ArticleVersion
									id={this.props.id}
								/>,
								<ArticleContent
									id={this.props.id}
								/>,
								<ArticleTag
									id={this.props.id}
								/>]}
						/>
					</div>
				</div>
			</Popup>
		);
	}
}
