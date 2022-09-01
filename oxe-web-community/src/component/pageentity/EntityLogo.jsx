import React from "react";
import "./EntityLogo.css";
import { NotificationManager as nm } from "react-notifications";
import Dropzone from "react-dropzone";
import { postRequest } from "../../utils/request.jsx";
import Loading from "../box/Loading.jsx";
import Message from "../box/Message.jsx";
import { getApiURL } from "../../utils/env.jsx";
import DialogHint from "../dialog/DialogHint.jsx";

export default class EntityGlobal extends React.Component {
	constructor(props) {
		super(props);

		this.submitLogoModificationRequests = this.submitLogoModificationRequests.bind(this);
		this.onDrop = this.onDrop.bind(this);

		this.state = {
			entityInfo: props.entity,

			imageContent: null,
		};
	}

	componentDidUpdate(prevState, prevProps) {
		if (prevProps.entity === null
			&& this.props.entity !== null
			&& this.state.entityInfo === null) {
			this.setState({
				entityInfo: this.props.entity,
			});
		}
	}

	submitLogoModificationRequests() {
		const params = {
			type: "ENTITY LOGO CHANGE",
			request: "The user requests a change of the logo on an entity",
			entity_id: this.props.entity.id,
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

			reader.onabort = () => nm.error("File reading was aborted");
			reader.onerror = () => nm.error("An error happened while reading the file");
			reader.onload = () => {
				this.setState({ imageContent: reader.result, importError: null });
			};

			reader.readAsDataURL(files[0]);
		}
	}

	render() {
		if (this.state.entityInfo === null
			|| this.state.entityInfo === undefined) {
			return <Loading
				height={300}
			/>;
		}

		return (
			<div id="EntityLogo" className="max-sized-page fade-in">
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
											You can modify the logo by:
										</p>

										<ul>
											<li>
												Clicking on the Drag and Drop box and
												choose an image from your computer
											</li>
											<li>
												Choose an image on your computer, drag
												it onto the Drag and drop field and drop it to the box
											</li>
										</ul>

										<img src="/img/hint-drag-and-drop-logo.png"/>

										<p>
											Once finished, click on the active &quot;Request logo change&quot;
											button to confirm your action:
										</p>

										<img src="/img/hint-request-logo-button.png"/>

										<p>
											Please consider
											that the image must be .jpg, .jpeg or .png. The width and the
											height also cannot be higher than 500px.
										</p>

										<p>
											This will send a request to the administration team, who will
											either accept or reject your request.
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

					<div className="col-md-12 row-spaced EntityLogo-center">
						{this.state.entityInfo.image === null
							? <Message
								text={"No logo found for this entity"}
								height={300}
							/>
							: <img
								src={getApiURL() + "public/get_public_image/" + this.state.entityInfo.image}
								alt={this.state.entityInf + " logo"}
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
										className={"EntityLogo-dragdrop"}
										{...getRootProps()}>
										<input {...getInputProps()} />
										<div className="EntityLogo-dragdrop-textContent">
											<i className="far fa-image"/>
											<div>Drag and drop the file here</div>
											<div>must be .jpg, .jpeg or .png</div>
											<div>maximum size of 500x500 size</div>
										</div>
									</div>
								)}
							</Dropzone>
							: <img
								className="EntityLogo-logo-change"
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
