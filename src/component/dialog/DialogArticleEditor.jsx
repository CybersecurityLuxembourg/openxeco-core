import React from "react";
import "./DialogArticleEditor.css";
import Popup from "reactjs-popup";
import { NotificationManager as nm } from "react-notifications";
import { getRequest } from "../../utils/request.jsx";
import EditMetadata from "./DialogArticleEditor/EditMetadata.jsx";
import EditContent from "./DialogArticleEditor/EditContent.jsx";
import Loading from "../box/Loading.jsx";
import ArticleStatus from "../item/ArticleStatus.jsx";

export default class DialogArticleEditor extends React.Component {
	constructor(props) {
		super(props);

		this.onOpen = this.onOpen.bind(this);
		this.getArticleInfo = this.getArticleInfo.bind(this);
		this.getArticleEnums = this.getArticleEnums.bind(this);
		this.changeState = this.changeState.bind(this);

		this.state = {
			article: null,
			articleEnums: null,
			editContent: false,
		};
	}

	onOpen() {
		window.addEventListener("resize", this.resizeBoxes);
		this.getArticleInfo();
		this.getArticleEnums();
	}

	getArticleInfo() {
		this.setState({
			article: null,
		});

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

		getRequest.call(this, "public/get_article_enums", (data) => {
			this.setState({
				articleEnums: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	getArticleStatus() {
		const status = [];

		if (this.state.article !== null) {
			if (this.state.article.status !== "PUBLIC") {
				status.push("The status of the article is not PUBLIC");
			}

			if (this.state.article.publication_date === null) {
				status.push("The publication date of the article is not defined");
			} else if (this.state.article.publication_date < new Date()) {
				status.push("The publication date of the article is in the future");
			}
		} else {
			return null;
		}

		return status;
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
			>
				{(close) => (
					<div className={"row"}>
						<div className={"col-md-12 DialogArticleEditor-top-bar"}>
							<h2>Article editor</h2>

							<div className="top-right-buttons">
								<button
									className={"blue-background"}
									data-hover="Close"
									data-active=""
									onClick={this.getArticleInfo}>
									<span><i className="fas fa-sync-alt"/></span>
								</button>
								<button
									className={"red-background"}
									data-hover="Close"
									data-active=""
									onClick={close}>
									<span><i className="far fa-times-circle"/></span>
								</button>
							</div>
						</div>

						<div className="col-md-2 DialogArticleEditor-menu-wrapper">
							<div className="DialogArticleEditor-menu">
								<ArticleStatus
									status={this.getArticleStatus()}
								/>

								<h3>Tabs</h3>

								<button
									className={"link-button " + (!this.state.editContent && "selected-link-button")}
									data-hover="Save"
									data-active=""
									onClick={() => this.setState({ editContent: false })}>
									Edit metadata
								</button>
								<button
									className={"link-button " + (this.state.editContent && "selected-link-button")}
									data-hover="Save"
									data-active=""
									onClick={() => this.setState({ editContent: true })}>
									Edit content
								</button>
							</div>
						</div>

						{this.state.article !== null
							? <div className="col-md-10 DialogArticleEditor-body">
								{this.state.editContent
									? <EditContent
										article={this.state.article}
										refreshArticle={this.getArticleInfo}
									/>
									: <EditMetadata
										article={this.state.article}
										articleEnums={this.state.articleEnums}
										refreshArticle={this.getArticleInfo}
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
