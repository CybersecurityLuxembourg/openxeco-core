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
		this.onClose = this.onClose.bind(this);
		this.onOpen = this.onOpen.bind(this);
		this.validateNewLogo = this.validateNewLogo.bind(this);
		this.rejectNewLogo = this.rejectNewLogo.bind(this);

		this.state = {
			requestCompanyId: null,
			databaseCompany: null,
		};
	}

	componentDidUpdate(prevProps, prevState) {
		if (prevState.requestCompanyId !== this.state.requestCompanyId) {
			this.refresh();
		}
	}

	refresh() {
		this.setState({
			databaseCompany: null,
		});

		if (this.state.requestCompanyId !== null && this.state.requestCompanyId !== undefined) {
			getRequest.call(this, "company/get_company/" + this.state.requestCompanyId, (data) => {
				this.setState({
					databaseCompany: data,
				});
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		}
	}

	onClose() {
		this.setState({ isDetailOpened: false });
	}

	onOpen() {
		this.parseData();
	}

	validateNewLogo() {
		const params = {
			image: this.props.request.image,
		};

		postRequest.call(this, "media/add_image", params, (addImageResponse) => {
			nm.info("The image has been added");

			const companyParams = {
				id: this.state.requestCompanyId,
				image: addImageResponse.id,
			};

			postRequest.call(this, "company/update_company", companyParams, () => {
				nm.info("The company has been updated with new image");

				const requestParams = {
					id: this.props.request.id,
					status: "PROCESSED",
				};

				postRequest.call(this, "request/update_request", requestParams, () => {
					this.refresh();
					nm.info("The request has been set as PROCESSED");
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
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	rejectNewLogo() {
		const params = {
			id: this.props.request.id,
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

	parseData() {
		if (this.props.request === null
			|| this.props.request === undefined
			|| this.props.request.request === null) {
			this.setState({
				requestCompanyId: null,
			});
		}

		const openMatches = this.props.request.request.indexOf("{");
		const closeMatches = this.props.request.request.lastIndexOf("}");

		if (openMatches === -1) {
			nm.warning("Impossible to parse the data #1");
			return;
		}

		if (closeMatches === -1) {
			nm.warning("Impossible to parse the data #2");
			return;
		}

		let data = this.props.request.request.substring(openMatches, closeMatches + 1);

		try {
			data = JSON.parse(data);

			this.setState({
				requestCompanyId: data.id === undefined ? null : data.id,
			});
		} catch (e) {
			nm.warning("Impossible to parse the data #3");
		}
	}

	render() {
		return (
			<Popup
				className="Popup-small-size"
				trigger={
					<button
						className={"blue-background"}
					>
						<i className="fas fa-tasks"/> Treat logo request
					</button>
				}
				modal
				closeOnDocumentClick
				onClose={this.onClose}
				onOpen={this.onOpen}
			>
				<div className="row row-spaced">
					<div className="col-md-12">
						<h2>
                            Review modifications
						</h2>
					</div>

					<div className="col-md-6">
						<h3>Current logo</h3>

						{this.state.databaseCompany !== null
							? <img
								className={"LogArticleVersion-image"}
								src={getApiURL() + "public/get_image/" + this.state.databaseCompany.image}
							/>
							: <Loading
								height={200}
							/>
						}
					</div>

					<div className="col-md-6">
						<h3>Requested logo</h3>

						{this.props.request !== null && this.props.request !== undefined
							? <div className="Request-image">
								<img src={"data:image/png;base64," + this.props.request.image} />
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
								disabled={this.state.databaseCompany === null
									|| this.props.request === null
									|| this.props.request === undefined
									|| this.props.request.status === "PROCESSED"}>
								<i className="fas fa-check-circle"/> Add media and change logo
							</button>
							<button
								onClick={this.rejectNewLogo}
								disabled={this.state.databaseCompany === null
									|| this.props.request === null
									|| this.props.request === undefined
									|| this.props.request.status === "PROCESSED"}>
								<i className="fas fa-times-circle"/> Reject and set as PROCESSED
							</button>
						</div>
					</div>
				</div>
			</Popup>
		);
	}
}
