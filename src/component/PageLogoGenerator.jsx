import React from "react";
import "./PageLogoGenerator.css";
import { getApiURL } from "../utils/env.jsx";
import FormLine from "./form/FormLine.jsx";
import Message from "./box/Message.jsx";
import Loading from "./box/Loading.jsx";

export default class PageLogoGenerator extends React.Component {
	constructor(props) {
		super(props);

		this.drawAllWithText = this.drawAllWithText.bind(this);
		this.drawAllWithCompany = this.drawAllWithCompany.bind(this);

		this.state = {
			text: "Type your text",
			company: null,
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
			},
			{
				id: "canvas-text-4",
				status: "Member of the ecosystem",
				width: 250,
				height: 150,
			},
			{
				id: "canvas-text-5",
				status: "Member of the ecosystem",
				width: 350,
				height: 75,
			},
			{
				id: "canvas-text-6",
				status: "Member of the ecosystem",
				width: 400,
				height: 100,
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
	}

	componentDidUpdate(_, prevState) {
		if (prevState.text !== this.state.text) {
			this.drawAllWithText();
		}

		if (prevState.company !== this.state.company) {
			this.drawAllWithCompany();
		}
	}

	drawAllWithText() {
		this.state.canvas.map((c) => {
			if (c.logo && c.logo.show) {
				this.drawWithLogo(c);
			} else {
				this.drawWithProjectName(c);
			}

			return null;
		});
	}

	drawAllWithCompany() {
		this.state.companyCanvas.map((c) => {
			this.drawWithCompany(c);

			return null;
		});
	}

	drawWithLogo(c) {
		// Get the logo image

		const image = new Image();
		image.src = getApiURL() + "public/get_image/logo.png";

		// Init the canvas

		console.log(c.id);
		const drawing = document.getElementById(c.id);
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

		// Integrate logo

		const imageHeight = c.logo.position === "middle" ? c.height - 60 : c.height - 30;
		const imageWidth = imageHeight * (image.height / image.width);

		con.drawImage(
			image,
			c.logo.position === "middle" ? (c.width - imageWidth) / 2 : 10,
			10,
			imageHeight,
			imageWidth,
		);

		// Write the text

		con.fillStyle = "black";
		con.textAlign = c.logo.position === "middle" ? "center" : "left";
		con.textBaseline = c.logo.position === "middle" ? "bottom" : "middle";
		con.font = c.logo.position === "middle"
			? "20px Fjalla One"
			: PageLogoGenerator.getFittingFontSize(
				con,
				this.state.text,
				c.width - imageWidth - 20,
				c.height - 40,
			) + "px Fjalla One";

		con.fillText(
			this.state.text,
			c.logo.position === "middle" ? c.width / 2 : 25 + imageWidth,
			c.logo.position === "middle" ? c.height - 23 : c.height / 2,
			c.logo.position === "middle" ? c.width - 20 : c.width - imageWidth - 45,
			c.logo.position === "middle" ? 50 : c.height - 40,
		);

		con.textBaseline = "alphabetic";

		// Write the status

		con.textAlign = "right";
		con.font = "15px 'Fjalla One'";
		con.fillText(c.status, c.width - 10, c.height - 5, c.width - 20, 100);
	}

	drawWithProjectName(c) {
		// Init the canvas

		const drawing = document.getElementById(c.id);
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

		// Write the project name

		let idealFontSize = PageLogoGenerator.getFittingFontSize(
			con,
			this.props.settings.PROJECT_NAME,
			c.width - 20,
			(c.height / 2) - 20,
		);

		con.fillStyle = "black";
		con.textAlign = "top";
		con.textBaseline = "middle";
		con.font = idealFontSize + "px Fjalla One";

		con.fillText(
			this.props.settings.PROJECT_NAME,
			10,
			10 + (idealFontSize / 2),
			c.width - 20,
		);

		// Write the text

		idealFontSize = PageLogoGenerator.getFittingFontSize(
			con,
			this.state.text,
			c.width - 20,
			(c.height / 2) - 20,
		);

		con.fillStyle = "black";
		con.textAlign = "right";
		con.textBaseline = "middle";
		con.font = idealFontSize + "px Fjalla One";

		con.fillText(
			this.state.text,
			c.width - 10,
			(c.height / 2) - 1 + (idealFontSize / 2),
			c.width - 20,
		);

		// Write the status

		con.textBaseline = "alphabetic";

		con.textAlign = "right";
		con.font = "15px 'Fjalla One'";
		con.fillText(c.status, c.width - 10, c.height - 5, c.width - 20, 100);

		// Draw a separation line

		con.lineWidth = 1;
		con.beginPath();
		con.moveTo(c.width / 4 + 0.5, (c.height / 2) - 8);
		con.lineTo((c.width / 4) * 3 + 0.5, (c.height / 2) - 8);
		con.stroke();
	}

	drawWithCompany(c) {
		// Init the canvas

		const drawing = document.getElementById(c.id);
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

		// Write the project name

		let idealFontSize = PageLogoGenerator.getFittingFontSize(
			con,
			this.props.settings.PROJECT_NAME,
			c.width - 20,
			(c.height / 2) - 20,
		);

		con.fillStyle = "black";
		con.textAlign = "top";
		con.textBaseline = "middle";
		con.font = idealFontSize + "px Fjalla One";

		con.fillText(
			this.props.settings.PROJECT_NAME,
			10,
			10 + (idealFontSize / 2),
			c.width - 20,
		);

		// Write the text

		idealFontSize = PageLogoGenerator.getFittingFontSize(
			con,
			this.state.text,
			c.width - 20,
			(c.height / 2) - 20,
		);

		con.fillStyle = "black";
		con.textAlign = "right";
		con.textBaseline = "middle";
		con.font = idealFontSize + "px Fjalla One";

		con.fillText(
			this.state.text,
			c.width - 10,
			(c.height / 2) - 1 + (idealFontSize / 2),
			c.width - 20,
		);

		// Write the status

		con.textBaseline = "alphabetic";

		con.textAlign = "right";
		con.font = "15px 'Fjalla One'";
		con.fillText(c.status, c.width - 10, c.height - 5, c.width - 20, 100);

		// Draw a separation line

		con.lineWidth = 1;
		con.beginPath();
		con.moveTo(c.width / 4 + 0.5, (c.height / 2) - 8);
		con.lineTo((c.width / 4) * 3 + 0.5, (c.height / 2) - 8);
		con.stroke();
	}

	static getFittingFontSize(context, text, width, height) {
		console.log("eAAA");
		let retFontSize = height;

		do {
			console.log("eAAA", retFontSize);
			retFontSize--;
		} while ((context.measureText(text).width > width
			|| context.measureText(text).height > height)
				&& retFontSize > 0);

		return retFontSize;
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	render() {
		return (
			<div className={"PageLogoGenerator page max-sized-page"}>
				<div className={"row"}>
					<div className="col-md-12">
						<h1>Logo generator</h1>

						<div className="top-right-buttons">
							<button>
								<i className="fas fa-redo-alt"/>
							</button>
						</div>
					</div>
				</div>

				<div className={"row row-spaced"}>
					<div className="col-md-12">
						<h2>With a text</h2>
					</div>

					<div className="col-md-12 row-spaced">
						<FormLine
							label="Entity name"
							value={this.state.text}
							onChange={(v) => this.changeState("text", v)}
						/>
					</div>

					{this.state.canvas.map((c) => <div
						key={c.id}
						className="col-md-4 PageLogoGenerator-canvas-wrapper">
						<h3>{c.width}x{c.height}</h3>
						<canvas
							id={c.id}
							className="PageLogoGenerator-canvas"
						/>
					</div>)}
				</div>

				<div className={"row"}>
					<div className="col-md-12">
						<h2>With a company logo</h2>
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
										value={this.state.company}
										options={this.props.myCompanies === null
											|| this.props.myCompanies === undefined
											? []
											: this.props.myCompanies.map((o) => ({ label: o.name, value: o.id }))
										}
										onChange={(v) => this.changeState("company", v)}
										format={this.state.company === null}
									/>
								</div>

								<div className="col-md-12 row-spaced">
									{this.state.company === null
										&& <Message
											text={"Please select a company"}
											height={300}
										/>
									}

									{this.state.company !== null && !this.state.company.image
										&& <Message
											text={"The entity does not have a logo"}
											height={300}
										/>
									}

									{this.state.company !== null && this.state.company.image
										&& <div className={"row"}>
											{this.state.companyCanvas.map((c) => <div
												key={c.id}
												className="col-md-4 PageLogoGenerator-canvas-wrapper">
												<h3>{c.width}x{c.height}</h3>
												<canvas
													id={c.id}
													className="PageLogoGenerator-canvas"
												/>
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
								text={"Please select a company"}
								height={300}
							/>
						</div>
					}
				</div>
			</div>
		);
	}
}
