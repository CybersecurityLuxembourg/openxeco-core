import React from "react";
import "./ArticleVersion.css";
import Popup from "reactjs-popup";
import { NotificationManager as nm } from "react-notifications";
import { getRequest, postRequest } from "../../../utils/request.jsx";
import FormLine from "../../button/FormLine.jsx";
import Loading from "../../box/Loading.jsx";
import Message from "../../box/Message.jsx";
import Table from "../../table/Table.jsx";
import DialogConfirmation from "../../dialog/DialogConfirmation.jsx";
import DialogConfirmationWithTextField from "../../dialog/DialogConfirmationWithTextField.jsx";

export default class ArticleVersion extends React.Component {
	constructor(props) {
		super(props);

		this.refresh = this.refresh.bind(this);
		this.copyArticleVersion = this.copyArticleVersion.bind(this);
		this.deleteArticleVersion = this.deleteArticleVersion.bind(this);
		this.addArticleVersion = this.addArticleVersion.bind(this);
		this.setArticleVersionAsMain = this.setArticleVersionAsMain.bind(this);
		this.changeState = this.changeState.bind(this);

		this.state = {
			versions: null,
			newVersionName: null,
		};
	}

	componentDidMount() {
		this.refresh();
	}

	refresh() {
		getRequest.call(this, "article/get_article_versions/" + this.props.id, (data) => {
			this.setState({
				versions: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	copyArticleVersion(id, name) {
		const params = {
			article_version_id: id,
			name,
		};

		postRequest.call(this, "article/copy_article_version", params, () => {
			this.refresh();
			nm.info("The version has been copied");
		}, (response) => {
			this.refresh();
			nm.warning(response.statusText);
		}, (error) => {
			this.refresh();
			nm.error(error.message);
		});
	}

	deleteArticleVersion(id) {
		const params = {
			id,
		};

		postRequest.call(this, "article/delete_article_version", params, () => {
			this.refresh();
			nm.info("The version has been deleted");
		}, (response) => {
			this.refresh();
			nm.warning(response.statusText);
		}, (error) => {
			this.refresh();
			nm.error(error.message);
		});
	}

	setArticleVersionAsMain(id) {
		const params = {
			id,
		};

		postRequest.call(this, "article/set_article_version_as_main", params, () => {
			this.refresh();
			nm.info("The version has been set as main");
		}, (response) => {
			this.refresh();
			nm.warning(response.statusText);
		}, (error) => {
			this.refresh();
			nm.error(error.message);
		});
	}

	addArticleVersion(close) {
		const params = {
			article_id: this.props.id,
			name: this.state.newVersionName,
		};

		postRequest.call(this, "article/add_article_version", params, () => {
			this.refresh();
			if (close) {
				close();
			}
			nm.info("The version has been added");
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
		if (this.props.node) {
			return <Message
				text={"Not applicable on remote article"}
				height={300}
			/>;
		}

		if (!this.state.versions) {
			return <Loading height={300}/>;
		}

		const columns = [
			{
				Header: "Name",
				accessor: "name",
			},
			{
				Header: "Main",
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					value.is_main === 1
						? <div>
							<i className="far fa-star"/>
						</div>
						: ""
				),
				width: 50,
				maxWidth: 50,
			},
			{
				Header: " ",
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					<div>
						<DialogConfirmation
							text={"Are you sure you want to delete this version?"}
							trigger={
								<button
									className={"small-button red-background Table-right-button"}
									disabled={value.is_main === 1}>
									<i className="fas fa-trash-alt"/>
								</button>
							}
							afterConfirmation={() => this.deleteArticleVersion(value.id)}
						/>
						<DialogConfirmationWithTextField
							fieldName={"Version name"}
							text={"Choose a name for the new version:"}
							trigger={
								<button
									className={"small-button Table-right-button"}>
									<i className="far fa-copy"/>
								</button>
							}
							afterConfirmation={(newName) => this.copyArticleVersion(value.id, newName)}
						/>
						<DialogConfirmation
							text={"Are you sure you want to set this version as the main one?"}
							trigger={
								<button
									className={"small-button Table-right-button"}
									disabled={value.is_main === 1}>
									<i className="far fa-star"/>
								</button>
							}
							afterConfirmation={() => this.setArticleVersionAsMain(value.id)}
						/>
					</div>
				),
				width: 50,
				maxWidth: 50,
			},
		];

		return (
			<div className={"row row-spaced"}>
				<div className="col-md-12">
					<div className={"row"}>
						<div className="col-md-9">
							<h2>Version</h2>
						</div>

						<div className="col-md-3">
							<div className="top-right-buttons">
								<Popup
									trigger={
										<button
											disabled={!this.props.editable}>
											<i className="fas fa-plus"/>
										</button>
									}
									modal
								>
									{(close) => <div className={"row row-spaced"}>
										<div className={"col-md-9"}>
											<h2>Add a new version</h2>
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
												label={"Name"}
												value={this.state.newVersionName}
												onChange={(v) => this.changeState("newVersionName", v)}
											/>
										</div>

										<div className="col-md-12 right-buttons">
											<button
												onClick={() => this.addArticleVersion(close)}
												disabled={this.state.newVersionName === null
													|| this.state.newVersionName.length < 2}>
												<i className="fas fa-plus"/> Add a new version
											</button>
										</div>
									</div>}
								</Popup>
							</div>
						</div>

						<div className="col-md-12">
							<Table
								columns={columns}
								data={this.state.versions}
								showBottomBar={true}
								useFlexLayout={true}
							/>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
