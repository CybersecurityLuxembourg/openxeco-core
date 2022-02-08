import React from "react";
import "./Address.css";
import _ from "lodash";
import { NotificationManager as nm } from "react-notifications";
import Popup from "reactjs-popup";
import FormLine from "./FormLine.jsx";
import { postRequest, getForeignRequest } from "../../utils/request.jsx";
import { validateNotNull } from "../../utils/re.jsx";
import DialogConfirmation from "../dialog/DialogConfirmation.jsx";
import SingleMarkerMap from "../map/SingleMarkerMap.jsx";
import Geolocation from "../item/Geolocation.jsx";
import Loading from "../box/Loading.jsx";

export default class Address extends React.Component {
	constructor(props) {
		super(props);

		this.save = this.save.bind(this);
		this.remove = this.remove.bind(this);
		this.changeInfoState = this.changeInfoState.bind(this);
		this.changeState = this.changeState.bind(this);
		this.onGeolocationOpen = this.onGeolocationOpen.bind(this);
		this.fetchGeolocation = this.fetchGeolocation.bind(this);
		this.validateGeolocation = this.validateGeolocation.bind(this);

		this.state = {
			defaultInfo: props.info,
			info: props.info,
			showAddress2: false,
			fullAddress: null,
			geolocations: null,
			selectedGeolocation: null,
		};
	}

	componentDidUpdate(prevProps) {
		if (prevProps.info !== this.props.info) {
			this.setState({
				info: this.props.info,
				defaultInfo: this.props.info,
			});
		}
	}

	save() {
		if (typeof this.state.info.id !== "undefined") {
			const params = _.cloneDeep(this.state.info);
			delete params.company_id;

			postRequest.call(this, "address/update_address", params, () => {
				if (typeof this.props.afterAction !== "undefined") {
					this.props.afterAction();
				}

				nm.info("The address has been updated");
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		} else {
			postRequest.call(this, "address/add_address", this.state.info, () => {
				if (typeof this.props.afterAction !== "undefined") {
					this.props.afterAction();
				}

				nm.info("The address has been added");
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		}
	}

	remove() {
		if (typeof this.state.info.id !== "undefined") {
			const params = {
				id: this.state.info.id,
			};

			postRequest.call(this, "address/delete_address", params, () => {
				if (typeof this.props.afterAction !== "undefined") {
					this.props.afterAction();
				}

				nm.info("The address has been removed");
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		} else {
			this.props.afterAction();
		}
	}

	onGeolocationOpen() {
		this.setState({
			fullAddress: this.state.info.number + " " + this.state.info.address_1 + " "
                + this.state.info.postal_code + " " + this.state.info.city,
		}, () => {
			this.fetchGeolocation();
		});
	}

	fetchGeolocation() {
		const url = "https://nominatim.openstreetmap.org/search?format=json&q=" + this.state.fullAddress;

		this.setState({
			geolocations: null,
		});

		getForeignRequest.call(this, url, (data) => {
			if (Array.isArray(data)) {
				this.setState({
					geolocations:
                        data.map((d) => ({ latitude: d.lat, longitude: d.lon })),
				});
			} else {
				this.setState({
					geolocations: [],
				});
			}
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	changeInfoState(field, value) {
		const info = _.cloneDeep(this.state.info);
		info[field] = value;
		this.setState({ info });
	}

	validateGeolocation() {
		const info = _.cloneDeep(this.state.info);
		info.latitude = parseFloat(this.state.selectedGeolocation.latitude);
		info.longitude = parseFloat(this.state.selectedGeolocation.longitude);
		this.setState({ info, selectedGeolocation: null });
		document.elementFromPoint(100, 0).click();
	}

	render() {
		return (
			<div className="row row-spaced">
				<div className="col-md-12">
					<div className={"row"}>
						<div className={"col-md-6"}>
							<div className={"FormLine-label"}>
                                Number - Street
							</div>
						</div>
						<div className={"col-md-2"}>
							<input
								value={this.state.info.number}
								onChange={(v) => this.changeInfoState("number", v.target.value)}
							/>
						</div>
						<div className={"col-md-4"}>
							<input
								className={validateNotNull(this.state.info.address_1)
									? "FormLine-right-format" : "FormLine-wrong-format"}
								value={this.state.info.address_1}
								onChange={(v) => this.changeInfoState("address_1", v.target.value)}
							/>
						</div>
					</div>
					{this.state.showAddress2 || this.state.info.address_2 !== null
						? <FormLine
							label={"House, Entrance, appartment... (optional)"}
							value={this.state.info.address_2}
							onChange={(v) => this.changeInfoState("address_2", v)}
						/>
						: <div className={"row"}>
							<div className={"col-md-6"}>
							</div>
							<div className={"col-md-6"}>
								<button
									className="link-button"
									onClick={() => this.setState({ showAddress2: true })}
								>
                                    Add house, entrance, appartment information
								</button>
							</div>
						</div>
					}
					<div className={"row"}>
						<div className={"col-md-6"}>
							<div className={"FormLine-label"}>
                                ZIP/Postal code - City
							</div>
						</div>
						<div className={"col-md-2"}>
							<input
								value={this.state.info.postal_code}
								onChange={(v) => this.changeInfoState("postal_code", v.target.value)}
							/>
						</div>
						<div className={"col-md-4"}>
							<input
								className={validateNotNull(this.state.info.city)
									? "FormLine-right-format" : "FormLine-wrong-format"}
								value={this.state.info.city}
								onChange={(v) => this.changeInfoState("city", v.target.value)}
							/>
						</div>
					</div>
					<FormLine
						label={"Country"}
						type={"country"}
						value={this.state.info.country}
						onChange={(v) => this.changeInfoState("country", v)}
						format={validateNotNull}
					/>
					<FormLine
						label={"State, Canton"}
						type={"region"}
						country={this.state.info.country}
						value={this.state.info.administrative_area}
						onChange={(v) => this.changeInfoState("administrative_area", v)}
					/>
					<div className={"row"}>
						<div className={"col-md-6"}>
							<div className={"FormLine-label"}>
                                Latitude - Longitude
							</div>
						</div>
						<div className={"col-md-2"}>
							<Popup
								className="Popup-small-size"
								trigger={
									<button
										className={"blue-background full-size"}
										onClick={() => this.addAddress()}>
										<i className="fas fa-search-location"/>
									</button>
								}
								modal
								closeOnDocumentClick
								onOpen={this.onGeolocationOpen}
							>
								<div className="row row-spaces">
									<div className="col-md-12">
										<h1>Search geolocation</h1>
										<div className="row row-spaced">
											<div className="col-xl-12">
												<FormLine
													label={"Full address"}
													value={this.state.fullAddress}
													onChange={(v) => this.changeState("fullAddress", v)}
												/>
											</div>
											<div className="col-xl-12 right-buttons">
												<button
													className={"blue-background"}
													onClick={this.fetchGeolocation}>
													<i className="fas fa-plus"/> Search
												</button>
											</div>
										</div>
									</div>
								</div>
								<div className="row">
									<div className="col-md-6">
										{this.state.geolocations !== null
											? this.state.geolocations.map((g) => (
												<Geolocation
													key={g.id}
													lat={g.latitude}
													lon={g.longitude}
													selected={this.state.selectedGeolocation
															!== null
														&& this.state.selectedGeolocation.latitude
															=== g.latitude
														&& this.state.selectedGeolocation !== null
														&& this.state.selectedGeolocation.longitude
															=== g.longitude}
													onClick={() => this.setState({
														selectedGeolocation: {
															latitude: g.latitude,
															longitude: g.longitude,
														},
													})}
												/>
											))
											: <Loading
												height={100}
											/>
										}
									</div>
									<div className="col-md-6">
										<SingleMarkerMap
											lat={this.state.selectedGeolocation !== null
												? this.state.selectedGeolocation.latitude : null}
											lon={this.state.selectedGeolocation !== null
												? this.state.selectedGeolocation.longitude : null}
										/>
									</div>
								</div>
								<div className="row">
									<div className="col-md-12 right-buttons">
										<button
											className={"blue-background"}
											disabled={this.selectedGeolocation === null}
											onClick={this.validateGeolocation}>
											<i className="fas fa-plus"/> Validate
										</button>
									</div>
								</div>
							</Popup>
						</div>
						<div className={"col-md-2"}>
							<input
								value={this.state.info.latitude}
								onChange={(v) => this.changeInfoState("latitude",
									parseFloat(v.target.value))}
								type="number"
							/>
						</div>
						<div className={"col-md-2"}>
							<input
								value={this.state.info.longitude}
								onChange={(v) => this.changeInfoState("longitude",
									parseFloat(v.target.value))}
								type="number"
							/>
						</div>
					</div>
					<div className={"row"}>
						<div className={"col-md-12"}>
							<div className="right-buttons">
								<button
									className={"blue-background"}
									onClick={() => this.save()}
									disabled={typeof this.state.info.id !== "undefined"
                                        && _.isEqual(this.props.info, this.state.info)}
								>
									<i className="fas fa-save"/>
								</button>
								{this.state.info.id
									&& <DialogConfirmation
										text={"Are you sure you want to delete this address?"}
										trigger={
											<button
												className={"red-background"}>
												<i className="fas fa-trash-alt"/>
											</button>
										}
										afterConfirmation={() => this.remove()}
									/>
								}
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
