import React from "react";
import "./EditContent.css";
import { NotificationManager as nm } from "react-notifications";
import dompurify from "dompurify";
import RGL, { WidthProvider } from "react-grid-layout";
import { getRequest, postRequest } from "../../../utils/request.jsx";
import FormLine from "../../form/FormLine.jsx";
import Loading from "../../box/Loading.jsx";
import Message from "../../box/Message.jsx";
import { getContentFromBlock } from "../../../utils/article.jsx";
import DialogHint from "../DialogHint.jsx";

const ReactGridLayout = WidthProvider(RGL);

export default class EditContent extends React.Component {
	constructor(props) {
		super(props);

		this.getContent = this.getContent.bind(this);
		this.moveBox = this.moveBox.bind(this);
		this.changeState = this.changeState.bind(this);
		this.updateComponent = this.updateComponent.bind(this);
		this.getItemStatusClassname = this.getItemStatusClassname.bind(this);
		this.saveContent = this.saveContent.bind(this);
		this.resizeBoxes = this.resizeBoxes.bind(this);
		this.isContentEditionAllowed = this.isContentEditionAllowed.bind(this);
		this.saveArticleValue = this.saveArticleValue.bind(this);

		this.state = {
			content: null,
			originalContent: null,

			redirectToURL: (this.props.article.link !== null
				&& this.props.article.link.length > 0)
				|| !this.isContentEditionAllowed(),
			editArticle: (this.props.article.link === null
				|| this.props.article.link.length === 0)
				&& this.isContentEditionAllowed(),
		};
	}

	componentDidMount() {
		window.addEventListener("resize", this.resizeBoxes);
		this.getContent();
	}

	componentDidUpdate(prevProps, prevState) {
		if (JSON.stringify(prevState.content) !== JSON.stringify(this.state.content)) {
			this.resizeBoxes();
		}

		if (!prevState.editArticle && this.state.editArticle) {
			this.props.saveArticleValue("link", null, "The URL has been removed");
		}
	}

	getContent() {
		getRequest.call(this, "private/get_my_article_content/" + this.props.article.id, (data) => {
			for (let i = 0; i < data.length; i++) {
				data[i].i = "" + i;
				data[i].y = 0;
				data[i].x = data[i].position;
				data[i].w = 1;
				data[i].h = 5;
				data[i].isResizable = true;
				data[i].draggableHandle = ".draggable";
			}

			this.setState({
				content: data,
				originalContent: data,
			}, () => {
				this.resizeBoxes();
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	saveContent() {
		const params = {
			article: this.props.article.id,
			content: this.state.content.sort((first, second) => first.y - second.y),
		};

		postRequest.call(this, "private/update_my_article_content", params, () => {
			this.getContent();
			nm.info("The content has been updated");
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	addBox(type) {
		if (Array.isArray(this.state.content)) {
			const content = this.state.content.map((e) => e);
			content.push({
				type,
				content: null,
				draggableHandle: ".draggable",
				y: 1000000,
				x: 0,
				w: 1,
				h: 5,
				position: this.state.content.length + 1,
				i: "" + this.state.content.length,
				isResizable: true,
			});

			this.setState({ content });
		}
	}

	moveBox(e) {
		const content = [];
		let oldBlock = null;

		for (let i = 0; i < e.length; i++) {
			oldBlock = this.state.content.filter((o) => e[i].i === ("" + o.i))[0];
			content.push({ ...oldBlock, ...e[i] });
		}

		this.setState({ content });
	}

	removeBox(i) {
		const content = this.state.content.map((c) => c);
		content.splice(i, 1);

		for (let y = 0; y < content.length; y++) {
			content[y].position = parseInt(y, 10) + 1;
			content[y].y = y;
		}

		this.setState({ content });
	}

	resizeBoxes() {
		if (this.state.content === null) return;

		const content = this.state.content.map((c) => c);
		let modified = false;

		for (let i = 0; i < content.length; i++) {
			const tag = document.querySelector(".DialogArticleEditor-layout .item-" + content[i].i
				+ " .col-md-12 .FormLine");

			if (tag === null) {
				return;
			}

			const newSize = Math.ceil(tag.offsetHeight + 8) / 10;

			if (content[i].h !== newSize) {
				content[i].h = newSize;
				modified = true;
			}
		}

		// This way to save the new layout because the RReact Grid Layout is buggy on refreshing

		if (modified) {
			content.push({
				type: "TITLE1",
				content: null,
				draggableHandle: ".draggable",
				y: 1000000,
				x: 0,
				w: 1,
				h: 5,
				position: 1000000,
				i: "1000000",
				isResizable: true,
				fake: true,
			});

			this.setState({
				content,
			}, () => {
				this.setState({
					content: content.filter((c) => c.fake === undefined),
				});
			});
		}
	}

	updateComponent(index, field, value) {
		const c = JSON.parse(JSON.stringify(this.state.content));
		c[index][field] = value;
		this.setState({ content: c });
	}

	getItemStatusClassname(i) {
		if (this.state.originalContent.length <= i) {
			return "DialogArticleEditor-item-new";
		}

		if (JSON.stringify(this.state.content[i].content)
			!== JSON.stringify(this.state.originalContent[i].content)) {
			return "DialogArticleEditor-item-modified";
		}

		return "";
	}

	isContentEditionAllowed() {
		if (this.props.settings !== null && this.props.settings !== undefined) {
			if (this.props.settings.ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE_CONTENT !== undefined
				&& this.props.settings.ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE_CONTENT === "TRUE") {
				return true;
			}
		}

		return false;
	}

	saveArticleValue(property, value) {
		if (this.state.redirectToURL) {
			this.props.saveArticleValue(property, value);
		}
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	render() {
		return (
			<div className="EditContent row">
				{JSON.stringify(this.state.originalContent) !== JSON.stringify(this.state.content)
					&& <div className="EditContent-lock">
						<div className="EditContent-lock-buttons">
							<button
								className={"blue-background"}
								data-hover="Close"
								data-active=""
								onClick={this.saveContent}>
								<span><i className="fas fa-save"/> Save progress</span>
							</button>
							<button
								className={"red-background"}
								data-active=""
								onClick={this.getContent}>
								<span><i className="far fa-times-circle"/> Discard changes</span>
							</button>
						</div>
					</div>
				}

				{this.isContentEditionAllowed()
					&& <div className="col-md-12">
						<div className={"row row-spaced"}>
							<div className="col-md-9">
								<h3>Body type:</h3>
							</div>

							<div className="col-md-3 EditContent-top-menu">
								<DialogHint
									content={
										<div className="row">
											<div className="col-md-12">
												<h2>How can I edit the body of the article?</h2>

												{this.props.settings.ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE_CONTENT !== undefined
													&& this.props.settings.ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE_CONTENT === "TRUE"
													? <div>
														<p>
															You have to options to compose the body of an
															article:
														</p>

														<ul>
															<li>
																<b>Customised body</b>: you can
																use the content editor of this portal to edit
																the body of the article
															</li>
															<li>
																<b>External URL</b>: you can
																provide an URL from an external website.
																Clicking the article will redirect to this webpage
															</li>
														</ul>
													</div>
													: <div>
														<p>
															You have to provide an URL that is redirecting to
															the according webpage.
														</p>
													</div>
												}

												{this.props.settings.ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE_CONTENT !== undefined
													&& this.props.settings.ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE_CONTENT === "TRUE"
													&& <div>
														<h2>How do I edit the customised body?</h2>

														<p>
															You can create blocks to edit the body. Here
															are the block types:
														</p>

														<img src="img/hint-add-block-buttons.png"/>

														<ul>
															<li>
																<b>H1</b>: this is the highest heading level or
																paragraph title
															</li>
															<li>
																<b>H2</b>: this is the second highest heading level
																or paragraph subtitle
															</li>
															<li>
																<b><i className="fas fa-align-left"/></b>: this
																allows to edit the paragraphs
															</li>
															<li>
																<b><i className="fab fa-youtube"/></b>: you can
																insert the embed tag of a video (Youtube, Peertube, ...)
																to display the video in the article
															</li>
														</ul>

														<p>
															Once the blocks are created, you can always order them
															by drag-&-droping and remove them by clicking the
															following top right cross: <i className="fas fa-times"/>
														</p>

														<p>
															The preview is available next to the blocks. Here is
															the structure of it:
														</p>

														<img src="img/hint-article-content-preview.png"/>

														<ul>
															<li>
																<b>1</b>: this is the title of the article edited
																in the metadata section
															</li>
															<li>
																<b>2</b>: this is the abstract of the article
																edited in the metadata section
															</li>
															<li>
																The arrows show the representation of the
																blocks in the preview section
															</li>
														</ul>
													</div>
												}
											</div>
										</div>
									}
								/>
							</div>

							<div className="col-md-12">
								<FormLine
									type={"checkbox"}
									label={"Customised body"}
									value={this.state.editArticle}
									disabled={this.state.editArticle}
									onChange={(v) => this.setState({
										editArticle: v,
										redirectToURL: !v,
									})}
								/>
								<FormLine
									type={"checkbox"}
									label={"External URL"}
									value={this.state.redirectToURL}
									disabled={this.state.redirectToURL}
									onChange={(v) => this.setState({
										redirectToURL: v,
										editArticle: !v,
									})}
								/>
							</div>
						</div>
					</div>
				}

				<div className="col-md-12">
					{!this.state.editArticle && !this.state.redirectToURL
						&&	<Message
							text={"Please select one of the option above"}
							height={300}
						/>
					}

					{this.state.redirectToURL
						&&	<div className={"row row-spaced"}>
							<div className="col-md-12">
								<h3>URL of the article</h3>
							</div>

							<div className="col-md-12">
								<FormLine
									label={"External URL"}
									value={this.props.article.link}
									onBlur={(v) => this.saveArticleValue("link", v)}
								/>
							</div>
						</div>
					}

					{this.state.editArticle
						&& <div className="EditContent-customised">
							<div className={"row row-spaced EditContent-customised"}>
								<div className="col-md-6">
									<div className={"row"}>
										<div className="col-md-12 row-spaced">
											<h3>Content</h3>
										</div>
									</div>

									{this.state.version !== null && this.state.content !== null
										&& <div className={"row"}>
											<div className="col-md-12">
												{this.state.content.length === 0
													? <Message
														text={"This article has no content yet"}
														height={100}
													/>
													: ""}

												<ReactGridLayout
													className="DialogArticleEditor-layout layout"
													layout={this.state.content}
													isDraggable={true}
													isResizable={false}
													onDragStop={(e) => this.moveBox(e)}
													draggableHandle={".FormLine-label"}
													containerPadding={[0, 0]}
													margin={[0, 0]}
													cols={1}
													rowHeight={10}
												>
													{this.state.content.map((item, index) => (
														<div className={"DialogArticleEditor-item row item-" + index + " "
															+ this.getItemStatusClassname(index)}
														key={index}
														data-grid={item}>
															<div className="DialogArticleEditor-item-remove-button">
																<span
																	className="tooltip--left"
																	data-tooltip="Remove this block"
																	onClick={() => this.removeBox(index)}>
																	<i className="fas fa-times hoverEffect pageReporting-grid-button"/>
																</span>
															</div>
															<div className={"col-md-12"}>
																{item.type === "TITLE1"
																	? <FormLine
																		labelWidth={2}
																		label={"H1"}
																		value={item.content}
																		onBlur={(v) => this.updateComponent(index, "content", v)}
																	/>
																	: ""}
																{item.type === "TITLE2"
																	? <FormLine
																		labelWidth={2}
																		label={"H2"}
																		value={item.content}
																		onBlur={(v) => this.updateComponent(index, "content", v)}
																	/>
																	: ""}
																{item.type === "PARAGRAPH"
																	? <FormLine
																		type="editor"
																		label={<i className="fas fa-align-left"/>}
																		labelWidth={2}
																		value={item.content}
																		onChange={(v) => this.updateComponent(index, "content", v)}
																	/>
																	: ""}
																{item.type === "IMAGE"
																	? <div className="DialogArticleEditor-image-wrapper">
																		<FormLine
																			type="image"
																			label={<i className="fas fa-image"/>}
																			labelWidth={2}
																			value={item.content}
																			onChange={(v) => this.updateComponent(index, "content", v)}
																			onLoad={this.resizeBoxes}
																		/>
																	</div>
																	: ""}
																{item.type === "FRAME"
																	? <FormLine
																		type="frame"
																		label={<i className="fab fa-youtube"/>}
																		labelWidth={2}
																		value={item.content}
																		onChange={(v) => this.updateComponent(index, "content", v)}
																	/>
																	: ""}
															</div>
														</div>
													))}
												</ReactGridLayout>
											</div>
											<div className="col-md-12 DialogArticleEditor-block-buttons">
												<button
													onClick={() => this.addBox("TITLE1")}>
													H1
												</button>
												<button
													onClick={() => this.addBox("TITLE2")}>
													H2
												</button>
												<button
													onClick={() => this.addBox("PARAGRAPH")}>
													<i className="fas fa-align-left"/>
												</button>
												{/* <button
													onClick={() => this.addBox("IMAGE")}>
													<i className="fas fa-image"/>
												</button> */}
												<button
													onClick={() => this.addBox("FRAME")}>
													<i className="fab fa-youtube"/>
												</button>
											</div>
										</div>
									}

									{this.state.content === null
										&& <Loading
											height={250}
										/>
									}
								</div>

								<div className="col-md-6">
									<div className={"row"}>
										<div className="col-md-12">
											<h3>Preview</h3>
										</div>
									</div>

									{this.props.article.title !== null && this.state.content !== null
										&& <h2>{this.props.article.title}</h2>
									}

									{this.props.article.abstract !== null && this.state.content !== null
										&& this.props.article.abstract.length > 0
										&& <div
											className="EditContent-abstract"
											dangerouslySetInnerHTML={{
												__html:
												dompurify.sanitize(this.props.article.abstract),
											}}>
										</div>
									}

									{this.state.content !== null
										&& this.state.content.map((item) => getContentFromBlock(item))
									}

									{this.state.content === null
										&& <Message
											text={"No preview available"}
										/>
									}
								</div>
							</div>
						</div>
					}
				</div>
			</div>
		);
	}
}
