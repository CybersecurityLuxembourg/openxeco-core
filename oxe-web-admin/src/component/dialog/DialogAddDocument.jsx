import React from "react";
import "./DialogAddDocument.css";
import Popup from "reactjs-popup";
import { NotificationManager as nm } from "react-notifications";
import Dropzone from "react-dropzone";
import { Breadcrumb } from "react-bootstrap";
import { postRequest } from "../../utils/request.jsx";

export default class DialogAddDocument extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			document: null,
			filename: null,
			size: null,
		};
	}

	onDrop(files) {
		console.log(files);
		if (files.length === 0) {
			nm.warning("No file has been detected. Please re-check the file extension.");
			this.setState({
				document: null,
				filename: null,
				size: null,
			});
		} else {
			const reader = new FileReader();

			reader.onabort = () => console.log("file reading was aborted");
			reader.onerror = () => console.log("An error happened while reading the file");
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

	onValidate(close) {
		const params = {
			data: this.state.document,
			filename: this.state.filename,
		};

		postRequest.call(this, "media/add_document", params, () => {
			if (this.props.afterValidate !== undefined) this.props.afterValidate();
			close();
			this.setState({
				document: null,
				filename: null,
				size: null,
			});
			nm.info("The document has been added");
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
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
								onClick={() => this.setState({
									document: null,
									filename: null,
									size: null,
								})}>
                                Choose Document
							</Breadcrumb.Item>
                            &nbsp;&gt;&nbsp;
							<Breadcrumb.Item
								active={!this.state.document}>
                                Upload Document
							</Breadcrumb.Item>
						</Breadcrumb>

						{!this.state.document
							? <div className={"row"}>
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
							: <div className={"row"}>
								<div className={"col-md-12"}>
									<div className="DialogAddDocument-textContent">
										<i className="fas fa-file"/>
										<div>{this.state.filename}</div>
									</div>
								</div>
								<div className={"col-md-12"}>
									<div className={"right-buttons"}>
										<button
											data-hover="Validate image"
											data-active=""
											onClick={() => this.onValidate(close)}>
											<span><i className="far fa-check-circle"/> Upload</span>
										</button>
										<button
											className={"grey-background"}
											data-active=""
											onClick={() => this.setState({
												document: null,
												filename: null,
												size: null,
											})}>
											<span><i className="far fa-arrow-alt-circle-left"/> Back to document selection</span>
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
