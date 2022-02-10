import React from "react";
import "./MediaDocument.css";
import { NotificationManager as nm } from "react-notifications";
import Loading from "../box/Loading.jsx";
import Message from "../box/Message.jsx";
import Document from "../item/Document.jsx";
import { getRequest } from "../../utils/request.jsx";
import DialogAddDocument from "../dialog/DialogAddDocument.jsx";
import CheckBox from "../button/CheckBox.jsx";
import { dictToURI } from "../../utils/url.jsx";
import FormLine from "../button/FormLine.jsx";

export default class MediaDocument extends React.Component {
	constructor(props) {
		super(props);

		this.refresh = this.refresh.bind(this);

		this.state = {
			documents: null,
			page: 1,
			search: null,
			order: "desc",
			showLoadMoreButton: true,
		};
	}

	componentDidMount() {
		this.refresh();
	}

	componentDidUpdate(_, prevState) {
		if (prevState.order !== this.state.order
			|| (prevState.search !== this.state.search
				&& MediaDocument.isSearchValid(this.state.search))) {
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

	static isSearchValid(search) {
		return !search || search.length > 2;
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	render() {
		return (
			<div id="MediaDocument" className="page max-sized-page">
				<div className={"row"}>
					<div className="col-md-12">
						<h1>Documents</h1>
						<div className="top-right-buttons">
							<button
								onClick={() => this.refresh()}>
								<i className="fas fa-redo-alt"/>
							</button>
							<DialogAddDocument
								trigger={
									<button
										className={"blue-background"}
										data-hover="Filter">
										<span><i className="fas fa-plus"/></span>
									</button>
								}
								afterValidate={this.refresh}
							/>
						</div>
					</div>
				</div>

				<div className={"row row-spaced"}>
					<div className="col-md-6">
						<FormLine
							label={"Search"}
							value={this.state.search}
							onChange={(v) => this.changeState("search", v)}
							labelWidth={4}
							format={() => MediaDocument.isSearchValid(this.state.search)}
						/>
					</div>
					<div className="col-md-6">
						<div className="MediaDocument-buttons">
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
				</div>

				<div className={"row row-spaced"}>
					<div className="col-md-12">
						{this.state.documents === null
							&& <Loading
								height={300}
							/>
						}

						{this.state.documents && this.state.documents.length === 0
							&& <Message
								text={"No document in the library"}
								height={300}
							/>
						}

						{this.state.documents && this.state.documents.length !== 0
							&& <div className="row">
								{this.state.documents.map((i) => i).map((i) => (
									<div
										key={"Document-" + i.id}
										className="col-md-4 col-sm-6">
										<Document
											id={i.id}
											filename={i.filename}
											creationDate={i.creation_date}
											afterDeletion={() => this.refresh()}
										/>
									</div>
								))}
							</div>
						}
					</div>
				</div>

				<div className={"row row-spaced"}>
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
		);
	}
}
