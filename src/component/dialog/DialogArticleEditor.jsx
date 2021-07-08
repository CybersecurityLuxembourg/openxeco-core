import React from "react";
import "./DialogArticleEditor.css";
import Popup from "reactjs-popup";
import { NotificationManager as nm } from "react-notifications";
import { getRequest } from "../../utils/request.jsx";
import EditMetadata from "./DialogArticleEditor/EditMetadata.jsx";
import EditContent from "./DialogArticleEditor/EditContent.jsx";
import Loading from "../box/Loading.jsx";

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
									className={"grey-background"}
									data-hover="Close"
									data-active=""
									onClick={close}>
									<span><i className="far fa-times-circle"/></span>
								</button>
							</div>
						</div>

						<div className="col-md-2">
							<div className="DialogArticleEditor-menu">
								<h3>Tabs</h3>

								<button
									className={"link-button"}
									data-hover="Save"
									data-active=""
									onClick={() => this.setState({ editContent: false })}>
									Edit metadata
								</button>
								<button
									className={"link-button"}
									data-hover="Save"
									data-active=""
									onClick={() => this.setState({ editContent: true })}>
									Edit content
								</button>

								<h3>Action</h3>

								<button
									className={"grey-background"}
									data-hover="Save"
									data-active=""
									onClick={close}>
									<span><i className="far fa-times-circle"/></span>
								</button>
								<button
									className={"grey-background"}
									data-hover="FFFFF"
									data-active=""
									onClick={close}>
									<span><i className="far fa-times-circle"/></span>
								</button>

								<h3>Logs</h3>
							</div>
						</div>

						{this.state.article !== null
							? <div className="col-md-10">
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
							: <Loading
								height={250}
							/>
						}
					</div>
				)}
			</Popup>
		);
	}
}
