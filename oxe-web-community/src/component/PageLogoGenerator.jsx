import React from "react";
import "./PageLogoGenerator.css";
import ReactToPdf from "react-to-pdf";
import { NotificationManager as nm } from "react-notifications";
import { getRequest } from "../utils/request.jsx";
import { getApiURL } from "../utils/env.jsx";
import { getUrlParameter } from "../utils/url.jsx";
import FormLine from "./form/FormLine.jsx";
import Message from "./box/Message.jsx";
import Loading from "./box/Loading.jsx";
import DialogHint from "./dialog/DialogHint.jsx";

export default class PageLogoGenerator extends React.Component {
	constructor(props) {
		super(props);

		this.drawAllWithText = this.drawAllWithText.bind(this);
		this.drawAllWithEntity = this.drawAllWithEntity.bind(this);
		this.getImageIds = this.getImageIds.bind(this);

		this.state = {
			text: getUrlParameter("text")
				? getUrlParameter("text").replace("%20", " ")
				: "Type text here",
			subtext: getUrlParameter("subtext")
				? getUrlParameter("subtext").replace("%20", " ")
				: "",
			selectedEntityId: null,
			selectedEntity: null,
			withTransparentBackground: true,
			includedImages: null,
			canvas: [{
				id: "canvas-text-1",
				status: "Member of the ecosystem",
				width: 250,
				height: 150,
				logo: {
					show: true,
					position: "middle",
				},
			},
			{
				id: "canvas-text-2",
				status: "Member of the ecosystem",
				width: 350,
				height: 75,
				logo: {
					show: true,
					position: "left",
				},
			},
			{
				id: "canvas-text-3",
				status: "Member of the ecosystem",
				width: 400,
				height: 100,
				logo: {
					show: true,
					position: "left",
				},
			}],
			entityCanvas: [{
				id: "canvas-text-101",
				status: "Member of the ecosystem",
				width: 250,
				height: 150,
				logo: {
					show: true,
					position: "middle",
				},
			},
			{
				id: "canvas-text-102",
				status: "Member of the ecosystem",
				width: 350,
				height: 75,
				logo: {
					show: true,
					position: "left",
				},
			},
			{
				id: "canvas-text-103",
				status: "Member of the ecosystem",
				width: 400,
				height: 100,
				logo: {
					show: true,
					position: "left",
				},
			}],
		};
	}

	componentDidMount() {
		this.drawAllWithText();
		this.drawAllWithEntity();
		this.getImagesIncludedInGenerator();
	}

	componentDidUpdate(_, prevState) {
		if (prevState.text !== this.state.text
			|| prevState.subtext !== this.state.subtext) {
			this.drawAllWithText();
		}

		if (prevState.selectedEntityId !== this.state.selectedEntityId) {
			this.getEntity();
		}

		if (prevState.selectedEntity !== this.state.selectedEntity) {
			this.drawAllWithEntity();
		}

		if (prevState.withTransparentBackground !== this.state.withTransparentBackground
			|| prevState.includedImages !== this.state.includedImages) {
			this.drawAllWithText();
			this.drawAllWithEntity();
		}
	}

	getImagesIncludedInGenerator() {
		this.setState({ includedImages: null }, () => {
			getRequest.call(this, "media/get_images?is_in_generator=true", (data) => {
				this.setState({
					includedImages: data.items,
				});
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		});
	}

	getEntity() {
		if (!this.state.selectedEntityId) {
			this.setState({ selectedEntity: null });
		} else {
			getRequest.call(this, "public/get_public_entity/"
				+ this.state.selectedEntityId, (data) => {
				this.setState({
					selectedEntity: data,
				});
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		}
	}

	drawAllWithText() {
		this.state.canvas.map((c) => {
			this.drawWithProjectLogo(c);
			return null;
		});
	}

	drawAllWithEntity() {
		this.state.entityCanvas.map((c) => {
			this.drawWithProjectLogoAndEntityLogo(c);
			return null;
		});
	}

	drawWithProjectLogo(c) {
		// Get the logo image

		const imageIds = this.getImageIds();
		const imagesSrcs = imageIds
			.map((i) => getApiURL() + "public/get_public_image/" + i);

		Promise.all(imagesSrcs.map(PageLogoGenerator.loadImage)).then((images) => {
			// Init the canvas

			images.forEach((image, i) => {
				const drawing = document.getElementById(c.id + "-" + imageIds[i]);
				if (!drawing) {
					return;
				}
				const con = drawing.getContext("2d");

				// Clear the previous content

				con.beginPath();
				con.clearRect(0, 0, c.width, c.height);
				con.stroke();

				drawing.width = c.width;
				drawing.height = c.height;

				if (!this.state.withTransparentBackground) {
					con.fillStyle = "white";
					con.rect(0, 0, c.width, c.height);
					con.fill();
				}

				// Integrate logo

				let imageHeight = c.logo.position === "middle" ? c.height - 60 : c.height - 20;
				let imageWidth = Math.round(imageHeight * (image.width / image.height));

				if (c.logo.position === "middle" && imageWidth > (c.width - 20)) {
					imageWidth = c.width - 20;
					imageHeight = imageWidth * (image.height / image.width);
				}

				con.drawImage(
					image,
					c.logo.position === "middle" ? Math.round((c.width / 2) - (imageWidth / 2)) : 10,
					c.logo.position === "middle" ? 10 + ((c.height - 60) / 2) - (imageHeight / 2) : 10,
					imageWidth,
					imageHeight,
				);

				// Write the text

				if (!this.state.subtext) {
					con.fillStyle = "black";
					con.textAlign = c.logo.position === "middle" ? "center" : "left";
					con.textBaseline = c.logo.position === "middle" ? "middle" : "middle";
					con.font = c.logo.position === "middle"
						? "30px Fjalla One"
						: PageLogoGenerator.getFittingFontSize(
							con,
							this.state.text,
							c.width - imageWidth - 20,
							c.height - 40,
						) + "px Fjalla One";

					con.fillText(
						this.state.text,
						c.logo.position === "middle" ? c.width / 2 : 25 + imageWidth,
						c.logo.position === "middle" ? c.height - 22 : c.height / 2 + 2,
						c.logo.position === "middle" ? c.width - 20 : c.width - imageWidth - 45,
						c.logo.position === "middle" ? c.height - 20 - imageHeight : c.height - 20,
					);
				} else {
					// Integrate main text

					con.fillStyle = "black";
					con.textAlign = c.logo.position === "middle" ? "center" : "left";
					con.textBaseline = c.logo.position === "middle" ? "middle" : "middle";
					con.font = c.logo.position === "middle"
						? "20px Fjalla One"
						: PageLogoGenerator.getFittingFontSize(
							con,
							this.state.text,
							c.width - imageWidth - 45,
							((c.height - 20) / 3) * 2,
						) + "px Fjalla One";

					// Integrate subtext

					con.fillText(
						this.state.text,
						c.logo.position === "middle" ? c.width / 2 : 25 + imageWidth,
						c.logo.position === "middle" ? c.height - 32 : 10 + (c.height - 20) / 3,
						c.logo.position === "middle" ? c.width - 20 : c.width - imageWidth - 45,
						c.logo.position === "middle" ? c.height - 20 - imageHeight : ((c.height - 20) / 3) * 2,
					);

					con.fillStyle = "black";
					con.textAlign = c.logo.position === "middle" ? "center" : "left";
					con.textBaseline = c.logo.position === "middle" ? "middle" : "middle";
					con.font = c.logo.position === "middle"
						? "13px Fjalla One"
						: PageLogoGenerator.getFittingFontSize(
							con,
							this.state.text,
							c.width - imageWidth - 45,
							(c.height - 20) / 3,
						) + "px Fjalla One";

					con.fillText(
						this.state.subtext,
						c.logo.position === "middle" ? c.width / 2 : 25 + imageWidth,
						c.logo.position === "middle" ? c.height - 10 : 22 + (((c.height - 20) / 3) * 2),
						c.logo.position === "middle" ? c.width - 20 : c.width - imageWidth - 45,
						c.logo.position === "middle" ? c.height - 20 - imageHeight : (c.height - 20) / 3,
					);
				}

				con.textBaseline = "alphabetic";
			});
		});
	}

	drawWithProjectLogoAndEntityLogo(c) {
		if (!this.state.selectedEntity || !this.state.selectedEntity.image) {
			return;
		}

		// Get the logos

		const imageIds = this.getImageIds();
		const imagesSrcs = [getApiURL() + "public/get_public_image/" + this.state.selectedEntity.image]
			.concat(imageIds
				.map((i) => getApiURL() + "public/get_public_image/" + i));

		Promise.all(imagesSrcs.map(PageLogoGenerator.loadImage)).then((images) => {
			const entityImage = images[0];
			images.shift();

			images.forEach((image, i) => {
				// Init the canvas

				const drawing = document.getElementById(c.id + "-" + imageIds[i]);
				if (!drawing) {
					return;
				}
				const con = drawing.getContext("2d");

				// Clear the previous content

				con.beginPath();
				con.clearRect(0, 0, c.width, c.height);
				con.stroke();

				drawing.width = c.width;
				drawing.height = c.height;

				if (!this.state.withTransparentBackground) {
					con.fillStyle = "white";
					con.fillRect(0, 0, c.width, c.height);
				}

				// Integrate project logo

				let imageHeight = c.height - 35;
				let imageWidth = image.width * (imageHeight / image.height);

				if (imageWidth > (c.width - 40) / 2) {
					imageHeight *= ((c.width - 40) / 2) / imageWidth;
					imageWidth = (c.width - 40) / 2;
				}

				con.drawImage(
					image,
					(c.width / 4) - (imageWidth / 2),
					10 + ((c.height - 35) / 2) - (imageHeight / 2),
					imageWidth,
					imageHeight,
				);

				// Integrate entity logo

				imageHeight = c.height - 35;
				imageWidth = entityImage.width * (imageHeight / entityImage.height);

				if (imageWidth > (c.width - 40) / 2) {
					imageHeight *= ((c.width - 40) / 2) / imageWidth;
					imageWidth = (c.width - 40) / 2;
				}

				con.drawImage(
					entityImage,
					((c.width / 4) * 3) - (imageWidth / 2),
					10 + ((c.height - 35) / 2) - (imageHeight / 2),
					imageWidth,
					imageHeight,
				);

				// Write the status

				con.textBaseline = "alphabetic";

				con.fillStyle = "black";
				con.textAlign = "right";
				con.font = "15px 'Fjalla One'";
				con.fillText(c.status, c.width - 10, c.height - 5, c.width - 20, 100);

				// Draw a separation line

				con.lineWidth = 1;
				con.beginPath();
				con.moveTo(Math.round(c.width / 2) + 0.5, 10);
				con.lineTo(Math.round(c.width / 2) + 0.5, c.height - 25);
				con.stroke();
			});
		});
	}

	static getFittingFontSize(context, text, width, height) {
		const contextClone = context;
		let retFontSize = height;

		do {
			retFontSize--;
			contextClone.font = retFontSize + "px 'Fjalla One'";
		} while ((contextClone.measureText(text).width > width
			|| contextClone.measureText(text).height > height)
				&& retFontSize > 0);

		return retFontSize;
	}

	static loadImage(src) {
		return new Promise((resolve, reject) => {
			const img = new Image();
			img.onload = () => resolve(img);
			img.onerror = reject;
			img.src = src;
		});
	}

	getImageIds() {
		return this.state.includedImages
			? this.state.includedImages.map((i) => i.id)
			: [];
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	render() {
		if (!this.state.includedImages) {
			return <div className={"PageLogoGenerator page max-sized-page"}>
				<div className={"row"}>
					<div className="col-md-9">
						<h1>Logo generator</h1>
					</div>

					<div className="col-md-12">
						<Loading
							height={300}
						/>
					</div>
				</div>
			</div>;
		}

		if (this.state.includedImages.length === 0) {
			return <div className={"PageLogoGenerator page max-sized-page"}>
				<div className={"row"}>
					<div className="col-md-9">
						<h1>Logo generator</h1>
					</div>

					<div className="col-md-12">
						<Message
							text="No logo configured by administrators"
							height={300}
						/>
					</div>
				</div>
			</div>;
		}

		return (
			<div className={"PageLogoGenerator page max-sized-page"}>
				<div className={"row"}>
					<div className="col-md-9">
						<h1>Logo generator</h1>
					</div>

					<div className="col-md-3 top-title-menu">
						<DialogHint
							content={
								<div className="row">
									<div className="col-md-12">
										<h2>How to save the generated logo?</h2>

										<p>
											Simply right click on the generated image and
											select &quot;Save image as...&quot;.
										</p>

										<p>
											A window will appear to choose the target
											on your computer file system. By selecting the confirmation
											button, the image will be saved on your computer.
										</p>
									</div>
								</div>
							}
						/>
					</div>
				</div>

				<div className={"row row-spaced"}>
					<div className="col-md-12">
						<FormLine
							label={"Make the background transparent"}
							type={"checkbox"}
							value={this.state.withTransparentBackground}
							onChange={(v) => this.changeState("withTransparentBackground", v)}
						/>
					</div>
				</div>

				<div className={"row row-spaced"}>
					<div className="col-md-12">
						<h2>With a text</h2>
					</div>

					<div className="col-md-12 row-spaced">
						<FormLine
							label="Main text"
							value={this.state.text}
							onChange={(v) => this.changeState("text", v)}
						/>
						<FormLine
							label="Sub text"
							value={this.state.subtext}
							onChange={(v) => this.changeState("subtext", v)}
						/>
					</div>

					{this.getImageIds().map((i) => <div
						key={i}
						className="col-md-12">
						<div className={"row"}>
							{this.state.canvas.map((c) => <div
								key={c.id + "-" + i}
								ref={c.id + "-" + i}
								className="col-md-4 PageLogoGenerator-canvas-wrapper">
								<h3>{c.width}x{c.height}</h3>
								<div>
									<canvas
										id={c.id + "-" + i}
										className="PageLogoGenerator-canvas"
									/>
								</div>
								<div>
									<a
										className={"PageLogoGenerator-download-link"}
										download={c.id + "-" + i + ".png"}
										href=""
										onClick={(el) => {
											const canvas = document.getElementById(c.id + "-" + i);
											const dataURL = canvas.toDataURL("image/png");
											// eslint-disable-next-line no-param-reassign
											el.href = dataURL;
										}}>
										PNG
									</a>
									<a
										className={"PageLogoGenerator-download-link"}
										download={c.id + "-" + i + ".jpg"}
										href=""
										onClick={(el) => {
											const canvas = document.getElementById(c.id + "-" + i);
											const dataURL = canvas.toDataURL("image/jpg");
											// eslint-disable-next-line no-param-reassign
											el.href = dataURL;
										}}>
										JPG
									</a>
									<ReactToPdf
										targetRef={c.id + "-" + i}
										filename={c.id + "-" + i + ".jpg"}
										options={{}}
										x={0.5}
										y={0.5}
										scale={0.8}>
										{({ toPdf }) => (
											<a
												className={"PageLogoGenerator-download-link"}
												download={c.id + "-" + i + ".pdf"}
												href=""
												onClick={toPdf}>
												PDF
											</a>
										)}
									</ReactToPdf>
								</div>
							</div>)}
						</div>
					</div>)}
				</div>

				<div className={"row"}>
					<div className="col-md-12">
						<h2>With an entity logo</h2>
					</div>
				</div>

				<div className={"row row-spaced"}>
					{this.props.myEntities && this.props.myEntities.length > 0
						&& <div className="col-md-12">
							<div className={"row"}>
								<div className="col-md-12 row-spaced">
									<FormLine
										label={"Select your entity"}
										type={"select"}
										value={this.state.selectedEntityId}
										options={this.props.myEntities === null
											|| this.props.myEntities === undefined
											? []
											: this.props.myEntities.map((o) => ({ label: o.name, value: o.id }))
										}
										onChange={(v) => this.changeState("selectedEntityId", v)}
									/>
								</div>

								<div className="col-md-12 row-spaced">
									{!this.state.selectedEntityId
										&& <Message
											text={"Please select a entity"}
											height={300}
										/>
									}

									{this.state.selectedEntity && !this.state.selectedEntity.image
										&& <Message
											text={"The entity does not have a logo"}
											height={300}
										/>
									}

									{this.state.selectedEntityId && !this.state.selectedEntity
										&& <Loading
											height={300}
										/>
									}

									{this.state.selectedEntity && this.state.selectedEntity.image
										&& <div className={"row"}>
											{this.getImageIds().map((i) => <div
												key={i}
												className="col-md-12">
												<div className={"row"}>
													{this.state.entityCanvas.map((c) => <div
														key={c.id + "-" + i}
														className="col-md-4 PageLogoGenerator-canvas-wrapper">
														<h3>{c.width}x{c.height}</h3>
														<canvas
															id={c.id + "-" + i}
															className="PageLogoGenerator-canvas"
														/>
														<div>
															<a
																className={"PageLogoGenerator-download-link"}
																download={c.id + "-" + i + ".png"}
																href=""
																onClick={(el) => {
																	const canvas = document.getElementById(c.id + "-" + i);
																	const dataURL = canvas.toDataURL("image/png");
																	// eslint-disable-next-line no-param-reassign
																	el.href = dataURL;
																}}>
																PNG
															</a>
															<a
																className={"PageLogoGenerator-download-link"}
																download={c.id + "-" + i + ".jpg"}
																href=""
																onClick={(el) => {
																	const canvas = document.getElementById(c.id + "-" + i);
																	const dataURL = canvas.toDataURL("image/jpg");
																	// eslint-disable-next-line no-param-reassign
																	el.href = dataURL;
																}}>
																JPG
															</a>
															<ReactToPdf
																targetRef={c.id + "-" + i}
																filename={c.id + "-" + i + ".jpg"}
																options={{}}
																x={0.5}
																y={0.5}
																scale={0.8}>
																{({ toPdf }) => (
																	<a
																		className={"PageLogoGenerator-download-link"}
																		download={c.id + "-" + i + ".pdf"}
																		href=""
																		onClick={toPdf}>
																		PDF
																	</a>
																)}
															</ReactToPdf>
														</div>
													</div>)}
												</div>
											</div>)}
										</div>
									}
								</div>
							</div>
						</div>}

					{this.props.myEntities && this.props.myEntities.length === 0
						&& <div className="col-md-12">
							<Message
								text={"No entity assigned"}
								height={300}
							/>
						</div>
					}

					{!this.props.myEntities
						&& <div className="col-md-12">
							<Loading
								height={300}
							/>
						</div>
					}
				</div>
			</div>
		);
	}
}
