import React, { Component } from "react";
import "./RequestLogoChange.css";
import Popup from "reactjs-popup";
import { NotificationManager as nm } from "react-notifications";
import { getRequest, postRequest } from "../../../utils/request.jsx";
import { getApiURL } from "../../../utils/env.jsx";
import Loading from "../../box/Loading.jsx";

export default class RequestLogoChange extends Component {
	constructor(props) {
		super(props);

		this.refresh = this.refresh.bind(this);
		this.validateNewLogo = this.validateNewLogo.bind(this);
		this.rejectNewLogo = this.rejectNewLogo.bind(this);

		this.state = {
			databaseEntity: null,
		};
	}

	refresh() {
		this.setState({
			databaseEntity: null,
		});

		if (this.props.entityId !== null && this.props.entityId !== undefined) {
			getRequest.call(this, "entity/get_entity/" + this.props.entityId, (data) => {
				this.setState({
					databaseEntity: data,
				});
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		}
	}

	validateNewLogo() {
		const params = {
			image: this.props.image,
		};

		postRequest.call(this, "media/add_image", params, (addImageResponse) => {
			nm.info("The image has been added");

			const entityParams = {
				id: this.props.entityId,
				image: addImageResponse.id,
			};

			postRequest.call(this, "entity/update_entity", entityParams, () => {
				this.refresh();
				nm.info("The entity has been updated with new image");
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

	rejectNewLogo() {
		const params = {
			id: this.props.requestId,
			status: "PROCESSED",
		};

		postRequest.call(this, "request/update_request", params, () => {
			this.refresh();
			nm.info("The logo has NOT been changed and the request has been set as PROCESSED");
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	render() {
		return (
			<Popup
				className="Popup-small-size"
				trigger={
					<button
						className={"blue-background"}
					>
						<i className="fas fa-tasks"/> Review entity logo change
					</button>
				}
				modal
				closeOnDocumentClick
				onOpen={this.refresh}
			>
				{(close) => (
					<div className="row row-spaced">
						<div className="col-md-12">
							<h2>Review entity logo change</h2>

							<div className={"top-right-buttons"}>
								<button
									className={"grey-background"}
									onClick={close}>
									<i className="far fa-times-circle"/>
								</button>
							</div>
						</div>

						<div className="col-md-6">
							<h3>Current logo</h3>

							{this.state.databaseEntity !== null
								? <img
									className={"LogArticleVersion-image"}
									src={getApiURL() + "public/get_public_image/" + this.state.databaseEntity.image}
								/>
								: <Loading
									height={200}
								/>
							}
						</div>

						<div className="col-md-6">
							<h3>Requested logo</h3>

							{this.props.image !== null && this.props.image !== undefined
								? <div className="Request-image">
									<img src={"data:image/png;base64," + this.props.image} />
								</div>
								: <Loading
									height={200}
								/>
							}
						</div>

						<div className="col-md-12">
							<div className="right-buttons block-buttons">
								<button
									onClick={this.validateNewLogo}
									disabled={this.state.databaseEntity === null
										|| this.props.image === null
										|| this.props.image === undefined
										|| this.props.requestStatus === "PROCESSED"}>
									<i className="fas fa-check-circle"/> Add media and change logo
								</button>
							</div>
						</div>
					</div>
				)}
			</Popup>
		);
	}
}
