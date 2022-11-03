import React from "react";
import "./EntityGlobal.css";
import { NotificationManager as nm } from "react-notifications";
// import _ from "lodash";
import FormLine from "../form/FormLine.jsx";
import { getRequest, postRequest } from "../../utils/request.jsx";
// import DialogConfirmation from "../dialog/DialogConfirmation.jsx";
import Loading from "../box/Loading.jsx";
// import DialogHint from "../dialog/DialogHint.jsx";

export default class EntityGlobal extends React.Component {
	constructor(props) {
		super(props);

		this.submitModificationRequests = this.submitModificationRequests.bind(this);

		this.state = {
			entityInfo: props.entity,

			fields: {
				name: "Name",
				headline: "Headline",
				type: "Type",
				website: "Website",
				linkedin_url: "Linkedin URL",
				twitter_url: "Twitter URL",
				youtube_url: "Youtube URL",
				discord_url: "Discord URL",
			},
			address: null,
			contact: null,
		};
	}

	componentDidMount() {
		this.getAddresses();
		this.getContacts();
	}

	getAddresses() {
		this.setState({
			address: null,
		});

		getRequest.call(this, "private/get_my_entity_addresses/" + this.props.entity.id, (data) => {
			this.setState({
				address: data[0],
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	getContacts() {
		this.setState({
			contact: null,
		});

		getRequest.call(this, "private/get_my_entity_contacts/" + this.props.entity.id, (data) => {
			this.setState({
				contact: data[0],
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
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

	submitModificationRequests() {
		const params = {
			type: "ENTITY CHANGE",
			request: "The user requests modifications on an entity",
			entity_id: this.props.entity.id,
			data: this.state.entityInfo,
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

	getModifiedFields(c1, c2) {
		const fields = [];

		Object.entries(c1).forEach(([key]) => {
			if (c1[key] !== c2[key]) fields.push(this.state.fields[key]);
		});

		return fields.join(", ");
	}

	updateEntity(field, value) {
		const c = JSON.parse(JSON.stringify(this.state.entityInfo));
		c[field] = value;
		this.setState({ entityInfo: c });
	}

	render() {
		if (this.state.entityInfo === null
			|| this.state.entityInfo === undefined) {
			return <Loading
				height={300}
			/>;
		}

		return (
			<div id="EntityGlobal" className="max-sized-page fade-in">
				<div className={"row"}>
					<div className="col-md-9">
						<h2>Global information</h2>
					</div>

					{/* <div className="col-md-3 top-title-menu">
						<DialogHint
							content={
								<div className="row">
									<div className="col-md-12">
										<h2>How can I modify the global information of my entity?</h2>

										<p>
											You can modify the fields and select the following button:
										</p>

										<img src="/img/hint-request-global-modification.png"/>

										<p>
											Your request will be sent to the administration team, who will
											either accept or reject your suggestion.
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
					</div> */}
				</div>

				<div className={"row row-spaced"}>
					<div className="col-md-12">
						<FormLine
							label={"Name"}
							value={this.props.entity.name}
							disabled={true}
						/>
						<FormLine
							label={"Entity Type"}
							value={this.props.entity.entity_type || ""}
							disabled={true}
						/>
						<FormLine
							label={"VAT Number"}
							value={this.props.entity.vat_number || ""}
							disabled={true}
						/>
						<FormLine
							label={"Website"}
							value={this.props.entity.website || ""}
							disabled={true}
						/>
						<FormLine
							label={"Size"}
							value={this.props.entity.size || ""}
							disabled={true}
						/>
						<FormLine
							label={"Sector"}
							value={this.props.entity.sector || ""}
							disabled={true}
						/>
						<FormLine
							label={"Industry"}
							value={this.props.entity.industry || ""}
							disabled={true}
						/>
						<FormLine
							label={"Primary involvement"}
							value={this.props.entity.involvement || ""}
							disabled={true}
						/>
					</div>

					{(this.state.address !== null && this.state.address !== undefined)
						? <>
							<div className="col-md-12">
								<h2>Address</h2>
							</div>
							<div className="col-md-12">
								<FormLine
									label={"Address Line 1"}
									value={this.state.address.address_1}
									disabled={true}
								/>
								<FormLine
									label={"Address Line 2"}
									value={this.state.address.address_2}
									disabled={true}
								/>
								<FormLine
									label={"Postal Code"}
									value={this.state.address.postal_code}
									disabled={true}
								/>
								<FormLine
									label={"City"}
									value={this.state.address.city}
									disabled={true}
								/>
								<FormLine
									label={"Country"}
									value={this.state.address.country}
									disabled={true}
								/>
							</div>
						</>
						: <>
							<div className="col-md-12">
								<h2>Address</h2>
							</div>
							<div className="col-md-12">
								No address set
							</div>
						</>
					}
					{(this.state.contact !== null && this.state.contact !== undefined)
						? <>
							<div className="col-md-12">
								<h2>Contact</h2>
							</div>
							<div className="col-md-12">
								<FormLine
									label={"Name"}
									value={this.state.contact.name}
									disabled={true}
								/>
								{this.state.contact.type === "EMAIL ADDRESS"
									? <FormLine
										label={"Email Address"}
										value={this.state.contact.value}
										disabled={true}
									/>
									: <FormLine
										label={"Email Address"}
										value={""}
										disabled={true}
									/>
								}
								{this.state.contact.type === "PHONE NUMBER"
									? <FormLine
										label={"Phone Number"}
										value={this.state.contact.value}
										disabled={true}
									/>
									: <FormLine
										label={"Phone Number"}
										value={""}
										disabled={true}
									/>
								}
							</div>
						</>
						: <>
							<div className="col-md-12">
								<h2>Contact</h2>
							</div>
							<div className="col-md-12">
								No contact set
							</div>
						</>
					}
					{/* <div className="col-md-12">
						<h2>Social network</h2>
					</div>

					<div className="col-md-12">
						<FormLine
							label={this.state.fields.linkedin_url}
							value={this.state.entityInfo.linkedin_url}
							onBlur={(v) => this.updateEntity("linkedin_url", v)}
						/>
						<FormLine
							label={this.state.fields.twitter_url}
							value={this.state.entityInfo.twitter_url}
							onBlur={(v) => this.updateEntity("twitter_url", v)}
						/>
						<FormLine
							label={this.state.fields.youtube_url}
							value={this.state.entityInfo.youtube_url}
							onBlur={(v) => this.updateEntity("youtube_url", v)}
						/>
						<FormLine
							label={this.state.fields.discord_url}
							value={this.state.entityInfo.discord_url}
							onBlur={(v) => this.updateEntity("discord_url", v)}
						/>
					</div> */}

					{/* <div className="col-md-12">
						<div className={"right-buttons"}>
							<DialogConfirmation
								text={"Do you want to request modifications for those fields : "
									+ this.getModifiedFields(this.state.entityInfo, this.props.entity) + " ?"}
								trigger={
									<button
										className={"blue-background"}
										disabled={_.isEqual(this.state.entityInfo, this.props.entity)}
									>
										<i className="fas fa-save"/> Request modifications...
									</button>
								}
								afterConfirmation={() => this.submitModificationRequests()}
							/>
							<button
								className={"blue-background"}
								disabled={_.isEqual(this.state.entityInfo, this.props.entity)}
								onClick={() => this.setState({ entityInfo: this.props.entity })}
							>
								<i className="fas fa-undo-alt"/>
							</button>
						</div>
					</div> */}
				</div>
			</div>
		);
	}
}
