import React, { Component } from "react";
import "./Article.css";
import Popup from "reactjs-popup";
import { NotificationManager as nm } from "react-notifications";
import { getRequest, getForeignRequest, postRequest } from "../../utils/request.jsx";
import DialogConfirmation from "../dialog/DialogConfirmation.jsx";
import Tab from "../tab/Tab.jsx";
import ArticleGlobal from "./article/ArticleGlobal.jsx";
import ArticleVersion from "./article/ArticleVersion.jsx";
import ArticleContent from "./article/ArticleContent.jsx";
import ArticleTag from "./article/ArticleTag.jsx";
import ArticleSync from "./article/ArticleSync.jsx";
import { getUrlParameter } from "../../utils/url.jsx";
import FormLine from "../button/FormLine.jsx";
import Chip from "../button/Chip.jsx";

export default class Article extends Component {
	constructor(props) {
		super(props);

		this.state = {
			article: null,
			selectedMenu: null,
			tabs: [
				"global",
				"version",
				"content",
				"tag",
				"synchronization",
			],

			sync_global: true,
			sync_content: true,
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

	confirmDeletion(close) {
		const params = {
			id: this.props.id,
		};

		postRequest.call(this, "article/delete_article", params, () => {
			nm.info("The article has been deleted");
			if (close) {
				close();
			}

			if (typeof this.props.afterDeletion !== "undefined") this.props.afterDeletion();
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	fetchArticle() {
		if (this.props.node && this.props.node.api_endpoint) {
			const url = this.props.node.api_endpoint + "/public/get_public_article/" + this.props.id;

			getForeignRequest.call(this, url, (data) => {
				this.setState({
					article: data,
				});
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		} else {
			getRequest.call(this, "public/get_public_article/" + this.props.id, (data) => {
				this.setState({
					article: data,
				});
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		}
	}

	importArticle(close) {
		const params = {
			network_node_id: this.props.node.id,
			article_id: this.state.article.id,
			sync_global: this.state.sync_global,
			sync_content: this.state.sync_content,
		};

		postRequest.call(this, "network/import_article", params, () => {
			nm.info("The article has been imported");
			if (close) {
				close();
			}
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
				onOpen={() => this.fetchArticle()}
			>
				{(close) => <div className="Article-content row row-spaced">
					<div className="col-md-12">
						<div className={"top-right-buttons"}>
							{this.props.node
								&& this.state.article
								&& <Popup
									className="Popup-small-size"
									trigger={
										<button
											title="Import article">
											<i className="fas fa-download"/>
										</button>
									}
									modal
									closeOnDocumentClick
								>
									{(close2) => (
										<div className="row row-spaced">
											<div className="col-md-12">
												<h2>Select options and import</h2>

												<div className={"top-right-buttons"}>
													<button
														className={"grey-background"}
														onClick={close2}>
														<i className="far fa-times-circle"/>
													</button>
												</div>
											</div>

											<div className="col-md-12">
												<FormLine
													type="checkbox"
													label={"Synchronize the global information"}
													value={this.state.sync_global}
													onChange={(v) => this.changeState("sync_global", !v)}
												/>
												<FormLine
													type="checkbox"
													label={"Synchronize the content of the article"}
													value={this.state.sync_content}
													onChange={(v) => this.changeState("sync_content", !v)}
												/>
											</div>

											<div className="col-md-12 right-buttons">
												<button
													title="Import article"
													onClick={() => this.importArticle(close2)}>
													<i className="fas fa-download"/> Import article
												</button>
											</div>
										</div>
									)}
								</Popup>
							}
							{!this.props.node
								&& <DialogConfirmation
									text={"Are you sure you want to delete this article?"}
									trigger={
										<button
											className={"red-background"}>
											<i className="fas fa-trash-alt"/>
										</button>
									}
									afterConfirmation={() => this.confirmDeletion(close)}
								/>
							}
							<button
								className={"grey-background"}
								data-hover="Close"
								data-active=""
								onClick={close}>
								<span><i className="far fa-times-circle"/></span>
							</button>
						</div>
						<h1 className="Article-title">
							<i className="fas fa-feather-alt"/> {this.props.name}

							{this.props.node
								? <Chip
									label={"Remote"}
								/>
								: <Chip
									label={"Local"}
								/>
							}

							{this.state.article
								&& this.state.article.sync_node
								&& <Chip
									label={"Synchronized"}
								/>
							}

							{this.state.article
								&& this.state.article.sync_node
								&& this.state.article.sync_status
								&& <Chip
									label={"SYNC STATUS: " + this.state.article.sync_status}
								/>
							}
						</h1>

						<Tab
							labels={["Global", "Version", "Content", "Tag", "Synchronization"]}
							selectedMenu={this.state.selectedMenu}
							onMenuClick={this.onMenuClick}
							keys={this.state.tabs}
							content={[
								<ArticleGlobal
									key={this.props.id}
									id={this.props.id}
									article={this.state.article}
									node={this.props.node}
									editable={!this.props.node}
									refresh={() => this.fetchArticle()}
								/>,
								<ArticleVersion
									key={this.props.id}
									id={this.props.id}
									article={this.state.article}
									node={this.props.node}
									editable={!this.props.node}
									refresh={() => this.fetchArticle()}
								/>,
								<ArticleContent
									key={this.props.id}
									id={this.props.id}
									article={this.state.article}
									node={this.props.node}
									editable={!this.props.node}
									refresh={() => this.fetchArticle()}
								/>,
								<ArticleTag
									key={this.props.id}
									id={this.props.id}
									article={this.state.article}
									node={this.props.node}
									editable={!this.props.node}
									refresh={() => this.fetchArticle()}
								/>,
								<ArticleSync
									key={this.props.id}
									id={this.props.id}
									article={this.state.article}
									node={this.props.node}
									editable={!this.props.node}
									refresh={() => this.fetchArticle()}
								/>,
							]}
						/>
					</div>
				</div>
				}
			</Popup>
		);
	}
}
