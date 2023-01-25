import React from "react";
import "./EntityGlobal.css";
import { NotificationManager as nm } from "react-notifications";
import _ from "lodash";
import FormLine from "../form/FormLine.jsx";
import { postRequest } from "../../utils/request.jsx";
import DialogConfirmation from "../dialog/DialogConfirmation.jsx";
import Loading from "../box/Loading.jsx";
import DialogHint from "../dialog/DialogHint.jsx";

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
				description: "Description",
				trade_register_number: "Trade register number",
				website: "Website",
				creation_date: "Creation date",
				is_startup: "Is startup",
				linkedin_url: "Linkedin URL",
				twitter_url: "Twitter URL",
				youtube_url: "Youtube URL",
				discord_url: "Discord URL",
				github_url: "GitHub URL",
				mastodon_url: "Mastodon URL",
			},
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

					<div className="col-md-3 top-title-menu">
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
					</div>
				</div>

				<div className={"row row-spaced"}>
					<div className="col-md-12">
						<FormLine
							label={this.state.fields.name}
							value={this.state.entityInfo.name}
							onChange={(v) => this.updateEntity("name", v)}
						/>
						<FormLine
							label={this.state.fields.headline}
							value={this.state.entityInfo.headline}
							onChange={(v) => this.updateEntity("headline", v)}
						/>
						<FormLine
							label={this.state.fields.description}
							type={"textarea"}
							value={this.state.entityInfo.description}
							onChange={(v) => this.updateEntity("description", v)}
						/>
						<FormLine
							label={this.state.fields.trade_register_number}
							value={this.state.entityInfo.trade_register_number}
							onChange={(v) => this.updateEntity("trade_register_number", v)}
						/>
						<FormLine
							label={this.state.fields.website}
							value={this.state.entityInfo.website}
							onChange={(v) => this.updateEntity("website", v)}
						/>
						<FormLine
							label={this.state.fields.creation_date}
							type={"date"}
							value={this.state.entityInfo.creation_date}
							onChange={(v) => this.updateEntity("creation_date", v)}
						/>
						<FormLine
							label={this.state.fields.is_startup}
							type={"checkbox"}
							value={this.state.entityInfo.is_startup}
							onChange={(v) => this.updateEntity("is_startup", v)}
							background={false}
						/>
					</div>

					<div className="col-md-12">
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
						<FormLine
							label={this.state.fields.github_url}
							value={this.state.entityInfo.github_url}
							onBlur={(v) => this.updateEntity("github_url", v)}
						/>
						<FormLine
							label={this.state.fields.mastodon_url}
							value={this.state.entityInfo.mastodon_url}
							onBlur={(v) => this.updateEntity("mastodon_url", v)}
						/>
					</div>

					<div className="col-md-12">
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
					</div>
				</div>
			</div>
		);
	}
}
