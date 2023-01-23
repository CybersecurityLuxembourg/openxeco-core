import React from "react";
import "./DialogSelectDocument.css";
import Popup from "reactjs-popup";
import { NotificationManager as nm } from "react-notifications";
import Document from "../item/Document.jsx";
import { getRequest } from "../../utils/request.jsx";
import Loading from "../box/Loading.jsx";
import Message from "../box/Message.jsx";
import DialogAddImage from "./DialogAddImage.jsx";
import CheckBox from "../button/CheckBox.jsx";
import { dictToURI } from "../../utils/url.jsx";

export default class DialogSelectDocument extends React.Component {
	constructor(props) {
		super(props);

		this.refresh = this.refresh.bind(this);
		this.onSelect = this.onSelect.bind(this);

		this.state = {
			documents: null,
			page: 1,
			search: null,
			order: "desc",
			showLogoOnly: false,
			showLoadMoreButton: true,
		};
	}

	componentDidUpdate(_, prevState) {
		if (prevState.showLogoOnly !== this.state.showLogoOnly
			|| prevState.order !== this.state.order
			|| (prevState.search !== this.state.search
				&& DialogSelectDocument.isSearchValid(this.state.search))) {
			this.refresh();
		}
	}

	refresh() {
		this.setState({
			documents: null,
			page: 1,
		}, () => {
			this.fetchDocuments();
		});
	}

	fetchDocuments() {
		const params = {
			order: this.state.order,
			page: this.state.page,
			search: this.state.search,
		};

		getRequest.call(this, "public/get_public_documents?" + dictToURI(params), (data) => {
			this.setState({
				documents: (this.state.documents === null ? [] : this.state.documents).concat(data.items),
				page: this.state.page + 1,
				showLoadMoreButton: data.pagination.page < data.pagination.pages,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	onSelect(id, close) {
		if (this.props.validateSelection !== undefined) {
			this.props.validateSelection(id);
			close();
		}
	}

	static isSearchValid(search) {
		return !search || search.length > 2;
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	render() {
		return (
			<Popup
				className={"Popup-small-size DialogSelectDocument"
					+ (this.state.open ? " DialogSelectDocument-opened" : "")}
				trigger={this.props.trigger}
				onOpen={this.refresh}
				modal
				closeOnDocumentClick
			>
				{(close) => <div className={"row DialogSelectDocument-content"}>
					<div className="col-md-12">
						<div className="top-right-buttons">
							<DialogAddImage
								trigger={
									<button
										className={"blue-background"}
										data-hover="Filter">
										<span><i className="fas fa-plus"/></span>
									</button>
								}
								afterValidate={this.refresh}
							/>
							<button
								className={"grey-background"}
								data-hover="Close"
								data-active=""
								onClick={close}>
								<span><i className="far fa-times-circle"/></span>
							</button>
						</div>
						<h2>Select document</h2>
					</div>

					<div className="col-md-6 row-spaced">
						<div className={"FormLine"}>
							<div className={"row"}>
								<div className={"col-md-4"}>
									<div className={"FormLine-label"}>
										Search
									</div>
								</div>
								<div className={"col-md-8"}>
									<input
										value={this.state.search}
										onChange={(v) => this.changeState("search", v.target.value)}
									/>
								</div>
							</div>
						</div>
					</div>

					<div className="col-md-6">
						<div className="DialogSelectDocument-buttons">
							<CheckBox
								label={this.state.order === "asc" ? "OLDEST FIRST" : "NEWEST FIRST"}
								value={this.state.order !== "asc"}
								onClick={() => this.changeState(
									"order",
									this.state.order === "asc" ? "desc" : "asc",
								)}
							/>
						</div>
					</div>

					<div className={"col-md-12"}>
						{this.state.documents === null
							&& <Loading
								height={300}
							/>
						}

						{this.state.documents !== null && this.state.documents.length === 0
							&& <Message
								text={"No document in the library"}
								height={300}
							/>
						}

						{this.state.documents !== null && this.state.documents.length > 0
							&& <div className="row row-spaced">
								{this.state.documents.map((i) => (
									<div
										key={i.id}
										className="col-md-2 col-sm-3">
										<Document
											id={i.id}
											filename={i.filename}
											creationDate={i.creation_date}
											afterDeletion={() => this.refresh()}
										/>
										<div className="DialogSelectDocument-select-button">
											<button
												data-hover="Select"
												data-active=""
												onClick={() => this.onSelect(i.id, close)}>
												<span>Select</span>
											</button>
										</div>
									</div>
								))}
							</div>
						}
					</div>

					<div className="col-md-12">
						<div className="row row-spaced">
							<div className="col-md-12 centered-buttons">
								{this.state.showLoadMoreButton
									? <button
										className={"blue-background"}
										onClick={() => this.fetchDocuments()}>
										<i className="fas fa-plus"/> Load more documents
									</button>
									: <button
										className={"blue-background"}
										disabled={true}>
										No more document to load
									</button>
								}
							</div>
						</div>
					</div>
				</div>
				}
			</Popup>
		);
	}
}
