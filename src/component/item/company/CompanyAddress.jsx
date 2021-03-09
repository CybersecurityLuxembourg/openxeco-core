import React from "react";
import "./CompanyAddress.css";
import { NotificationManager as nm } from "react-notifications";
import _ from "lodash";
import dompurify from "dompurify";
import Popup from "reactjs-popup";
import Loading from "../../box/Loading.jsx";
import Message from "../../box/Message.jsx";
import Address from "../../button/Address.jsx";
import { getRequest, getForeignRequest } from "../../../utils/request.jsx";
import FormLine from "../../button/FormLine.jsx";

export default class CompanyAddress extends React.Component {
	constructor(props) {
		super(props);

		this.refresh = this.refresh.bind(this);
		this.addAddress = this.addAddress.bind(this);
		this.fetchRawAddresses = this.fetchRawAddresses.bind(this);
		this.onSneakOpen = this.onSneakOpen.bind(this);
		this.onSneakClose = this.onSneakClose.bind(this);
		this.addRawAddress = this.addRawAddress.bind(this);

		this.state = {
			addresses: null,
			country: "Luxembourg",
			companyName: props.name,
			scrapedAddresses: null,
			elements: [
				{
					name: "House number",
					field: "number",
					color: "#bcebff",
					regex: /(\b([0-9]{1,3})([a-zA-Z]{1,2})?([-]{1}[0-9]{0,3}[a-zA-Z]{0,2})?\b)(?![^<]*>|[^<>]*<\/)/,
				},
				{
					name: "Street",
					field: "address_1",
					color: "#fed7da",
					regex: /([a-zA-ZÀ-ÿ]{2,}(?:[\sÀ-ÿ-.'][a-zA-ZÀ-ÿ.]+)*)(?![^<]*>|[^<>]*<\/)/,
				},
				{
					name: "City",
					field: "city",
					color: "#defed7",
					regex: /([a-zA-Z]{2,}(?:[\s-][a-zA-Z]{2,})*)(?![^<]*>|[^<>]*<\/)/,
				},
				{
					name: "Postal code",
					field: "postal_code",
					color: "#fee4d7",
					regex: /([0-9]{4,6})(?![^<]*>|[^<>]*<\/)/,
				},
			],
		};
	}

	componentDidMount() {
		this.refresh();
	}

	refresh() {
		getRequest.call(this, "company/get_company_addresses/" + this.props.id, (data) => {
			this.setState({
				addresses: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	addAddress() {
		const addresses = _.cloneDeep(this.state.addresses);
		addresses.push({
			company_id: this.props.id,
			address_1: null,
			address_2: null,
			number: null,
			postal_code: null,
			city: null,
			country: null,
			administrative_area: null,
			latitude: null,
			longitude: null,
		});

		this.setState({ addresses });
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	fetchRawAddresses() {
		const url = "https://data.occrp.org/api/2/entities?facet=countries&facet=addresses&facet_size%3Aaddresses=10&facet_size%3Acountries=1000&facet_total%3Aaddresses=true&facet_total%3Acountries=true&filter%3Acountries=lu&filter%3Aschemata=Thing&highlight=true&limit=30&q=" + this.state.companyName;

		this.setState({
			scrapedAddresses: null,
		});

		getForeignRequest.call(this, url, (data) => {
			if (data.facets !== undefined && data.facets.addresses !== undefined
                && data.facets.addresses.values !== undefined) {
				this.setState({
					scrapedAddresses:
						this.highlightAddressElements(
							data.facets.addresses.values.map((a) => a.label),
						),
				});
			} else {
				this.setState({
					scrapedAddresses: [],
				});
			}
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	addRawAddress(a) {
		const addresses = _.cloneDeep(this.state.addresses);

		addresses.push({
			company_id: this.props.id,
			address_1: a.address_1,
			address_2: null,
			number: a.number,
			postal_code: a.postal_code,
			city: a.city,
			country: this.state.country,
			administrative_area: null,
			latitude: null,
			longitude: null,
		});

		this.setState({ addresses });
		document.elementFromPoint(100, 0).click();
	}

	onSneakOpen() {
		this.fetchRawAddresses();
	}

	onSneakClose() {
		this.setState({
			scrapedAddresses: null,
		});
	}

	highlightAddressElements(rawAddresses) {
		const output = [];

		for (let i = 0; i < rawAddresses.length; i++) {
			let address = rawAddresses[i];
			let highlightedAddress = rawAddresses[i];
			const o = { rawAddress: rawAddresses[i] };

			for (let y = 0; y < this.state.elements.length; y++) {
				if (address.match(this.state.elements[y].regex) !== null) {
					o[this.state.elements[y].field] = address.match(this.state.elements[y].regex)[0];
					address = address.replace(this.state.elements[y].regex, "");
					highlightedAddress = highlightedAddress.replace(this.state.elements[y].regex, "<span style='background-color:" + this.state.elements[y].color + "'>$1</span>");
				} else {
					o[this.state.elements[y].field] = null;
				}
			}

			o.highlightedAddress = highlightedAddress;
			output.push(o);
		}

		return output;
	}

	render() {
		if (this.state.addresses === null) return <Loading height={300}/>;

		return (
			<div className={"row"}>
				<div className="col-md-12">
					<div className={"top-right-buttons"}>
						<Popup
							className="Popup-small-size"
							trigger={
								<button
									className={"blue-background"}>
									<i className="fas fa-user-ninja"></i> Crawl on the web
								</button>
							}
							modal
							closeOnDocumentClick
							onClose={this.onSneakClose}
							onOpen={this.onSneakOpen}
						>
							<div className="row">
								<div className="col-md-12">
									<h1>Crawl addresses from the web</h1>
									<div className="row row-spaced">
										<div className="col-xl-12">
											<FormLine
												label={"Country"}
												type={"country"}
												value={this.state.country}
												onChange={(v) => this.changeState("country", v)}
											/>
										</div>
										<div className="col-xl-12">
											<FormLine
												label={"Company name"}
												value={this.state.companyName}
												onChange={(v) => this.changeState("companyName", v)}
											/>
										</div>
										<div className="col-xl-12 right-buttons">
											<button
												className={"blue-background"}
												onClick={this.fetchRawAddresses}>
												<i className="fas fa-plus"/> Search
											</button>
										</div>
									</div>
								</div>
								<div className="col-md-12">
									{Array.isArray(this.state.scrapedAddresses)
										&& this.state.scrapedAddresses.length === 0
										&& <Message
											text="No address found, try another company name"
										/>
									}

									{Array.isArray(this.state.scrapedAddresses)
										&& this.state.scrapedAddresses.length > 0
										&& <div>
											<div className="row row-spaced">
												{this.state.elements.map((e) => (
													<div className="col-md-3" key={e.name}>
														<span className="dot" style={{ backgroundColor: e.color }}/>
														{e.name}
													</div>
												))}
											</div>
											{this.state.scrapedAddresses.map((a) => (
												<div className="row" key={a}>
													<div
														className="col-md-10"
														dangerouslySetInnerHTML={{
															__html: dompurify.sanitize(a.highlightedAddress),
														}}
													/>
													<div className="col-md-2">
														<button
															className={"blue-background small-button"}
															onClick={() => this.addRawAddress(a)}>
															<i className="far fa-check-circle"/>
														</button>
													</div>
												</div>
											))}
										</div>
									}

									{!Array.isArray(this.state.scrapedAddresses)
										&& <Loading
											height={100}
										/>
									}
								</div>
							</div>
						</Popup>
						<button
							className={"blue-background"}
							onClick={() => this.addAddress()}>
							<i className="fas fa-plus"/> Add an empty address
						</button>
					</div>
					<h2>Address</h2>
				</div>
				<div className="col-md-12">
					{this.state.addresses.length > 0
						? this.state.addresses.map((a) => (
							<Address
								key={a.id}
								info={a}
								afterAction={this.refresh}
							/>
						))
						: <Message
							text={"No address found on the database"}
							height={250}
						/>
					}
				</div>
			</div>
		);
	}
}
