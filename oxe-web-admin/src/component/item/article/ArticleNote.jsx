import React from "react";
import "./ArticleNote.css";
import Popup from "reactjs-popup";
import { NotificationManager as nm } from "react-notifications";
import { getRequest, postRequest } from "../../../utils/request.jsx";
import { dictToURI } from "../../../utils/url.jsx";
import Loading from "../../box/Loading.jsx";
import Message from "../../box/Message.jsx";
import Note from "../Note.jsx";
import FormLine from "../../button/FormLine.jsx";

export default class ArticleNote extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			notes: null,
			page: null,
			pages: null,
			content: "",
		};
	}

	componentDidMount() {
		this.refresh();
	}

	refresh() {
		this.getNotes();
	}

	getNotes(page) {
		const params = {
			article: this.props.id,
			page: page || 1,
		};

		getRequest.call(this, "note/get_notes?" + dictToURI(params), (data) => {
			this.setState({
				notes: this.state.notes && params.page !== 1
					? this.state.notes.concat(data.items) : data.items,
				page: data.pagination.page,
				pages: data.pagination.pages,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	addNote(close) {
		const params = {
			content: this.state.content,
			article: this.props.id,
		};

		postRequest.call(this, "note/add_note", params, () => {
			if (close) {
				close();
			}
			this.refresh();
			nm.info("The note has been added");
		}, (response) => {
			this.refresh();
			nm.warning(response.statusText);
		}, (error) => {
			this.refresh();
			nm.error(error.message);
		});
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	render() {
		return (
			<div id={"ArticleNote"} className={"row"}>
				<div className="col-md-12">
					<div className={"row"}>
						<div className="col-md-12">
							<h2>Notes</h2>

							<div className={"top-right-buttons"}>
								<button
									onClick={() => this.refresh()}>
									<i className="fas fa-redo-alt"/>
								</button>
								<Popup
									className="Popup-small-size"
									trigger={
										<button className={"card-button"}>
											<i className="fas fa-plus"/>
										</button>
									}
									modal
									closeOnDocumentClick
									onOpen={() => this.changeState({ content: "" })}
								>
									{(close) => (
										<div className="row">
											<div className="col-md-9 row-spaced">
												<h3>Add a note</h3>
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

											<div className="col-md-12">
												<FormLine
													type="editor"
													label={"Content"}
													labelWidth={4}
													value={this.state.content}
													onChange={(v) => this.changeState("content", v)}
													format={(v) => v}
												/>
											</div>

											<div className="col-md-12">
												<div className="right-buttons">
													<button
														onClick={() => this.addNote(close)}
														disabled={!this.state.content
															|| this.state.content.length < 3}>
														<i className="fas fa-plus"/> Add a note
													</button>
												</div>
											</div>
										</div>
									)}
								</Popup>
							</div>
						</div>
					</div>

					<div className={"row row-spaced"}>
						{this.state.notes && this.state.notes.length > 0
							&& <div className="col-md-12">
								{this.state.notes.map((n) => (
									<Note
										key={n.id}
										note={n}
										user={this.props.user}
										afterDelete={() => this.refresh()}
										afterUpdate={() => this.refresh()}
									/>
								))}
							</div>
						}

						{this.state.notes && this.state.notes.length === 0
							&& <div className="col-md-12">
								<Message
									text={"No note found"}
									height={150}
								/>
							</div>
						}

						{!this.state.notes
							&& <div className="col-md-12">
								<Loading
									height={150}
								/>
							</div>
						}
					</div>

					<div className={"row row-spaced"}>
						<div className="col-md-12 centered-buttons">
							{this.state.page && this.state.pages
								&& this.state.pages > this.state.page
								? <button
									className={"blue-background"}
									onClick={() => this.getNotes(this.state.page + 1)}>
									<i className="fas fa-plus"/> Load more notes
								</button> : ""
							}

							{this.state.page && this.state.pages
								&& this.state.pages === this.state.page
								? <button
									className={"blue-background"}
									disabled={true}>
									No more note to load
								</button> : ""
							}
						</div>
					</div>
				</div>
			</div>
		);
	}
}
