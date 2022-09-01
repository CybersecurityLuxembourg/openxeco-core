import React from "react";
import "./EditImage.css";
import Dropzone from "react-dropzone";
import { NotificationManager as nm } from "react-notifications";
import { postRequest } from "../../../utils/request.jsx";
import { getApiURL } from "../../../utils/env.jsx";

export default class EditImage extends React.Component {
	constructor(props) {
		super(props);

		this.saveImage = this.saveImage.bind(this);
		this.onDrop = this.onDrop.bind(this);

		this.state = {
			imageContent: null,
		};
	}

	saveImage(newImageValue) {
		this.setState({
			imageContent: null,
		}, () => {
			const params = {
				id: this.props.article.id,
				image: newImageValue,
			};

			postRequest.call(this, "private/update_my_article", params, () => {
				this.props.refreshArticle();
				nm.info("The image has been updated");
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		});
	}

	onDrop(files) {
		if (files.length === 0) {
			nm.warning("No file has been detected. Please re-check the file extension.");
			this.setState({
				imageContent: null,
			});
		} else {
			const reader = new FileReader();

			reader.onabort = () => nm.error("File reading was aborted");
			reader.onerror = () => nm.error("An error happened while reading the file");
			reader.onload = () => {
				this.setState({ imageContent: reader.result, importError: null });
			};

			reader.readAsDataURL(files[0]);
		}
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	render() {
		return (
			<div id="EditImage" className="row">
				<div className="col-md-12 row-spaced">
					<h3>Select an image for the article</h3>
				</div>

				<div className="col-md-12 row-spaced EditImage-center">
					{this.props.article.image
						&& <img
							className="EditImage-logo-change"
							src={
								getApiURL()
								+ "public/get_public_image/"
								+ this.props.article.image
							}
						/>
					}

					{this.state.imageContent
						&& <img
							className="EditImage-logo-change"
							src={this.state.imageContent}
						/>
					}

					{!this.props.article.image && !this.state.imageContent
						&& <Dropzone
							accept=".png,.jpg,.jpeg"
							disabled={false}
							onDrop={this.onDrop}
						>
							{({ getRootProps, getInputProps }) => (
								<div
									className={"EditImage-dragdrop"}
									{...getRootProps()}>
									<input {...getInputProps()} />
									<div className="EditImage-dragdrop-textContent">
										<i className="far fa-image"/>
										<div>Drag and drop the file here</div>
										<div>must be .jpg, .jpeg or .png</div>
										<div>maximum size of 500x500 size</div>
									</div>
								</div>
							)}
						</Dropzone>
					}
				</div>

				<div className="col-md-12 row-spaced">
					<div className={"right-buttons block-buttons"}>
						<button
							className={"blue-background"}
							disabled={!this.state.imageContent}
							onClick={() => this.saveImage(this.state.imageContent)}
						>
							<i className="fas fa-save"/> Save the selected image
						</button>
						<button
							className={"blue-background"}
							disabled={!this.props.article.image && !this.state.imageContent}
							onClick={() => this.saveImage(null)}
						>
							<i className="fas fa-trash-alt"/> Remove the current image
						</button>
					</div>
				</div>
			</div>
		);
	}
}
