import React from "react";
import "./PageLogoGenerator.css";
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
		this.drawAllWithCompany = this.drawAllWithCompany.bind(this);
		this.getImageIds = this.getImageIds.bind(this);

		this.state = {
			text: getUrlParameter("text")
				? getUrlParameter("text").replace("%20", " ")
				: "Type text here",
			subtext: getUrlParameter("subtext")
				? getUrlParameter("subtext").replace("%20", " ")
				: "",
			selectedCompanyId: null,
			selectedCompany: null,
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
			companyCanvas: [{
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
		this.drawAllWithCompany();
		this.getImagesIncludedInGenerator();
	}

	componentDidUpdate(_, prevState) {
		if (prevState.text !== this.state.text
			|| prevState.subtext !== this.state.subtext) {
			this.drawAllWithText();
		}

		if (prevState.selectedCompanyId !== this.state.selectedCompanyId) {
			this.getCompany();
		}

		if (prevState.selectedCompany !== this.state.selectedCompany) {
			this.drawAllWithCompany();
		}

		if (prevState.withTransparentBackground !== this.state.withTransparentBackground
			|| prevState.includedImages !== this.state.includedImages) {
			this.drawAllWithText();
			this.drawAllWithCompany();
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

	getCompany() {
		if (!this.state.selectedCompanyId) {
			this.setState({ selectedCompany: null });
		} else {
			getRequest.call(this, "public/get_public_company/"
				+ this.state.selectedCompanyId, (data) => {
				this.setState({
					selectedCompany: data,
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

	drawAllWithCompany() {
		this.state.companyCanvas.map((c) => {
			this.drawWithProjectLogoAndCompanyLogo(c);
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

	drawWithProjectLogoAndCompanyLogo(c) {
		if (!this.state.selectedCompany || !this.state.selectedCompany.image) {
			return;
		}

		// Get the logos

		const imageIds = this.getImageIds();
		const imagesSrcs = [getApiURL() + "public/get_public_image/" + this.state.selectedCompany.image]
			.concat(imageIds
				.map((i) => getApiURL() + "public/get_public_image/" + i));

		Promise.all(imagesSrcs.map(PageLogoGenerator.loadImage)).then((images) => {
			const companyImage = images[0];
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

				// Integrate company logo

				imageHeight = c.height - 35;
				imageWidth = companyImage.width * (imageHeight / companyImage.height);

				if (imageWidth > (c.width - 40) / 2) {
					imageHeight *= ((c.width - 40) / 2) / imageWidth;
					imageWidth = (c.width - 40) / 2;
				}

				con.drawImage(
					companyImage,
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
								className="col-md-4 PageLogoGenerator-canvas-wrapper">
								<h3>{c.width}x{c.height}</h3>
								<canvas
									id={c.id + "-" + i}
									className="PageLogoGenerator-canvas"
								/>
								<button
									onClick={() => {
										const canvas = document.getElementById(c.id + "-" + i);
										const dataURL = canvas.toDataURL("image/png");
										window.open(dataURL);
									}}>
									Save image
								</button>
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
					{this.props.myCompanies && this.props.myCompanies.length > 0
						&& <div className="col-md-12">
							<div className={"row"}>
								<div className="col-md-12 row-spaced">
									<FormLine
										label={"Select your entity"}
										type={"select"}
										value={this.state.selectedCompanyId}
										options={this.props.myCompanies === null
											|| this.props.myCompanies === undefined
											? []
											: this.props.myCompanies.map((o) => ({ label: o.name, value: o.id }))
										}
										onChange={(v) => this.changeState("selectedCompanyId", v)}
									/>
								</div>

								<div className="col-md-12 row-spaced">
									{!this.state.selectedCompanyId
										&& <Message
											text={"Please select a company"}
											height={300}
										/>
									}

									{this.state.selectedCompany && !this.state.selectedCompany.image
										&& <Message
											text={"The entity does not have a logo"}
											height={300}
										/>
									}

									{this.state.selectedCompanyId && !this.state.selectedCompany
										&& <Loading
											height={300}
										/>
									}

									{this.state.selectedCompany && this.state.selectedCompany.image
										&& <div className={"row"}>
											{this.getImageIds().map((i) => <div
												key={i}
												className="col-md-12">
												<div className={"row"}>
													{this.state.companyCanvas.map((c) => <div
														key={c.id + "-" + i}
														className="col-md-4 PageLogoGenerator-canvas-wrapper">
														<h3>{c.width}x{c.height}</h3>
														<canvas
															id={c.id + "-" + i}
															className="PageLogoGenerator-canvas"
														/>
														<button
															onClick={() => {
																const canvas = document.getElementById(c.id + "-" + i);
																const dataURL = canvas.toDataURL("image/png");
																window.open(dataURL);
															}}>
															Save image
														</button>
													</div>)}
												</div>
											</div>)}
										</div>
									}
								</div>
							</div>
						</div>}

					{this.props.myCompanies && this.props.myCompanies.length === 0
						&& <div className="col-md-12">
							<Message
								text={"No company assigned"}
								height={300}
							/>
						</div>
					}

					{!this.props.myCompanies
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
