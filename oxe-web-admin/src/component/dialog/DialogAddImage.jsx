import React from "react";
import "./DialogAddImage.css";
import Popup from "reactjs-popup";
import { NotificationManager as nm } from "react-notifications";
import Dropzone from "react-dropzone";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import { Breadcrumb } from "react-bootstrap";
import { postRequest, getForeignImage } from "../../utils/request.jsx";
import { validateUrl, validateWord } from "../../utils/re.jsx";
import Chip from "../button/Chip.jsx";
import Message from "../box/Message.jsx";

export default class DialogAddImage extends React.Component {
	constructor(props) {
		super(props);

		this.onDrop = this.onDrop.bind(this);
		this.onCrop = this.onCrop.bind(this);
		this.onValidate = this.onValidate.bind(this);
		this.backToImageSelection = this.backToImageSelection.bind(this);
		this.backToImageCropping = this.backToImageCropping.bind(this);
		this.backToKeywordSelection = this.backToKeywordSelection.bind(this);

		this.state = {
			cropper: null,

			imageName: null,
			imageSize: null,
			imageContent: null,

			croppedImageContent: null,
			keywords: "",
			word: "",
			areKeywordsDefined: false,

			link: "",
		};
	}

	componentDidUpdate(_, prevState) {
		if (prevState.link !== this.state.link) {
			if (validateUrl(this.state.link)) {
				getForeignImage.call(this, this.state.link, (blob) => {
					const reader = new FileReader();

					reader.onabort = () => console.log("file reading was aborted");
					reader.onerror = () => console.log("An error happened while reading the file");
					reader.onload = () => {
						const imageUrl = URL.createObjectURL(blob);

						this.setState({
							imageName: blob.name,
							imageSize: blob.size,
							imageContent: imageUrl,
						});
					};

					reader.readAsArrayBuffer(blob);
				}, (response) => {
					nm.warning(response.statusText);
				}, (error) => {
					nm.error(error.message);
				});
			} else {
				nm.warning("The provided URL does not have the right format");
			}
		}
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

	onKeywordSelectionValidation() {
		this.setState({
			areKeywordsDefined: true,
		});
	}

	onValidate(close) {
		const params = {
			image: this.state.croppedImageContent,
		};

		postRequest.call(this, "media/add_image", params, (image) => {
			nm.info("The image has been added");

			const params2 = {
				id: image.id,
				keywords: this.state.keywords,
			};

			postRequest.call(this, "media/update_image", params2, () => {
				if (this.props.afterValidate !== undefined) this.props.afterValidate();

				this.backToImageSelection();
				close();
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

	backToKeywordSelection() {
		this.setState({
			areKeywordsDefined: false,
		});
	}

	addKeyword(word) {
		let words;

		if (this.state.keywords) {
			words = (this.state.keywords + " " + word).toLowerCase();
		} else {
			words = word.toLowerCase();
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
						<h2>{this.state.imageContent !== null
							&& this.state.croppedImageContent === null ? "Crop" : "Add"} the new image</h2>
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
								active={false}
								onClick={this.backToImageSelection}>
                                Choose Image
							</Breadcrumb.Item>
                            &nbsp;&gt;&nbsp;
							<Breadcrumb.Item
								active={this.state.imageContent === null}
								onClick={this.backToImageCropping}>
                                Crop Image
							</Breadcrumb.Item>
							&nbsp;&gt;&nbsp;
							<Breadcrumb.Item
								active={this.state.croppedImageContent === null}
								onClick={this.backToImageCropping}>
                                Add keywords
							</Breadcrumb.Item>
                            &nbsp;&gt;&nbsp;
							<Breadcrumb.Item
								active={!this.state.areKeywordsDefined}
								onClick={this.backToKeywordSelection}>
                                Upload Image
							</Breadcrumb.Item>
						</Breadcrumb>

						{!this.state.imageContent
							&& <div>
								<div className={"FormLine"}>
									<div className={"row"}>
										<div className={"col-md-12"}>
											<div className={"FormLine-label"}>
												Paste the link here
											</div>
										</div>
										<div className={"col-md-12"}>
											<input
												value={this.state.link}
												onChange={(v) => this.changeState("link", v.target.value)}
											/>
										</div>
									</div>
								</div>

								<div className={"DialogAddImage-or"}>or</div>

								<Dropzone
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
							</div>
						}

						{this.state.imageContent !== null && this.state.croppedImageContent === null
							&& <Cropper
								className={"DialogAddImage-cropper"}
								src={this.state.imageContent}
								guides={true}
								autoCropArea={1}
								onInitialized={(instance) => this.changeState("cropper", instance) }
							/>
						}

						{this.state.imageContent !== null
							&& this.state.croppedImageContent !== null
							&& !this.state.areKeywordsDefined
							&& <div className="row">
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
									{this.state.keywords
										? this.state.keywords.split(" ").map((w) => <Chip
											key={w}
											label={w}
											value={w}
											onClick={(v) => this.deleteKeyword(v)}
										/>)
										: <Message
											text={"No keyword for this image"}
											height={150}
										/>
									}
								</div>
							</div>
						}

						{this.state.imageContent !== null && this.state.croppedImageContent !== null
							&& this.state.areKeywordsDefined
							&& <div
								className={"DialogAddImage-cropped-image"}>
								<img src={this.state.croppedImageContent}/>
							</div>
						}
					</div>

					{this.state.croppedImageContent !== null
						&& !this.state.areKeywordsDefined
						&& <div className={"right-buttons"}>
							<button
								data-hover="Validate keywords"
								data-active=""
								onClick={() => this.onKeywordSelectionValidation()}>
								<span><i className="far fa-check-circle"/> Validate keywords</span>
							</button>
							<button
								className={"grey-background"}
								data-hover="Back to image cropping"
								data-active=""
								onClick={this.backToImageCropping}>
								<span><i className="far fa-arrow-alt-circle-left"/> Back to image cropping</span>
							</button>
						</div>
					}

					{this.state.croppedImageContent !== null
						&& this.state.areKeywordsDefined
						&& <div className={"right-buttons"}>
							<button
								data-hover="Validate image"
								data-active=""
								onClick={() => this.onValidate(close)}>
								<span><i className="far fa-check-circle"/> Upload</span>
							</button>
							<button
								className={"grey-background"}
								data-hover="Back to keyword selection"
								data-active=""
								onClick={this.backToKeywordSelection}>
								<span><i className="far fa-arrow-alt-circle-left"/> Back to keyword selection</span>
							</button>
						</div>
					}

					{this.state.croppedImageContent === null
						&& this.state.imageContent !== null
						&& <div className={"right-buttons"}>
							<button
								data-hover="Crop image"
								data-active=""
								onClick={this.onCrop}>
								<span><i className="far fa-check-circle"/> Crop</span>
							</button>
							<button
								className={"grey-background"}
								data-hover="Back to image selection"
								data-active=""
								onClick={this.backToImageSelection}>
								<span><i className="far fa-arrow-alt-circle-left"/> Back to image selection</span>
							</button>
						</div>
					}

					{this.state.croppedImageContent === null
						&& this.state.imageContent === null
						&& <div className={"right-buttons"}>
							<button
								className={"grey-background"}
								data-hover="Close"
								data-active=""
								onClick={close}>
								<span><i className="far fa-times-circle"/> Close</span>
							</button>
						</div>
					}
				</div>
				}
			</Popup>
		);
	}
}
