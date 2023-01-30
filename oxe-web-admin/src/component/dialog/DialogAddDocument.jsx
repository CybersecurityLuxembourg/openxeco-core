import React from "react";
import "./DialogAddDocument.css";
import Popup from "reactjs-popup";
import { NotificationManager as nm } from "react-notifications";
import Dropzone from "react-dropzone";
import { Breadcrumb } from "react-bootstrap";
import { postRequest } from "../../utils/request.jsx";
import { validateWords } from "../../utils/re.jsx";
import Chip from "../button/Chip.jsx";
import Message from "../box/Message.jsx";

export default class DialogAddDocument extends React.Component {
	constructor(props) {
		super(props);

		const initState = {
			document: null,
			filename: null,
			size: null,
			keywords: "",
			word: "",
			areKeywordsDefined: false,
		};

		this.state = {
			...initState,
			initState,
		};
	}

	onDrop(files) {
		if (files.length === 0) {
			nm.warning("No file has been detected. Please re-check the file extension.");
			this.setState({ ...this.state.initState });
		} else {
			const reader = new FileReader();

			reader.onabort = () => nm.error("file reading was aborted");
			reader.onerror = () => nm.error("An error happened while reading the file");
			reader.onload = () => {
				this.setState({
					document: reader.result,
					filename: files[0].name,
					size: files[0].size,
				});
			};

			reader.readAsBinaryString(files[0]);
		}
	}

	onKeywordsValidate() {
		this.setState({
			areKeywordsDefined: true,
		});
	}

	onValidate(close) {
		const params = {
			data: this.state.document,
			filename: this.state.filename,
		};

		postRequest.call(this, "media/add_document", params, (document) => {
			nm.info("The document has been added");

			const params2 = {
				id: document.id,
				keywords: this.state.keywords,
			};

			postRequest.call(this, "media/update_document", params2, () => {
				if (this.props.afterValidate !== undefined) this.props.afterValidate();

				close();
				this.setState({ ...this.state.initState });
				nm.info("The keywords has been added");
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	backToKeywordSelection() {
		this.setState({
			areKeywordsDefined: false,
			word: "",
		});
	}

	addKeyword(word) {
		let words;
		const wordsToAdd = word.split(" ").filter((w) => w.length > 2);

		if (this.state.keywords) {
			words = (this.state.keywords + " " + wordsToAdd.join(" ")).toLowerCase();
		} else {
			words = wordsToAdd.join(" ").toLowerCase();
		}

		this.setState({
			keywords: words,
			word: "",
		});
	}

	deleteKeyword(word) {
		if (this.state.keywords) {
			let words = this.state.keywords.split(" ");
			words = words.filter((w) => w !== word).join(" ");
			this.setState({ keywords: words });
		}
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	render() {
		return (
			<Popup
				className={"DialogAddImage"}
				trigger={this.props.trigger}
				modal
				closeOnDocumentClick
			>
				{(close) => <div className={"row"}>
					<div className={"col-md-9"}>
						<h2>Add the new document</h2>
					</div>

					<div className={"col-md-3"}>
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

					<div className={"col-md-12"}>
						<Breadcrumb>
							<Breadcrumb.Item
								onClick={() => this.setState({ ...this.state.initState })}>
                                Choose Document
							</Breadcrumb.Item>
							&nbsp;&gt;&nbsp;
							<Breadcrumb.Item
								active={!this.state.document}
								onClick={() => this.backToKeywordSelection()}>
								Add keywords
							</Breadcrumb.Item>
                            &nbsp;&gt;&nbsp;
							<Breadcrumb.Item
								active={!this.state.document || !this.state.areKeywordsDefined}>
                                Upload Document
							</Breadcrumb.Item>
						</Breadcrumb>

						{!this.state.document
							&& <div className={"row"}>
								<div className={"col-md-12"}>
									<Dropzone
										accept=".pdf,.mp3"
										disabled={false}
										onDrop={(f) => this.onDrop(f)}
									>
										{({ getRootProps, getInputProps }) => (
											<div
												className={"DialogAddDocument-dragdrop"}
												{...getRootProps()}>
												<input {...getInputProps()} />
												<div className="DialogAddDocument-dragdrop-textContent">
													<i className="fas fa-file"/>
													<div>Drag and drop the file here</div>
													<div>(must be .pdf, .mp3)</div>
												</div>
											</div>
										)}
									</Dropzone>
								</div>
								<div className={"col-md-12"}>
									<div className={"right-buttons"}>
										<button
											className={"grey-background"}
											data-hover="Close"
											data-active=""
											onClick={close}>
											<span><i className="far fa-times-circle"/> Close</span>
										</button>
									</div>
								</div>
							</div>
						}

						{this.state.document && !this.state.areKeywordsDefined
							&& <div className="row">
								<div className="col-md-12">
									<input
										autoFocus
										className={!validateWords(this.state.word) ? "FormLine-wrong-format" : ""}
										type={"text"}
										value={this.state.word}
										onChange={(v) => this.setState({ word: v.target.value })}
										onKeyPress={(e) => {
											if (e.key === "Enter" && validateWords(this.state.word)) {
												this.addKeyword(this.state.word);
											}
										}}
									/>
								</div>

								<div className="col-md-12 right-buttons">
									<button
										onClick={() => this.addKeyword(this.state.word)}
										disabled={!validateWords(this.state.word)}
									>
										Add keywords
									</button>
								</div>

								<div className="col-md-12">
									{this.state.keywords
										? this.state.keywords.split(" ").map((w) => <Chip
											key={w}
											label={w}
											value={w}
											onClick={(v) => this.deleteKeyword(v)}
										/>)
										: <Message
											text={"No keyword for this document"}
											height={100}
										/>
									}
								</div>

								<div className={"col-md-12"}>
									<div className={"right-buttons"}>
										<button
											className={"grey-background"}
											data-active=""
											onClick={() => this.setState({ ...this.state.initState })}>
											<span><i className="far fa-arrow-alt-circle-left"/> Back to document selection</span>
										</button>
										<button
											data-hover="Validate keywords"
											data-active=""
											onClick={() => this.onKeywordsValidate()}>
											<span><i className="far fa-check-circle"/> Validate keywords</span>
										</button>
									</div>
								</div>
							</div>
						}

						{this.state.document && this.state.areKeywordsDefined
							&& <div className={"row"}>
								<div className={"col-md-12"}>
									<div className="DialogAddDocument-textContent">
										<i className="fas fa-file"/>
										<div>{this.state.filename}</div>
									</div>
								</div>
								<div className={"col-md-12"}>
									{this.state.keywords
										&& this.state.keywords.split(" ").map((w) => <Chip
											key={w}
											label={w}
											value={w}
										/>)}
								</div>
								<div className={"col-md-12"}>
									<div className={"right-buttons"}>
										<button
											className={"grey-background"}
											data-active=""
											onClick={() => this.setState({
												areKeywordsDefined: false,
												word: "",
											})}>
											<span><i className="far fa-arrow-alt-circle-left"/> Back to keyword selection</span>
										</button>
										<button
											data-hover="Validate image"
											data-active=""
											onClick={() => this.onValidate(close)}>
											<span><i className="far fa-check-circle"/> Upload</span>
										</button>
									</div>
								</div>
							</div>
						}
					</div>
				</div>
				}
			</Popup>
		);
	}
}
