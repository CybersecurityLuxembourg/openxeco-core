import React from "react";
import "./DialogCampaignBodyEditor.css";
import Popup from "reactjs-popup";
import { NotificationManager as nm } from "react-notifications";
import dompurify from "dompurify";
import CodeEditor from "@uiw/react-textarea-code-editor";
import Message from "../../box/Message.jsx";
import Info from "../../box/Info.jsx";
import DialogConfirmation from "../../dialog/DialogConfirmation.jsx";
import { getRequest, postRequest } from "../../../utils/request.jsx";
import { getApiURL } from "../../../utils/env.jsx";
import { dictToURI } from "../../../utils/url.jsx";

export default class DialogCampaignBodyEditor extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			body: null,
			user: null,
			template: null,
			articles: null,
			entities: null,
			articleRegex: /\[ARTICLE\s\d+\]/g,
			entityRegex: /\[ENTITY\s\d+\]/g,
		};
	}

	componentDidUpdate(prevProps, prevState) {
		if (prevProps.campaign !== this.props.campaign && this.props.campaign) {
			this.setState({ body: this.props.campaign.body });
		}

		if (prevState.body !== this.state.body) {
			if (this.getArticleIds(prevState.body) !== this.getArticleIds(this.state.body)) {
				this.fetchArticles();
			}

			if (this.getEntityIds(prevState.body) !== this.getEntityIds(this.state.body)) {
				this.fetchEntities();
			}
		}
	}

	onOpen() {
		this.setState({
			body: this.props.campaign.body,
		});

		if (this.props.onOpen) {
			this.props.onOpen();
		}

		if (!this.state.user) {
			this.fetchMyUser();
		}

		this.fetchTemplate();
	}

	sendDraft() {
		if (this.state.user) {
			const params = {
				id: this.props.campaign.id,
			};

			postRequest.call(this, "campaign/send_campaign_draft", params, () => {
				nm.info("The draft of the template has been sent");
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		} else {
			nm.warning("The user email has not been found");
		}
	}

	fetchTemplate() {
		if (this.props.campaign && this.props.campaign.template_id) {
			getRequest.call(this, "campaign/get_campaign_template/" + this.props.campaign.template_id, (data) => {
				this.setState({
					template: data,
				});
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		}
	}

	fetchMyUser() {
		getRequest.call(this, "private/get_my_user", (data) => {
			this.setState({
				user: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	fetchArticles() {
		const params = {
			ids: this.getArticleIds(this.state.body),
		};

		getRequest.call(this, "public/get_public_articles?" + dictToURI(params), (data) => {
			this.setState({
				articles: data.items,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	fetchEntities() {
		const params = {
			ids: this.getEntityIds(this.state.body),
		};

		getRequest.call(this, "public/get_public_entities?" + dictToURI(params), (data) => {
			this.setState({
				entities: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	buildCampaignBody() {
		if (this.state.template && this.state.template.content) {
			return this.state.template.content
				.replaceAll("[CAMPAIGN CONTENT]", this.state.body || "")
				.replaceAll("[UNSUBSCRIPTION LINK]", `<a href='${getApiURL()}account/unsubscribe'>Unsubscribe</a>`)
				.replaceAll(this.state.articleRegex, (m) => this.getArticleContent(m))
				.replaceAll(this.state.entityRegex, (m) => this.getEntityContent(m))
				.replaceAll("[LOGO]", "<img"
					+ " style='max-width: 100%; max-height: 100%;'"
					+ " src='" + getApiURL() + "public/get_public_image/logo.png'/>");
		}

		return this.state.body || "";
	}

	getArticleContent(m) {
		const id = parseInt(m.match(/\d+/g)[0], 10);

		if (this.state.articles) {
			const ids = this.state.articles.map((a) => a.id);

			if (ids.includes(id)) {
				const a = this.state.articles.filter((ar) => ar.id === id).pop();

				const img = a.image
					? `<img src="${getApiURL()}public/get_public_image/${a.image.toString()}"/>`
					: "<div class='no-image'/>";

				return `
					<table class="article">
						<tr>
							<td class="image">
								${img}
							</td>
							<td class="content">
								<div class="type">${a.type}</div>
								<div class="title">${a.title}</div>
								<div class="abstract">${a.abstract}</div>
								<button>Read more</button>
							</td>
						</tr>
					</table>
				`;
			}

			return `[ARTICLE ${id} NOT FOUND]`;
		}

		return `[LOADING ARTICLE ${id}...]`;
	}

	getEntityContent(m) {
		const id = parseInt(m.match(/\d+/g)[0], 10);

		if (this.state.entities) {
			const ids = this.state.entities.map((a) => a.id);

			if (ids.includes(id)) {
				const e = this.state.entities.filter((en) => en.id === id).pop();

				const img = e.image
					? `<img src="${getApiURL()}public/get_public_image/${e.image.toString()}"/>`
					: "<div class='no-image'/>";

				return `
					<table class="entity">
						<tr>
							<td class="image">
								${img}
							</td>
							<td class="content">
								<div class="name">${e.name}</div>
								<button>Read more</button>
							</td>
						</tr>
					</table>
				`;
			}

			return `[ENTITY ${id} NOT FOUND]`;
		}

		return `[LOADING ENTITY ${id}...]`;
	}

	getArticleIds(body) {
		if (body) {
			return Array.from(
				body.matchAll(this.state.articleRegex),
				(m) => m[0],
			).map((t) => t.match(/\d+/g)[0]);
		}

		return [];
	}

	getEntityIds(body) {
		if (body) {
			return Array.from(
				body.matchAll(this.state.entityRegex),
				(m) => m[0],
			).map((t) => t.match(/\d+/g)[0]);
		}

		return [];
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
				className={"DialogCampaignBodyEditor"}
				onOpen={() => this.onOpen()}
			>
				{(close) => (
					<div className="DialogCampaignBodyEditor row">
						<div className={"col-md-9"}>
							<h1>
								Editing body
							</h1>
						</div>

						<div className={"col-md-3"}>
							<div className="right-buttons">
								<button
									className={"grey-background"}
									onClick={close}>
									<span><i className="far fa-times-circle"/></span>
								</button>
							</div>
						</div>

						{this.state.body !== this.props.campaign.body
							&& <div className="DialogCampaignBodyEditor-lock"/>
						}

						<div className="DialogCampaignBodyEditor-lock-buttons">
							<h3>Quick actions</h3>

							<button
								className={"blue-background"}
								disabled={!this.state.body || !this.state.user}
								onClick={() => this.sendDraft()}>
								<span><i className="fas fa-paper-plane"/> Send draft to myself</span>
							</button>

							<DialogConfirmation
								text={"Are you sure you want to discard the progress?"}
								trigger={
									<button
										className={"red-background"}
										disabled={this.state.body === this.props.campaign.body}>
										<span><i className="far fa-times-circle"/> Discard changes...</span>
									</button>
								}
								afterConfirmation={() => this.setState({ body: this.props.campaign.body })}
							/>

							<button
								className={"blue-background"}
								disabled={this.state.body === this.props.campaign.body}
								onClick={() => this.props.updateCampaign("body", this.state.body)}>
								<span><i className="fas fa-save"/> Save progress</span>
							</button>
						</div>

						<div className="col-md-12">
							<div className="DialogCampaignBodyEditor-customised">
								<div className={"row row-spaced DialogCampaignBodyEditor-customised"}>
									<div className="col-md-6">
										<div className={"row"}>
											<div className="col-md-12">
												<h2>Content</h2>
											</div>

											<div className="col-md-12">
												<Info
													content={<div>
														You can include these elements:
														<ul>
															<li>[LOGO] to integrate the logo of the project</li>
															<li>[ARTICLE 12] to integrate the article with the ID 12</li>
															<li>[ENTITY 24] to integrate the entity with the ID 24</li>
															<li>[UNSUBSCRIPTION LINK] to integrate the link in
															order to &quot;Unsubscribe&quot;</li>
														</ul>
													</div>}
												/>
											</div>

											<div className="col-md-12">
												<CodeEditor
													value={this.state.body}
													disabled={this.props.campaign.status === "PROCESSED"}
													language="html"
													placeholder="Please enter HTML/CSS code"
													onChange={(e) => this.setState({ body: e.target.value })}
													padding={15}
													style={{
														fontSize: 12,
														backgroundColor: "#f5f5f5",
														fontFamily: "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
													}}
												/>
											</div>
										</div>
									</div>

									<div className="col-md-6">
										<div className={"row"}>
											<div className="col-md-12">
												<h2>Preview</h2>
											</div>

											<div className="col-md-12">
												{this.props.campaign
													? <div
														className="DialogCampaignBodyEditor-preview-box"
														dangerouslySetInnerHTML={{
															__html: dompurify.sanitize(
																this.buildCampaignBody(),
															),
														}}>
													</div>
													: <Message
														text={"No preview available"}
													/>
												}
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}
			</Popup>
		);
	}
}
