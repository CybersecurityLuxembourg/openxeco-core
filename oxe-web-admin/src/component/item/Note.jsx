import React, { Component } from "react";
import "./Note.css";
import Popup from "reactjs-popup";
import { NotificationManager as nm } from "react-notifications";
import dompurify from "dompurify";
import DialogConfirmation from "../dialog/DialogConfirmation.jsx";
import { postRequest } from "../../utils/request.jsx";
import FormLine from "../button/FormLine.jsx";

export default class Note extends Component {
	constructor(props) {
		super(props);

		this.state = {
			userComponent: null,
			updateContent: "",
		};
	}

	deleteNote() {
		const params = {
			id: this.props.note.id,
		};

		postRequest.call(this, "note/delete_note", params, () => {
			if (this.props.afterDelete) {
				this.props.afterDelete();
			}
			nm.info("The note has been deleted");
		}, (response) => {
			this.refresh();
			nm.warning(response.statusText);
		}, (error) => {
			this.refresh();
			nm.error(error.message);
		});
	}

	updateNote(close) {
		const params = {
			id: this.props.note.id,
			content: this.state.updateContent,
		};

		postRequest.call(this, "note/update_note", params, () => {
			if (this.props.afterUpdate) {
				this.props.afterUpdate();
			}
			if (close) {
				close();
			}
			nm.info("The note has been updated");
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	getUserDescription(user, id) {
		if (this.props.ownerUser) {
			return this.props.ownerUser.email;
		}

		return "User: " + id;
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	render() {
		return (
			<div className="Note row">
				<div className="col-md-6">
					<div className="Note-user">
						{this.getUserDescription(this.props.ownerUser, this.props.note.admin)}
					</div>
				</div>

				<div className="col-md-6">
					<div className="Note-time">
						{this.props.note.sys_date.replace("T", " ")}
					</div>
				</div>

				<div className="col-md-12">
					<div className="Note-content">
						<div dangerouslySetInnerHTML={{
							__html: dompurify.sanitize(this.props.note.content),
						}}/>

						{this.props.user
							&& this.props.user === this.props.note.admin
							&& <div className="Note-delete-button">
								<Popup
									className="Popup-small-size"
									trigger={
										<button className={"card-button small-button"}>
											<i className="fas fa-edit"/>
										</button>
									}
									modal
									closeOnDocumentClick
									onOpen={() => this.setState({ updateContent: this.props.note.content })}
								>
									{(close) => (
										<div className="row">
											<div className="col-md-9 row-spaced">
												<h3>Update a note</h3>
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
													value={this.state.updateContent}
													onChange={(v) => this.changeState("updateContent", v)}
													format={(v) => v}
												/>
											</div>

											<div className="col-md-12">
												<div className="right-buttons">
													<button
														onClick={() => this.updateNote(close)}
														disabled={!this.state.updateContent
															|| this.state.updateContent.length < 3
															|| this.state.updateContent === this.props.note.content}>
														<i className="fas fa-edit"/> Update note
													</button>
												</div>
											</div>
										</div>
									)}
								</Popup>
								<DialogConfirmation
									text={"Are you sure you want to delete this note?"}
									trigger={
										<button
											className="red-button small-button">
											<i className="far fa-trash-alt"/>
										</button>
									}
									afterConfirmation={() => this.deleteNote()}
								/>
							</div>}
					</div>
				</div>
			</div>
		);
	}
}
