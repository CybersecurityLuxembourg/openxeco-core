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

		this.state = {
			content: null,
			originalContent: null,
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

		postRequest.call(this, "private/update_article_content", params, () => {
			this.getContent();
			nm.info("The content has been updated");
		}, (response) => {
			this.refresh();
			nm.warning(response.statusText);
		}, (error) => {
			this.refresh();
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
			content[y].y = y + "";
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

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	render() {
		return (
			<div className="row">
				<div className="col-md-6">
					<div className={"row row-spaced"}>
						<div className="col-md-12">
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
														labelWidth={1}
														label={"H1"}
														value={item.content}
														onBlur={(v) => this.updateComponent(index, "content", v)}
													/>
													: ""}
												{item.type === "TITLE2"
													? <FormLine
														labelWidth={1}
														label={"H2"}
														value={item.content}
														onBlur={(v) => this.updateComponent(index, "content", v)}
													/>
													: ""}
												{item.type === "PARAGRAPH"
													? <FormLine
														type="editor"
														label={<i className="fas fa-align-left"/>}
														labelWidth={1}
														value={item.content}
														onChange={(v) => this.updateComponent(index, "content", v)}
													/>
													: ""}
												{item.type === "IMAGE"
													? <div className="DialogArticleEditor-image-wrapper">
														<FormLine
															type="image"
															label={<i className="fas fa-image"/>}
															labelWidth={1}
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
														labelWidth={1}
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
								<button
									onClick={() => this.addBox("IMAGE")}>
									<i className="fas fa-image"/>
								</button>
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
					<div className={"row row-spaced"}>
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
		);
	}
}
