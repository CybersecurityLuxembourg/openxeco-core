import React from "react";
import "./CompanyLogo.css";
import { NotificationManager as nm } from "react-notifications";
import Dropzone from "react-dropzone";
import { postRequest } from "../../utils/request.jsx";
import Loading from "../box/Loading.jsx";
import Message from "../box/Message.jsx";
import { getApiURL } from "../../utils/env.jsx";
import DialogHint from "../dialog/DialogHint.jsx";

export default class CompanyGlobal extends React.Component {
	constructor(props) {
		super(props);

		this.submitLogoModificationRequests = this.submitLogoModificationRequests.bind(this);
		this.onDrop = this.onDrop.bind(this);

		this.state = {
			companyInfo: props.company,

			imageContent: null,
		};
	}

	componentDidUpdate(prevState, prevProps) {
		if (prevProps.company === null
			&& this.props.company !== null
			&& this.state.companyInfo === null) {
			this.setState({
				companyInfo: this.props.company,
			});
		}
	}

	submitLogoModificationRequests() {
		const params = {
			type: "ENTITY LOGO CHANGE",
			request: "The user requests a change of the logo on an entity",
			company_id: this.props.company.id,
			image: this.state.imageContent,
		};

		postRequest.call(this, "private/add_request", params, () => {
			this.props.getNotifications();
			nm.info("The request has been sent and will be reviewed");
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
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

			reader.onabort = () => console.log("File reading was aborted");
			reader.onerror = () => console.log("An error happened while reading the file");
			reader.onload = () => {
				this.setState({ imageContent: reader.result, importError: null });
			};

			reader.readAsDataURL(files[0]);
		}
	}

	render() {
		if (this.state.companyInfo === null
			|| this.state.companyInfo === undefined) {
			return <Loading
				height={300}
			/>;
		}

		return (
			<div id="CompanyLogo" className="max-sized-page fade-in">
				<div className={"row"}>
					<div className="col-md-9">
						<h2>Logo</h2>
					</div>

					<div className="col-md-3 top-title-menu">
						<DialogHint
							content={
								<div className="row">
									<div className="col-md-12">
										<h2>How can I modify the logo of my entity?</h2>

										<p>
											You can modify the logo by clocking the Drap and Drop box of the
											&quot;Request a new logo&quot; section:
										</p>

										<img src="/img/hint-drag-and-drop-logo.png"/>

										<p>
											You can then select an image from your terminal and select
											the following button:
										</p>

										<img src="/img/hint-request-logo-button.png"/>

										<p>
											Please consider
											that the image must be .jpg, .jpeg or .png. The width and the
											height also cannot be higher than 500px.
										</p>

										<p>
											This will send a request to the organisation team that will
											treat your request by accepting of rejecting your suggestion.
										</p>

										<h2>Note</h2>

										<p>
											You can follow up your requests by going on this menu:
										</p>

										<img src="/img/hint-request-menu.png"/>
									</div>
								</div>
							}
						/>
					</div>
				</div>

				<div className={"row row-spaced"}>
					<div className="col-md-12 row-spaced">
						<h3>Current logo</h3>
					</div>

					<div className="col-md-12 row-spaced CompanyLogo-center">
						{this.state.companyInfo.image === null
							? <Message
								text={"No logo found for this entity"}
								height={300}
							/>
							: <img
								src={getApiURL() + "public/get_image/" + this.state.companyInfo.image}
								alt={this.state.companyInf + " logo"}
							/>
						}
					</div>
				</div>

				<div className={"row row-spaced"}>
					<div className="col-md-12 row-spaced">
						<h3>Request a new logo</h3>
					</div>

					<div className="col-md-12 row-spaced">
						{this.state.imageContent === null
							? <Dropzone
								accept=".png,.jpg,.jpeg"
								disabled={false}
								onDrop={this.onDrop}
							>
								{({ getRootProps, getInputProps }) => (
									<div
										className={"CompanyLogo-dragdrop"}
										{...getRootProps()}>
										<input {...getInputProps()} />
										<div className="CompanyLogo-dragdrop-textContent">
											<i className="far fa-image"/>
											<div>Drag and drop the file here</div>
											<div>must be .jpg, .jpeg or .png</div>
											<div>maximum size of 500x500 size</div>
										</div>
									</div>
								)}
							</Dropzone>
							: <img
								className="CompanyLogo-logo-change"
								src={this.state.imageContent}
							/>
						}

						<div className={"right-buttons block-buttons"}>
							<button
								className={"blue-background"}
								disabled={this.state.imageContent === null}
								onClick={() => this.setState({ imageContent: null })}
							>
								<i className="fas fa-times-circle"/> Remove the selection
							</button>
							<button
								className={"blue-background"}
								disabled={this.state.imageContent === null}
								onClick={() => this.submitLogoModificationRequests()}
							>
								<i className="fas fa-save"/> Request logo change...
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
