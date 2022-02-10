import React, { Component } from "react";
import "./Document.css";
import { NotificationManager as nm } from "react-notifications";
import Popup from "reactjs-popup";
import { validateWord } from "../../utils/re.jsx";
import Chip from "../button/Chip.jsx";
import Message from "../box/Message.jsx";
import { getRequest, postRequest } from "../../utils/request.jsx";
import Loading from "../box/Loading.jsx";
import { getApiURL } from "../../utils/env.jsx";
import copyToClipboard from "../../utils/clipboard.jsx";
import DialogConfirmation from "../dialog/DialogConfirmation.jsx";

export default class Document extends Component {
	constructor(props) {
		super(props);

		this.state = {
			document: null,
			word: null,
		};
	}

	onClick() {
		if (typeof this.props.disabled !== "undefined" || !this.props.disabled) {
			this.onOpen();

			const newState = !this.props.selected;
			if (typeof this.props.onClick !== "undefined") this.props.onClick(this.props.id, newState);
		}
	}

	getDocument() {
		this.setState({
			document: null,
		}, () => {
			getRequest.call(this, "media/get_document/" + this.props.id, (data) => {
				this.setState({
					document: data,
				});
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		});
	}

	updateDocument(id, keywords) {
		const params = {
			id,
			keywords,
		};

		postRequest.call(this, "media/update_document", params, () => {
			this.setState({
				word: null,
			}, () => {
				this.getDocument();
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	changeDocumentValue(property, value) {
		const params = {
			id: this.state.document.id,
			[property]: value,
		};

		postRequest.call(this, "media/update_document", params, () => {
			this.getDocument();
			nm.info("The document has been updated");
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	confirmDeletion() {
		const params = {
			id: this.props.id,
		};

		postRequest.call(this, "media/delete_document", params, () => {
			document.elementFromPoint(100, 0).click();
			nm.info("The document has been deleted");

			if (typeof this.props.afterDeletion !== "undefined") this.props.afterDeletion();
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	addKeyword(word) {
		if (this.state.document) {
			let words;

			if (this.state.document.keywords) {
				words = (this.state.document.keywords + " " + word).toLowerCase();
			} else {
				words = word.toLowerCase();
			}

			this.updateDocument(this.state.document.id, words);
		}
	}

	deleteKeyword(word) {
		if (this.state.document && this.state.document.keywords) {
			let words = this.state.document.keywords.split(" ");
			words = words.filter((w) => w !== word).join(" ");
			this.updateDocument(this.state.document.id, words);
		}
	}

	render() {
		return (
			<Popup
				className="Popup-full-size"
				trigger={
					<div className={"Document " + (this.state.selected ? "Document-selected" : "")}>
						<div className="Document-document">
							<i className="fas fa-file"/>
							<div>{this.props.filename ? this.props.filename : "Loading"}</div>
							<div>{this.props.creationDate ? this.props.creationDate : ""}</div>
						</div>
					</div>
				}
				modal
				closeOnDocumentClick
				onOpen={() => this.getDocument()}
			>
				{(close) => <div className="row">
					<div className="col-md-9">
						<h1 className="Document-title">
                            Document
						</h1>
					</div>

					<div className={"col-md-3"}>
						<div className="top-right-buttons">
							<DialogConfirmation
								text={"Are you sure you want to delete this document?"}
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
					</div>

					<div className="col-md-12">
						{this.state.document
							? <div className="row">
								<div className="col-md-12">
									<div className="Document-document">
										<i className="fas fa-file"/>
										<div>{this.state.document.filename}</div>
										<div>{this.props.creationDate}</div>
									</div>
								</div>

								<div className="col-md-12">
									<h3>Links</h3>
								</div>

								<div className="col-md-12">
									<div
										className="Document-link"
										onClick={() => copyToClipboard(getApiURL()
											+ "public/get_public_document/" + this.state.document.filename)}>
										<i className="fas fa-link"/>&nbsp;
										{getApiURL() + "public/get_public_document/" + this.state.document.filename}
									</div>
								</div>

								<div className="col-md-12">
									<h3>Keywords</h3>
								</div>

								<div className="col-md-12">
									<input
										autoFocus
										className={!validateWord(this.state.word) ? "FormLine-wrong-format" : ""}
										type={"text"}
										value={this.state.word}
										onChange={(v) => this.setState({ word: v.target.value })}
										onKeyPress={(e) => {
											if (e.key === "Enter" && validateWord(this.state.word)) {
												this.addKeyword(this.state.word);
											}
										}}
									/>
								</div>

								<div className="col-md-12 right-buttons">
									<button
										onClick={() => this.addKeyword(this.state.word)}
										disabled={!validateWord(this.state.word)}
									>
										Add keyword
									</button>
								</div>

								<div className="col-md-12">
									{this.state.document.keywords
										? this.state.document.keywords.split(" ").map((w) => <Chip
											key={w}
											label={w}
											value={w}
											onClick={(v) => this.deleteKeyword(v)}
										/>)
										: <Message
											text={"No keyword for this document"}
											height={150}
										/>
									}
								</div>
							</div>
							: <Loading
								height={300}
							/>
						}
					</div>
				</div>}
			</Popup>
		);
	}
}
