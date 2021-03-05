import React, { useRef } from "react";
import "./DialogAddImage.css";
import Popup from "reactjs-popup";
import _ from "lodash";
import { NotificationManager as nm } from "react-notifications";
import Loading from "../box/Loading";
import Dropzone from "react-dropzone";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import { Breadcrumb } from "react-bootstrap";
import { getRequest, postRequest } from "../../utils/request";
import FormLine from "../button/FormLine";

export default class DialogAddImage extends React.Component {
	constructor(props) {
		super(props);

		this.onDrop = this.onDrop.bind(this);
		this.onCrop = this.onCrop.bind(this);
		this.onValidate = this.onValidate.bind(this);
		this.backToImageSelection = this.backToImageSelection.bind(this);
		this.backToImageCropping = this.backToImageCropping.bind(this);

		this.state = {
			open: false,

			cropper: null,

			imageName: null,
			imageSize: null,
			imageContent: null,

			croppedImageContent: null,
		};
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
	}

	onDrop(files) {
		if (files.length === 0) {
			nm.warning("No file has been detected. Please re-check the file extension.");
			this.setState({
				imageName: null,
				imageSize: null,
				imageContent: null,
			});
		} else {
			const reader = new FileReader();

			reader.onabort = () => console.log("file reading was aborted");
			reader.onerror = () => console.log("An error happened while reading the file");
			reader.onload = () => {
				const blob = new Blob([reader.result], { type: files[0].type });
				const imageUrl = URL.createObjectURL(blob);
				this.setState({
					imageName: files[0].name,
					imageSize: files[0].size,
					imageContent: imageUrl,
				});
			};

			reader.readAsArrayBuffer(files[0]);
		}
	}

	onCrop() {
		if (this.state.cropper !== null) {
			this.setState({ croppedImageContent: this.state.cropper.getCroppedCanvas().toDataURL() });
		}
	}

	onValidate() {
		const params = {
			image: this.state.croppedImageContent,
		};

		postRequest.call(this, "media/add_image", params, (response) => {
			if (this.props.afterValidate !== undefined) this.props.afterValidate();

			this.backToImageSelection();
			this.cancel();
			nm.info("The image has been added");
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	backToImageSelection() {
		this.setState({
			imageContent: null,
			croppedImageContent: null,
		});
	}

	backToImageCropping() {
		this.setState({
			croppedImageContent: null,
		});
	}

	cancel() {
		document.elementFromPoint(100, 0).click();
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
				onOpen={() => this.changeState("open", true)}
				onClose={() => this.changeState("open", false)}
				closeOnDocumentClick
			>
				<div className={"row"}>
					<div className={"col-md-12"}>
						<h2>{this.state.imageContent !== null
                            && this.state.croppedImageContent === null ? "Crop" : "Add"} the new image</h2>

						<Breadcrumb>
							<Breadcrumb.Item
								active={false}
								onClick={this.backToImageSelection}>
                                Choose Image
							</Breadcrumb.Item>
                            &nbsp;>&nbsp;
							<Breadcrumb.Item
								active={this.state.imageContent === null}
								onClick={this.backToImageCropping}>
                                Crop Image
							</Breadcrumb.Item>
                            &nbsp;>&nbsp;
							<Breadcrumb.Item
								active={this.state.croppedImageContent === null}>
                                Upload Image
							</Breadcrumb.Item>
						</Breadcrumb>

						{this.state.imageContent === null
							? <Dropzone
								accept=".png,.jpg,.jpeg"
								disabled={false}
								onDrop={this.onDrop}
							>
								{({ getRootProps, getInputProps }) => (
									<div
										className={"DialogAddImage-dragdrop"}
										{...getRootProps()}>
										<input {...getInputProps()} />
										<div className="DialogAddImage-dragdrop-textContent">
											<i className="far fa-image"/>
											<div>Drag and drop the file here</div>
											<div>(must be .jpg, .jpeg or .png)</div>
										</div>
									</div>
								)}
							</Dropzone>
							: this.state.croppedImageContent === null
								? <Cropper
									className={"DialogAddImage-cropper"}
									src={this.state.imageContent}
									initialAspectRatio={16 / 9}
									guides={false}
									onInitialized={(instance) => this.changeState("cropper", instance) }
								/>
								: <img
									className={"DialogAddImage-cropped-image"}
									src={this.state.croppedImageContent}
								/>
						}
					</div>
				</div>

				{this.state.croppedImageContent !== null
					? <div className={"bottom-right-buttons"}>
						<button
							className={"grey-background"}
							data-hover="Back to image cropping"
							data-active=""
							onClick={this.backToImageCropping}>
							<span><i className="far fa-arrow-alt-circle-left"/> Back to image cropping</span>
						</button>
						<button
							data-hover="Validate image"
							data-active=""
							onClick={this.onValidate}>
							<span><i className="far fa-check-circle"/> Upload</span>
						</button>
					</div>
					: this.state.imageContent !== null
						? <div className={"bottom-right-buttons"}>
							<button
								className={"grey-background"}
								data-hover="Back to image selection"
								data-active=""
								onClick={this.backToImageSelection}>
								<span><i className="far fa-arrow-alt-circle-left"/> Back to image selection</span>
							</button>
							<button
								data-hover="Crop image"
								data-active=""
								onClick={this.onCrop}>
								<span><i className="far fa-check-circle"/> Crop</span>
							</button>
						</div>
						: <div className={"bottom-right-buttons"}>
							<button
								className={"grey-background"}
								data-hover="Close"
								data-active=""
								onClick={this.cancel}>
								<span><i className="far fa-times-circle"/> Close</span>
							</button>
						</div>
				}
			</Popup>
		);
	}
}
