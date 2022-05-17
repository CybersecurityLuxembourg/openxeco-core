import React from "react";
import "./DialogArticleEditor.css";
import Popup from "reactjs-popup";
import { NotificationManager as nm } from "react-notifications";
import { getRequest, postRequest } from "../../utils/request.jsx";
import { getArticleStatus } from "../../utils/article.jsx";
import EditMetadata from "./DialogArticleEditor/EditMetadata.jsx";
import EditImage from "./DialogArticleEditor/EditImage.jsx";
import EditContent from "./DialogArticleEditor/EditContent.jsx";
import Loading from "../box/Loading.jsx";
import ArticleStatus from "../item/ArticleStatus.jsx";
import DialogConfirmation from "./DialogConfirmation.jsx";

export default class DialogArticleEditor extends React.Component {
	constructor(props) {
		super(props);

		this.onOpen = this.onOpen.bind(this);
		this.onClose = this.onClose.bind(this);
		this.getArticleInfo = this.getArticleInfo.bind(this);
		this.getArticleEnums = this.getArticleEnums.bind(this);
		this.saveArticleValue = this.saveArticleValue.bind(this);
		this.deleteArticle = this.deleteArticle.bind(this);
		this.changeState = this.changeState.bind(this);

		this.state = {
			article: null,
			articleEnums: null,
			selectedMenu: "metadata",
		};
	}

	onOpen() {
		window.addEventListener("resize", this.resizeBoxes);
		this.getArticleInfo();
		this.getArticleEnums();
	}

	onClose() {
		if (this.props.onClose) {
			this.props.onClose();
		}
	}

	getArticleInfo(refresh) {
		if (refresh !== false) {
			this.setState({
				article: null,
			});
		}

		getRequest.call(this, "private/get_my_article/" + this.props.article.id, (data) => {
			this.setState({
				article: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	getArticleEnums() {
		this.setState({
			articleEnums: null,
		});

		getRequest.call(this, "public/get_public_article_enums", (data) => {
			this.setState({
				articleEnums: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	saveArticleValue(prop, value, customizedMessage) {
		if (this.state.article[prop] !== value || customizedMessage !== undefined) {
			const params = {
				id: this.state.article.id,
				[prop]: value,
			};

			postRequest.call(this, "private/update_my_article", params, () => {
				this.getArticleInfo(false);
				if (customizedMessage === undefined) {
					nm.info("The property has been updated");
				} else {
					nm.info(customizedMessage);
				}
			}, (response) => {
				this.getArticleInfo();
				nm.warning(response.statusText);
			}, (error) => {
				this.getArticleInfo();
				nm.error(error.message);
			});
		}
	}

	deleteArticle(close) {
		const params = {
			id: this.props.article.id,
		};

		postRequest.call(this, "private/delete_my_article", params, () => {
			if (this.props.afterDelete !== undefined) {
				this.props.afterDelete();
			}
			close();
			nm.info("The article has been deleted");
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	render() {
		return (
			<Popup
				trigger={this.props.trigger}
				modal
				closeOnDocumentClick
				className={"DialogArticleEditor"}
				onOpen={this.onOpen}
				onClose={this.onClose}
			>
				{(close) => (
					<div className={"row"}>
						<div className={"col-md-8 DialogArticleEditor-top-bar"}>
							<h2>
								Editing an article:
								&#34;{this.state.article !== null ? this.state.article.title : ""}&#34;
							</h2>
						</div>

						<div className={"col-md-4 DialogArticleEditor-top-menu"}>
							<button
								className={"blue-background"}
								data-hover="Close"
								data-active=""
								onClick={this.getArticleInfo}>
								<span><i className="fas fa-sync-alt"/></span>
							</button>
							<button
								className={"grey-background"}
								data-hover="Close"
								data-active=""
								onClick={close}>
								<span><i className="far fa-times-circle"/></span>
							</button>
						</div>

						<div className="col-md-2 DialogArticleEditor-menu-wrapper">
							<div className="DialogArticleEditor-menu">
								<ArticleStatus
									status={getArticleStatus(this.state.article)}
								/>

								<h3>Tabs</h3>

								<button
									className={"link-button "
										+ (this.state.selectedMenu === "metadata" && "selected-link-button")}
									data-active=""
									onClick={() => this.setState({ selectedMenu: "metadata" })}>
									<i className="fas fa-heading"/> Edit metadata
								</button>
								<button
									className={"link-button "
										+ (this.state.selectedMenu === "image" && "selected-link-button")}
									data-active=""
									onClick={() => this.setState({ selectedMenu: "image" })}>
									<i className="fas fa-image"/> Edit image
								</button>
								<button
									className={"link-button "
										+ (this.state.selectedMenu === "body" && "selected-link-button")}
									data-active=""
									onClick={() => this.setState({ selectedMenu: "body" })}>
									{this.props.settings.ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE_CONTENT !== undefined
										&& this.props.settings.ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE_CONTENT === "TRUE"
										? <div><i className="fas fa-align-left"/> Edit body</div>
										: <div><i className="fas fa-directions"/> Edit redirection</div>
									}
								</button>

								<h3>Action</h3>

								<DialogConfirmation
									text={"Are you sure you want to delete this article?"}
									trigger={
										<button
											className="red-button">
											<i className="far fa-trash-alt"/> Delete article...
										</button>
									}
									afterConfirmation={() => this.deleteArticle(close)}
								/>
							</div>
						</div>

						{this.state.article !== null
							? <div className="col-md-10 DialogArticleEditor-body">
								{this.state.selectedMenu === "body"
									&& <EditContent
										article={this.state.article}
										saveArticleValue={this.saveArticleValue}
										settings={this.props.settings}
									/>
								}

								{this.state.selectedMenu === "image"
									&& <EditImage
										article={this.state.article}
										refreshArticle={this.getArticleInfo}
									/>
								}

								{this.state.selectedMenu === "metadata"
									&& <EditMetadata
										article={this.state.article}
										articleEnums={this.state.articleEnums}
										saveArticleValue={this.saveArticleValue}
										settings={this.props.settings}
									/>
								}
							</div>
							: <div className="col-md-10">
								<Loading
									height={250}
								/>
							</div>
						}
					</div>
				)}
			</Popup>
		);
	}
}
